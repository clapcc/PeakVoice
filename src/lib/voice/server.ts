import { createServerFn } from "@tanstack/react-start";
import { STUDIO_VOICES, voiceById, xaiVoiceFor } from "./catalog";
import { CHUNK_CHARS, MAX_CHARS, splitScript } from "./limits";

export { MAX_CHARS, CHUNK_CHARS, splitScript };

type SynthInput = {
  text: string;
  voiceId: string;
  ratePct: number;
  pitchPct: number;
  language?: string;
  neuralId?: string;
};

type CloneInput = {
  wavBase64: string;
  language: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function mimeOf(buf: Buffer): string {
  if (buf.length >= 4 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    return "audio/wav";
  }
  return "audio/mpeg";
}

async function synthChunk(opts: {
  text: string;
  edgeVoice: string;
  locale: string;
  language: string;
  xaiVoice: string;
  ratePct: number;
  pitchPct: number;
  useXai: boolean;
}): Promise<Buffer> {
  if (opts.useXai) {
    const speed = clamp(1 + opts.ratePct / 100, 0.7, 1.5);
    const { synthesizeXai } = await import("./xai");
    const neural = await synthesizeXai({
      text: opts.text,
      voiceId: opts.xaiVoice,
      language: opts.language,
      speed,
    });
    if (neural?.length) return neural;
  }
  const { synthesizeEdge } = await import("./edge");
  return synthesizeEdge({
    text: opts.text,
    voice: opts.edgeVoice,
    lang: opts.locale,
    ratePct: opts.ratePct,
    pitchPct: opts.pitchPct,
  });
}

export const synthesizeSpeech = createServerFn({ method: "POST" })
  .validator((input: SynthInput) => input)
  .handler(async ({ data }) => {
    const text = (data.text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
    if (text.length < 1) {
      return { ok: false as const, error: "Enter some text to speak." };
    }
    const voice = voiceById(data.voiceId) ?? STUDIO_VOICES[0]!;
    const ratePct = clamp(Number(data.ratePct) || 0, -40, 40);
    const pitchPct = clamp(Number(data.pitchPct) || 0, -35, 35);
    const language = (data.language || voice.lang || "en").slice(0, 8);
    const xaiVoice = data.neuralId?.trim() || xaiVoiceFor(voice.gender);
    const useXai = Boolean(data.neuralId?.trim());
    const chunks = splitScript(text, CHUNK_CHARS);
    try {
      const buffers: Buffer[] = [];
      for (const chunk of chunks) {
        const buf = await synthChunk({
          text: chunk,
          edgeVoice: voice.id,
          locale: voice.locale,
          language,
          xaiVoice,
          ratePct,
          pitchPct,
          useXai,
        });
        if (!buf.length) {
          return { ok: false as const, error: "The voice engine returned empty audio." };
        }
        buffers.push(buf);
      }
      const joined = Buffer.concat(buffers);
      return {
        ok: true as const,
        mime: mimeOf(joined),
        audioBase64: joined.toString("base64"),
        voiceId: voice.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Synthesis failed";
      return { ok: false as const, error: message };
    }
  });

export const createCustomVoice = createServerFn({ method: "POST" })
  .validator((input: CloneInput) => input)
  .handler(async ({ data }) => {
    const raw = (data.wavBase64 ?? "").trim();
    if (!raw) return { ok: false as const };
    try {
      const { createXaiVoice } = await import("./xai");
      const wav = Buffer.from(raw, "base64");
      if (wav.length < 64) return { ok: false as const };
      const voiceId = await createXaiVoice({
        wav,
        language: (data.language || "en").slice(0, 8),
        name: "PeakVoice",
      });
      if (!voiceId) return { ok: false as const };
      return { ok: true as const, voiceId };
    } catch {
      return { ok: false as const };
    }
  });
