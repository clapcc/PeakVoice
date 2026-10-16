import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as xaiVoiceFor, i as STUDIO_VOICES, o as splitScript, r as MAX_CHARS, s as voiceById, t as CHUNK_CHARS } from "./limits-1m5oO2m8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-GcTW-MBY.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function mimeOf(buf) {
	if (buf.length >= 4 && buf[0] === 82 && buf[1] === 73 && buf[2] === 70 && buf[3] === 70) return "audio/wav";
	return "audio/mpeg";
}
async function synthChunk(opts) {
	if (opts.useXai) {
		const speed = clamp(1 + opts.ratePct / 100, .7, 1.5);
		const { synthesizeXai } = await import("./xai-DWUzNNr4.mjs");
		const neural = await synthesizeXai({
			text: opts.text,
			voiceId: opts.xaiVoice,
			language: opts.language,
			speed
		});
		if (neural?.length) return neural;
	}
	const { synthesizeEdge } = await import("./edge-g_yVrMCV.mjs");
	return synthesizeEdge({
		text: opts.text,
		voice: opts.edgeVoice,
		lang: opts.locale,
		ratePct: opts.ratePct,
		pitchPct: opts.pitchPct
	});
}
var synthesizeSpeech_createServerFn_handler = createServerRpc({
	id: "9811a5c2d3cb151df62f5f712f7f9948149a06c5aebfd46fbe07648a8926a9d1",
	name: "synthesizeSpeech",
	filename: "src/lib/voice/server.ts"
}, (opts) => synthesizeSpeech.__executeServer(opts));
var synthesizeSpeech = createServerFn({ method: "POST" }).validator((input) => input).handler(synthesizeSpeech_createServerFn_handler, async ({ data }) => {
	const text = (data.text ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
	if (text.length < 1) return {
		ok: false,
		error: "Enter some text to speak."
	};
	const voice = voiceById(data.voiceId) ?? STUDIO_VOICES[0];
	const ratePct = clamp(Number(data.ratePct) || 0, -40, 40);
	const pitchPct = clamp(Number(data.pitchPct) || 0, -35, 35);
	const language = (data.language || voice.lang || "en").slice(0, 8);
	const xaiVoice = data.neuralId?.trim() || xaiVoiceFor(voice.gender);
	const useXai = Boolean(data.neuralId?.trim());
	const chunks = splitScript(text, CHUNK_CHARS);
	try {
		const buffers = [];
		for (const chunk of chunks) {
			const buf = await synthChunk({
				text: chunk,
				edgeVoice: voice.id,
				locale: voice.locale,
				language,
				xaiVoice,
				ratePct,
				pitchPct,
				useXai
			});
			if (!buf.length) return {
				ok: false,
				error: "The voice engine returned empty audio."
			};
			buffers.push(buf);
		}
		const joined = Buffer.concat(buffers);
		return {
			ok: true,
			mime: mimeOf(joined),
			audioBase64: joined.toString("base64"),
			voiceId: voice.id
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Synthesis failed"
		};
	}
});
var createCustomVoice_createServerFn_handler = createServerRpc({
	id: "0b666dd0e232c488463a5e2529a9c0219b5662215dca4d12a372f7c88e664058",
	name: "createCustomVoice",
	filename: "src/lib/voice/server.ts"
}, (opts) => createCustomVoice.__executeServer(opts));
var createCustomVoice = createServerFn({ method: "POST" }).validator((input) => input).handler(createCustomVoice_createServerFn_handler, async ({ data }) => {
	const raw = (data.wavBase64 ?? "").trim();
	if (!raw) return { ok: false };
	try {
		const { createXaiVoice } = await import("./xai-DWUzNNr4.mjs");
		const wav = Buffer.from(raw, "base64");
		if (wav.length < 64) return { ok: false };
		const voiceId = await createXaiVoice({
			wav,
			language: (data.language || "en").slice(0, 8),
			name: "PeakVoice"
		});
		if (!voiceId) return { ok: false };
		return {
			ok: true,
			voiceId
		};
	} catch {
		return { ok: false };
	}
});
//#endregion
export { createCustomVoice_createServerFn_handler, synthesizeSpeech_createServerFn_handler };
