import { randomUUID } from "node:crypto";
import WebSocket from "ws";
import { EDGE_CLIENT_TOKEN, EDGE_GEC_VERSION, generateSecMsGec } from "./gec";

const ENDPOINTS = [
  {
    url: "wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1",
    key: "Ocp-Apim-Subscription-Key",
  },
  {
    url: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
    key: "TrustedClientToken",
  },
] as const;
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

const WS_HEADERS = {
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
  "Accept-Language": "en-US,en;q=0.9",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const skews = [0, 300, -300];
  let lastError: unknown = null;

  for (const skew of skews) {
    for (const endpoint of ENDPOINTS) {
      const q = new URLSearchParams({
        [endpoint.key]: EDGE_CLIENT_TOKEN,
        "Sec-MS-GEC": generateSecMsGec(Date.now() / 1000 + skew),
        "Sec-MS-GEC-Version": EDGE_GEC_VERSION,
        ConnectionId: connectionId,
      });
      const url = `${endpoint.url}?${q.toString()}`;
      try {
        return await synthesizeOnce(url, ssml, connectionId);
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : "";
        if (message.includes("429")) await sleep(700);
      }
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

    const timer = setTimeout(() => finish(new Error("Voice synthesis timed out")), 40_000);

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
