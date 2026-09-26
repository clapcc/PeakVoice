import { createHash, randomUUID } from "node:crypto";
import WebSocket from "ws";

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WSS_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const SEC_MS_GEC_VERSION = "1-153.0.4234.32";
const WIN_EPOCH = 11_644_473_600;
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

const WS_HEADERS = {
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0",
  "Accept-Language": "en-US,en;q=0.9",
};

function generateSecMsGec(skewSeconds = 0): string {
  const unix = Date.now() / 1000 + skewSeconds;
  const rounded = BigInt(Math.floor((unix + WIN_EPOCH) / 300) * 300);
  const windowsTicks = rounded * 10_000_000n;
  return createHash("sha256")
    .update(`${windowsTicks}${TRUSTED_CLIENT_TOKEN}`)
    .digest("hex")
    .toUpperCase();
}

function rfc1123(date = new Date()): string {
  return date.toUTCString().replace("GMT", "UTC");
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", `\u0026amp;`)
    .replaceAll("<", `\u0026lt;`)
    .replaceAll(">", `\u0026gt;`)
    .replaceAll('"', `\u0026quot;`)
    .replaceAll("'", `\u0026apos;`);
}

function signedPercent(value: number): string {
  const pct = Math.round(value);
  if (pct >= 0) return `+${pct}%`;
  return `${pct}%`;
}

function buildSsml(opts: {
  text: string;
  voice: string;
  lang: string;
  ratePct: number;
  pitchPct: number;
}): string {
  const lang = opts.lang || "en-US";
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"` +
    ` xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}">` +
    `<voice name="${opts.voice}">` +
    `<prosody rate="${signedPercent(opts.ratePct)}" pitch="${signedPercent(opts.pitchPct)}">` +
    `${escapeXml(opts.text)}` +
    `</prosody></voice></speak>`
  );
}

function extractAudioChunk(buf: Buffer): Buffer | null {
  const needle = Buffer.from("Path:audio\r\n");
  const idx = buf.indexOf(needle);
  if (idx < 0) return null;
  const start = idx + needle.length;
  if (start >= buf.length) return null;
  return buf.subarray(start);
}

export type EdgeSynthInput = {
  text: string;
  voice: string;
  lang: string;
  ratePct: number;
  pitchPct: number;
};

export async function synthesizeEdge(input: EdgeSynthInput): Promise<Buffer> {
  const connectionId = randomUUID().replaceAll("-", "");
  const ssml = buildSsml(input);
  const skews = [0, 300, -300, 600, -600];
  let lastError: unknown = null;

  for (const skew of skews) {
    const q = new URLSearchParams({
      TrustedClientToken: TRUSTED_CLIENT_TOKEN,
      "Sec-MS-GEC": generateSecMsGec(skew),
      "Sec-MS-GEC-Version": SEC_MS_GEC_VERSION,
      ConnectionId: connectionId,
    });
    const url = `${WSS_URL}?${q.toString()}`;
    try {
      return await synthesizeOnce(url, ssml, connectionId);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Edge TTS failed");
}

function synthesizeOnce(url: string, ssml: string, requestId: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let settled = false;
    const ws = new WebSocket(url, { headers: WS_HEADERS });

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      if (err) reject(err);
      else resolve(Buffer.concat(chunks));
    };

    const timer = setTimeout(() => finish(new Error("Voice synthesis timed out")), 28_000);

    ws.on("open", () => {
      const ts = rfc1123();
      const config =
        `X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"${OUTPUT_FORMAT}"}}}}`;
      ws.send(config);
      const ssmlMsg =
        `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${ts}\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(ssmlMsg);
    });

    ws.on("message", (data, isBinary) => {
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
      if (!isBinary) {
        const text = buf.toString("utf8");
        if (text.includes("Path:turn.end")) {
          if (chunks.length === 0) finish(new Error("No audio returned"));
          else finish();
        }
        return;
      }
      const audio = extractAudioChunk(buf);
      if (audio && audio.length) chunks.push(Buffer.from(audio));
    });

    ws.on("unexpected-response", (_req, res) => {
      finish(new Error(`Voice engine rejected the request (${res.statusCode})`));
    });

    ws.on("error", () => finish(new Error("Could not reach the voice engine")));
    ws.on("close", () => {
      if (!settled) {
        if (chunks.length) finish();
        else finish(new Error("Voice engine closed early"));
      }
    });
  });
}
