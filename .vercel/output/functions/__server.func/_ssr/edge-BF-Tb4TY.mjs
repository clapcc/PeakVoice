import { t as wrapper_default } from "../_libs/ws.mjs";
import { createHash, randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/edge-BF-Tb4TY.js
var TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
var WSS_URL = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
var SEC_MS_GEC_VERSION = "1-153.0.4234.32";
var WIN_EPOCH = 11644473600;
var OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
var WS_HEADERS = {
	Pragma: "no-cache",
	"Cache-Control": "no-cache",
	Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0",
	"Accept-Language": "en-US,en;q=0.9"
};
function generateSecMsGec(skewSeconds = 0) {
	const unix = Date.now() / 1e3 + skewSeconds;
	const windowsTicks = BigInt(Math.floor((unix + WIN_EPOCH) / 300) * 300) * 10000000n;
	return createHash("sha256").update(`${windowsTicks}${TRUSTED_CLIENT_TOKEN}`).digest("hex").toUpperCase();
}
function rfc1123(date = /* @__PURE__ */ new Date()) {
	return date.toUTCString().replace("GMT", "UTC");
}
function escapeXml(text) {
	return text.replaceAll("&", `\u0026amp;`).replaceAll("<", `\u0026lt;`).replaceAll(">", `\u0026gt;`).replaceAll("\"", `\u0026quot;`).replaceAll("'", `\u0026apos;`);
}
function signedPercent(value) {
	const pct = Math.round(value);
	if (pct >= 0) return `+${pct}%`;
	return `${pct}%`;
}
function buildSsml(opts) {
	return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${opts.lang || "en-US"}"><voice name="${opts.voice}"><prosody rate="${signedPercent(opts.ratePct)}" pitch="${signedPercent(opts.pitchPct)}">${escapeXml(opts.text)}</prosody></voice></speak>`;
}
function extractAudioChunk(buf) {
	const needle = Buffer.from("Path:audio\r\n");
	const idx = buf.indexOf(needle);
	if (idx < 0) return null;
	const start = idx + needle.length;
	if (start >= buf.length) return null;
	return buf.subarray(start);
}
async function synthesizeEdge(input) {
	const connectionId = randomUUID().replaceAll("-", "");
	const ssml = buildSsml(input);
	const skews = [
		0,
		300,
		-300,
		600,
		-600
	];
	let lastError = null;
	for (const skew of skews) {
		const url = `${WSS_URL}?${new URLSearchParams({
			TrustedClientToken: TRUSTED_CLIENT_TOKEN,
			"Sec-MS-GEC": generateSecMsGec(skew),
			"Sec-MS-GEC-Version": SEC_MS_GEC_VERSION,
			ConnectionId: connectionId
		}).toString()}`;
		try {
			return await synthesizeOnce(url, ssml, connectionId);
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("Edge TTS failed");
}
function synthesizeOnce(url, ssml, requestId) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let settled = false;
		const ws = new wrapper_default(url, { headers: WS_HEADERS });
		const finish = (err) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			try {
				ws.close();
			} catch {}
			if (err) reject(err);
			else resolve(Buffer.concat(chunks));
		};
		const timer = setTimeout(() => finish(/* @__PURE__ */ new Error("Voice synthesis timed out")), 28e3);
		ws.on("open", () => {
			const ts = rfc1123();
			const config = `X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"${OUTPUT_FORMAT}"}}}}`;
			ws.send(config);
			const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}\r\nPath:ssml\r\n\r\n${ssml}`;
			ws.send(ssmlMsg);
		});
		ws.on("message", (data, isBinary) => {
			const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
			if (!isBinary) {
				if (buf.toString("utf8").includes("Path:turn.end")) {
					if (chunks.length === 0) finish(/* @__PURE__ */ new Error("No audio returned"));
					else finish();
				}
				return;
			}
			const audio = extractAudioChunk(buf);
			if (audio && audio.length) chunks.push(Buffer.from(audio));
		});
		ws.on("unexpected-response", (_req, res) => {
			finish(/* @__PURE__ */ new Error(`Voice engine rejected the request (${res.statusCode})`));
		});
		ws.on("error", () => finish(/* @__PURE__ */ new Error("Could not reach the voice engine")));
		ws.on("close", () => {
			if (!settled) {
				if (chunks.length) finish();
				else finish(/* @__PURE__ */ new Error("Voice engine closed early"));
			}
		});
	});
}
//#endregion
export { synthesizeEdge };
