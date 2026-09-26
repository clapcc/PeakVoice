import { createServerFn } from "@tanstack/react-start";
import { STUDIO_VOICES, voiceById } from "./catalog";

export const MAX_CHARS = 500;

type SynthInput = {
  text: string;
  voiceId: string;
  ratePct: number;
  pitchPct: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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
    try {
      const { synthesizeEdge } = await import("./edge");
      const buf = await synthesizeEdge({
        text,
        voice: voice.id,
        lang: voice.locale,
        ratePct,
        pitchPct,
      });
      if (!buf.length) {
        return { ok: false as const, error: "The voice engine returned empty audio." };
      }
      return {
        ok: true as const,
        mime: "audio/mpeg",
        audioBase64: buf.toString("base64"),
        voiceId: voice.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Synthesis failed";
      return { ok: false as const, error: message };
    }
  });
