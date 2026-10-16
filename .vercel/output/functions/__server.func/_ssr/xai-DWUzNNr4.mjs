//#region node_modules/.nitro/vite/services/ssr/assets/xai-DWUzNNr4.js
var XAI_TTS = "https://api.x.ai/v1/tts";
var XAI_CLONE = "https://api.x.ai/v1/custom-voices";
var blockedUntil = 0;
function apiKey() {
	return process.env.XAI_API_KEY?.trim() || void 0;
}
function markBlocked() {
	blockedUntil = Date.now() + 6e5;
}
async function synthesizeXai(opts) {
	const key = apiKey();
	if (!key || Date.now() < blockedUntil) return null;
	try {
		const res = await fetch(XAI_TTS, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${key}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				text: opts.text,
				voice_id: opts.voiceId,
				language: opts.language || "auto",
				speed: Math.max(.7, Math.min(1.5, opts.speed))
			})
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
async function createXaiVoice(opts) {
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
			body: form
		});
		if (res.status === 401 || res.status === 403) {
			markBlocked();
			return null;
		}
		if (!res.ok) return null;
		return (await res.json()).voice_id || null;
	} catch {
		return null;
	}
}
//#endregion
export { createXaiVoice, synthesizeXai };
