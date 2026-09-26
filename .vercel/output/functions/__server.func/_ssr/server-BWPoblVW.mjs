import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { i as voiceById, n as STUDIO_VOICES } from "./catalog-4bXJQnxC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-BWPoblVW.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var MAX_CHARS = 500;
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
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
	try {
		const { synthesizeEdge } = await import("./edge-BF-Tb4TY.mjs");
		const buf = await synthesizeEdge({
			text,
			voice: voice.id,
			lang: voice.locale,
			ratePct,
			pitchPct
		});
		if (!buf.length) return {
			ok: false,
			error: "The voice engine returned empty audio."
		};
		return {
			ok: true,
			mime: "audio/mpeg",
			audioBase64: buf.toString("base64"),
			voiceId: voice.id
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Synthesis failed"
		};
	}
});
//#endregion
export { synthesizeSpeech_createServerFn_handler };
