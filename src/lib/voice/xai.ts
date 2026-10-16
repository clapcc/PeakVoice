const XAI_TTS = "https://api.x.ai/v1/tts";
const XAI_CLONE = "https://api.x.ai/v1/custom-voices";

let blockedUntil = 0;

function apiKey(): string | undefined {
  return process.env.XAI_API_KEY?.trim() || undefined;
}

function markBlocked() {
  blockedUntil = Date.now() + 10 * 60 * 1000;
}

export function xaiReady(): boolean {
  return Boolean(apiKey()) && Date.now() >= blockedUntil;
}

export async function synthesizeXai(opts: {
  text: string;
  voiceId: string;
  language: string;
  speed: number;
}): Promise<Buffer | null> {
  const key = apiKey();
  if (!key || Date.now() < blockedUntil) return null;
  try {
    const res = await fetch(XAI_TTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: opts.text,
        voice_id: opts.voiceId,
        language: opts.language || "auto",
        speed: Math.max(0.7, Math.min(1.5, opts.speed)),
      }),
    });
    if (res.status === 401 || res.status === 403) {
      markBlocked();
      return null;
    }
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length ? buf : null;
  } catch {
    return null;
  }
}

export async function createXaiVoice(opts: {
  wav: Buffer;
  language: string;
  name: string;
}): Promise<string | null> {
  const key = apiKey();
  if (!key || Date.now() < blockedUntil) return null;
  try {
    const form = new FormData();
    form.set("name", opts.name);
    form.set("language", opts.language || "en");
    form.set("file", new Blob([new Uint8Array(opts.wav)], { type: "audio/wav" }), "ref.wav");
    const res = await fetch(XAI_CLONE, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (res.status === 401 || res.status === 403) {
      markBlocked();
      return null;
    }
    if (!res.ok) return null;
    const body = (await res.json()) as { voice_id?: string };
    return body.voice_id || null;
  } catch {
    return null;
  }
}

export function isXaiVoiceId(id: string): boolean {
  return /^[a-z0-9]{8}$/i.test(id) || XAI_PRESETS.has(id.toLowerCase());
}

const XAI_PRESETS = new Set([
  "carina",
  "zagan",
  "helix",
  "orion",
  "luna",
  "iris",
  "altair",
  "zenith",
  "perseus",
  "helios",
  "lux",
  "kepler",
  "rigel",
  "cosmo",
  "celeste",
  "ursa",
  "sirius",
  "lumen",
  "castor",
  "naksh",
  "atlas",
  "aurora",
  "liora",
  "ara",
  "eve",
  "leo",
  "rex",
  "sal",
]);
