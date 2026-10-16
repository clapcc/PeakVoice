import { t as wrapper_default } from "../_libs/ws.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/edge-g_yVrMCV.js
var TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
var WIN_EPOCH = 11644473600;
var U32 = 4294967295n;
var SHA256_INITIAL = [
	1779033703n,
	3144134277n,
	1013904242n,
	2773480762n,
	1359893119n,
	2600822924n,
	528734635n,
	1541459225n
];
var SHA256_STATE = [
	4255104674n,
	2435071207n,
	3192492180n,
	3442351626n,
	1811967817n,
	79508907n,
	4272990180n,
	66059218n
];
var SHA256_SCHEDULE = [
	3945054110n,
	358115615n,
	2696978146n,
	217723578n,
	2787307148n,
	3520959633n,
	3235718560n,
	4192668342n,
	4039316851n,
	1884868174n,
	1904797190n,
	15051571n,
	3529027680n,
	1920361828n
];
var SHA256_ROUND_CONSTANTS = [
	1116352408n,
	1899447441n,
	3049323471n,
	3921009573n,
	961987163n,
	1508970993n,
	2453635748n,
	2870763221n,
	3624381080n,
	310598401n,
	607225278n,
	1426881987n,
	1925078388n,
	2162078206n,
	2614888103n,
	3248222580n,
	3835390401n,
	4022224774n,
	264347078n,
	604807628n,
	770255983n,
	1249150122n,
	1555081692n,
	1996064986n,
	2554220882n,
	2821834349n,
	2952996808n,
	3210313671n,
	3336571891n,
	3584528711n,
	113926993n,
	338241895n,
	666307205n,
	773529912n,
	1294757372n,
	1396182291n,
	1695183700n,
	1986661051n,
	2177026350n,
	2456956037n,
	2730485921n,
	2820302411n,
	3259730800n,
	3345764771n,
	3516065817n,
	3600352804n,
	4094571909n,
	275423344n,
	430227734n,
	506948616n,
	659060556n,
	883997877n,
	958139571n,
	1322822218n,
	1537002063n,
	1747873779n,
	1955562222n,
	2024104815n,
	2227730452n,
	2361852424n,
	2428436474n,
	2756734187n,
	3204031479n,
	3329325298n
];
var SHA256_ADJUSTMENT = 3386640039n;
var SHA256_BLOCK_CONSTANTS = [
	...SHA256_ROUND_CONSTANTS.slice(0, 14),
	SHA256_ADJUSTMENT,
	...SHA256_ROUND_CONSTANTS.slice(15)
];
var SHA256_SIGMA0_ADJUSTMENT = 94112640n;
var SHA256_SIGMA1_ADJUSTMENT = 758464n;
var CS64_COEFFICIENTS = [
	[3895366065n, 3005677776n],
	[1155409094n, 2296378653n],
	[1005282748n, 693190712n],
	[3365689651n, 3005795295n],
	[2367603217n, 3557143765n],
	[827258325n, 652566332n],
	[3911487921n, 1618477510n],
	[4037392853n, 2192753147n],
	[101076211n, 4199654362n],
	[3665427040n, 545047652n],
	[3201434976n, 1010595059n],
	[2314848760n, 3536931681n],
	[905590982n, 3137643201n],
	[3410617286n, 3311559015n]
];
var CS64_FACTOR = 2190031155n;
var CS64_ADJUSTMENT0 = 4076407578n;
var CS64_ADJUSTMENT1 = 186253312n;
function u32(n) {
	return n & U32;
}
function rol16(value) {
	const v = u32(value);
	return u32(v << 16n | v >> 16n);
}
function wordsLe4Even(data) {
	const pad = (4 - data.length % 4) % 4;
	const padded = new Uint8Array(data.length + pad);
	padded.set(data);
	const words = [];
	for (let i = 0; i < padded.length; i += 4) words.push(BigInt(padded[i] | padded[i + 1] << 8 | padded[i + 2] << 16 | padded[i + 3] << 24));
	if (words.length % 2) words.push(0n);
	return words;
}
function sigma0(value) {
	return u32(value >> 7n ^ value << 25n ^ value >> 18n ^ value << 14n ^ value >> 3n);
}
function sigma1(value) {
	return u32(value >> 17n ^ value << 15n ^ value >> 19n ^ value << 13n ^ value >> 10n);
}
function sha256Rounds(state, words, firstRound = 0) {
	let a = state[0];
	let b = state[1];
	let c = state[2];
	let d = state[3];
	let e = state[4];
	let f = state[5];
	let g = state[6];
	let h = state[7];
	const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS;
	const aligned = Math.min(64, Math.floor((firstRound + 7) / 8) * 8);
	for (let index = firstRound; index < aligned; index++) {
		const rotE = e * 4294967297n;
		const rotA = a * 4294967297n;
		const t1 = h + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (g ^ e & (f ^ g)) + constants[index] + words[index];
		const nextA = u32(t1 + ((rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (a & b | c & (a | b))));
		const nextE = u32(d + t1);
		h = g;
		g = f;
		f = e;
		e = nextE;
		d = c;
		c = b;
		b = a;
		a = nextA;
	}
	for (let index = aligned; index < 64; index += 8) {
		{
			const rotE = e * 4294967297n;
			const rotA = a * 4294967297n;
			const t1 = h + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (g ^ e & (f ^ g)) + constants[index] + words[index];
			d = u32(d + t1);
			h = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (a & b | c & (a | b)));
		}
		{
			const rotE = d * 4294967297n;
			const rotA = h * 4294967297n;
			const t1 = g + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (f ^ d & (e ^ f)) + constants[index + 1] + words[index + 1];
			c = u32(c + t1);
			g = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (h & a | b & (h | a)));
		}
		{
			const rotE = c * 4294967297n;
			const rotA = g * 4294967297n;
			const t1 = f + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (e ^ c & (d ^ e)) + constants[index + 2] + words[index + 2];
			b = u32(b + t1);
			f = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (g & h | a & (g | h)));
		}
		{
			const rotE = b * 4294967297n;
			const rotA = f * 4294967297n;
			const t1 = e + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (d ^ b & (c ^ d)) + constants[index + 3] + words[index + 3];
			a = u32(a + t1);
			e = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (f & g | h & (f | g)));
		}
		{
			const rotE = a * 4294967297n;
			const rotA = e * 4294967297n;
			const t1 = d + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (c ^ a & (b ^ c)) + constants[index + 4] + words[index + 4];
			h = u32(h + t1);
			d = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (e & f | g & (e | f)));
		}
		{
			const rotE = h * 4294967297n;
			const rotA = d * 4294967297n;
			const t1 = c + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (b ^ h & (a ^ b)) + constants[index + 5] + words[index + 5];
			g = u32(g + t1);
			c = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (d & e | f & (d | e)));
		}
		{
			const rotE = g * 4294967297n;
			const rotA = c * 4294967297n;
			const t1 = b + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (a ^ g & (h ^ a)) + constants[index + 6] + words[index + 6];
			f = u32(f + t1);
			b = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (c & d | e & (c | d)));
		}
		{
			const rotE = f * 4294967297n;
			const rotA = b * 4294967297n;
			const t1 = a + (rotE >> 6n ^ rotE >> 11n ^ rotE >> 25n) + (h ^ f & (g ^ h)) + constants[index + 7] + words[index + 7];
			e = u32(e + t1);
			a = u32(t1 + (rotA >> 2n ^ rotA >> 13n ^ rotA >> 22n) + (b & c | d & (b | c)));
		}
	}
	return [
		a,
		b,
		c,
		d,
		e,
		f,
		g,
		h
	];
}
function expandSha256Schedule(words, firstWord = 16) {
	for (let index = firstWord; index < 64; index++) {
		const x = words[index - 2];
		const y = words[index - 15];
		const s1 = x >> 17n ^ x << 15n ^ x >> 19n ^ x << 13n ^ x >> 10n;
		const s0 = y >> 7n ^ y << 25n ^ y >> 18n ^ y << 14n ^ y >> 3n;
		words.push(u32(s1 + words[index - 7] + s0 + words[index - 16]));
	}
}
function readBe(data, start, len) {
	let n = 0n;
	for (let i = 0; i < len; i++) n = n << 8n | BigInt(data[start + i] ?? 0);
	return n;
}
var cachedInit = null;
var cachedInitKey = "";
function sha256Init(data) {
	const key = Buffer.from(data.subarray(0, 7)).toString("hex");
	if (cachedInit && cachedInitKey === key) return cachedInit;
	const words = Array.from({ length: 14 }, () => 0n);
	words.push(readBe(data, 0, 3));
	words.push(readBe(data, 3, 4));
	for (let index = 16; index < 30; index++) {
		let value = SHA256_SCHEDULE[index - 16];
		if (index - 2 >= 14) value += index === 16 ? sigma1(words[index - 2]) ^ SHA256_SIGMA1_ADJUSTMENT : sigma1(words[index - 2]);
		if (index - 7 >= 14) value += words[index - 7];
		if (index - 15 >= 14) value += index === 29 ? sigma0(words[index - 15]) ^ SHA256_SIGMA0_ADJUSTMENT : sigma0(words[index - 15]);
		words.push(u32(value));
	}
	words.push(u32(sigma1(words[28]) + words[23] + sigma0(words[15]) + words[14] + SHA256_ADJUSTMENT - SHA256_ROUND_CONSTANTS[14]));
	expandSha256Schedule(words, 31);
	const working = sha256Rounds(SHA256_STATE, words, 14);
	cachedInit = SHA256_INITIAL.map((x, i) => u32(x + working[i]));
	cachedInitKey = key;
	return cachedInit;
}
function sha256Digest(data) {
	if (data.length < 7) throw new Error("Token salt must contain at least seven bytes");
	const length = 57 + data.length;
	const padBytes = ((55 - length) % 64 % 64 + 64) % 64;
	const tail = data.subarray(7);
	const padded = new Uint8Array(tail.length + 1 + padBytes + 8);
	padded.set(tail);
	padded[tail.length] = 128;
	const bitLen = BigInt(length) * 8n;
	for (let i = 0; i < 8; i++) padded[padded.length - 1 - i] = Number(bitLen >> BigInt(i * 8) & 255n);
	let state = sha256Init(data);
	for (let offset = 0; offset < padded.length; offset += 64) {
		const words = [];
		for (let i = 0; i < 16; i++) words.push(readBe(padded, offset + i * 4, 4));
		expandSha256Schedule(words);
		const working = sha256Rounds(state, words);
		state = state.map((x, i) => u32(x + working[i]));
	}
	const out = /* @__PURE__ */ new Uint8Array(32);
	state.forEach((word, i) => {
		out[i * 4] = Number(word >> 24n & 255n);
		out[i * 4 + 1] = Number(word >> 16n & 255n);
		out[i * 4 + 2] = Number(word >> 8n & 255n);
		out[i * 4 + 3] = Number(word & 255n);
	});
	return out;
}
function cs64Digest(data, digest) {
	let keyA = BigInt(digest[0] | digest[1] << 8 | digest[2] << 16 | digest[3] << 24);
	let keyB = BigInt(digest[4] | digest[5] << 8 | digest[6] << 16 | digest[7] << 24);
	keyA |= 1n;
	keyB |= 1n;
	const factors = [u32(keyA * CS64_FACTOR), u32(keyB * CS64_FACTOR)];
	const terms = CS64_COEFFICIENTS.map(([coefficient], index) => u32(coefficient * factors[index % 2]));
	const offsets = CS64_COEFFICIENTS.map(([, offset]) => offset);
	const prefix = new Uint8Array(data.length + 1);
	prefix.set(data, 1);
	wordsLe4Even(prefix).forEach((word, index) => {
		let term = word * (index % 2 === 0 ? keyA : keyB);
		let offset = rol16(word) * (index % 2 === 0 ? 4010109435n : 3273069531n);
		if (index === 0) {
			term += CS64_ADJUSTMENT0 * factors[0];
			offset += CS64_ADJUSTMENT1;
		}
		terms.push(u32(term));
		offsets.push(u32(offset));
	});
	let swapAcc = 0n;
	let swapLast = 0n;
	let state = 0n;
	let acc = 0n;
	for (let index = 0; index < terms.length; index += 2) {
		const x = terms[index];
		const y = terms[index + 1];
		let t = rol16(u32(offsets[index] + x));
		let q = u32(t * 1995771700n);
		swapAcc += u32(rol16(q) * 3287280279n + q);
		t = rol16(u32(offsets[index + 1] + y));
		q = u32(t * 411160124n);
		swapLast = u32(rol16(q) * 901586633n + q);
		swapAcc = u32(swapAcc + swapLast);
		state = u32(state * keyA + x);
		state = u32(rol16(state) * 3482890513n);
		state = u32(rol16(state) * 2265471903n);
		state = u32(rol16(state) * 315537773n);
		state = u32(rol16(state) * 629022083n);
		acc += state;
		t = u32(state * keyB + y);
		t = u32(rol16(t) * 2725517045n);
		t = u32(rol16(t) * 3548616447n);
		state = u32(rol16(u32(rol16(t) * 2090019721n)) * 3215236969n);
		acc = u32(acc + state);
	}
	return [swapLast ^ state, swapAcc ^ acc];
}
function tokenHash(data) {
	const digest = sha256Digest(data);
	const [a, b] = cs64Digest(data, digest);
	const aw = Number(u32(a));
	const bw = Number(u32(b));
	const le = Uint8Array.from([
		aw & 255,
		aw >> 8 & 255,
		aw >> 16 & 255,
		aw >> 24 & 255,
		bw & 255,
		bw >> 8 & 255,
		bw >> 16 & 255,
		bw >> 24 & 255
	]);
	return [Buffer.from(le).toString("hex").toUpperCase(), Buffer.from(digest).toString("hex").toUpperCase()];
}
var EDGE_CLIENT_TOKEN = TRUSTED_CLIENT_TOKEN;
var EDGE_GEC_VERSION = "2-143.0.3650.75";
function generateSecMsGec(unixSeconds = Date.now() / 1e3) {
	let ticks = unixSeconds + WIN_EPOCH;
	ticks -= ticks % 300;
	ticks *= 1e7;
	const stamp = Math.round(ticks).toString();
	const [cs64, sha] = tokenHash(Buffer.from(`${stamp}${TRUSTED_CLIENT_TOKEN}`, "ascii"));
	return `${cs64}-${sha}`;
}
var ENDPOINTS = [{
	url: "wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1",
	key: "Ocp-Apim-Subscription-Key"
}, {
	url: "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",
	key: "TrustedClientToken"
}];
var OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
var WS_HEADERS = {
	Pragma: "no-cache",
	"Cache-Control": "no-cache",
	Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
	"Accept-Language": "en-US,en;q=0.9"
};
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
		-300
	];
	let lastError = null;
	for (const skew of skews) for (const endpoint of ENDPOINTS) {
		const q = new URLSearchParams({
			[endpoint.key]: EDGE_CLIENT_TOKEN,
			"Sec-MS-GEC": generateSecMsGec(Date.now() / 1e3 + skew),
			"Sec-MS-GEC-Version": EDGE_GEC_VERSION,
			ConnectionId: connectionId
		});
		const url = `${endpoint.url}?${q.toString()}`;
		try {
			return await synthesizeOnce(url, ssml, connectionId);
		} catch (err) {
			lastError = err;
			if ((err instanceof Error ? err.message : "").includes("429")) await sleep(700);
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
		const timer = setTimeout(() => finish(/* @__PURE__ */ new Error("Voice synthesis timed out")), 4e4);
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
