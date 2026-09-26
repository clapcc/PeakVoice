import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, c as Languages, i as Square, l as Download, n as Upload, o as Pause, s as Mic, t as Volume2 } from "../_libs/lucide-react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as voiceById, n as STUDIO_VOICES, r as pickCloneVoice, t as DEFAULT_VOICE_ID } from "./catalog-4bXJQnxC.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BcmmeCsd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[transform,background-color,box-shadow,opacity,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_24px_rgba(0,0,0,0.28)] hover:bg-accent/90",
			glass: "bg-glass text-fg shadow-[var(--shadow-border)] hover:bg-glass-strong",
			ghost: "bg-transparent text-fg-muted hover:bg-glass hover:text-fg",
			danger: "bg-danger text-accent-fg hover:bg-danger/90"
		},
		size: {
			sm: "h-10 px-3.5",
			md: "h-11 px-5",
			lg: "h-12 px-6 text-[0.9375rem]",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
var COPY = {
	en: {
		brand: "Nila",
		tagline: "Clone a voice. Speak anything.",
		kicker: "Free voice studio",
		cloneTitle: "Your voice",
		cloneHint: "Record 6–20 seconds of clear speech, or upload a clip. Audio stays on this device.",
		record: "Record",
		stop: "Stop",
		upload: "Upload",
		reRecord: "Replace sample",
		listening: "Listening",
		analyzing: "Reading the voice",
		cloneReady: "Clone ready",
		needConsent: "Confirm you have the right to use this voice.",
		consent: "I have permission to clone this voice.",
		seconds: "s",
		scriptTitle: "Script",
		scriptHint: "Write in Myanmar, English, or another supported language.",
		placeholder: "Type the words you want spoken…",
		generate: "Generate speech",
		generating: "Speaking",
		download: "Download",
		play: "Play",
		pause: "Pause",
		studioVoices: "Studio voices",
		useClone: "Use my clone",
		usingClone: "Speaking with your clone",
		speed: "Pace",
		timbre: "Timbre match",
		detected: "Detected",
		history: "Recent",
		emptyPlayer: "Generate speech to hear it here.",
		micDenied: "Microphone blocked. Upload a clip instead.",
		tooShort: "Need at least 3 seconds of speech.",
		tooLong: "Trimmed to the first 20 seconds.",
		chars: "characters",
		sampleEn: "Insert sample",
		footer: "Free to use. Clone only voices you have the right to use.",
		privacy: "Reference audio never leaves your device.",
		error: "Could not generate speech. Try again.",
		readyHint: "A neural voice is matched to your pitch, then timbre is blended in.",
		female: "Female",
		male: "Male",
		hz: "Hz",
		noClone: "Pick a studio voice, or clone yours first."
	},
	my: {
		brand: "Nila",
		tagline: "အသံကူးယူပြီး စာသားကို ပြောခိုင်းပါ။",
		kicker: "အခမဲ့ အသံစတူဒီယို",
		cloneTitle: "သင့်အသံ",
		cloneHint: "ကြည်လင်သော စကား ၆–၂၀ စက္ကန့် သွင်းပါ သို့မဟုတ် ဖိုင်တင်ပါ။ အသံဖိုင်သည် ဤစက်ထဲမှာပဲ ရှိနေပါသည်။",
		record: "အသံသွင်းရန်",
		stop: "ရပ်ရန်",
		upload: "ဖိုင်တင်ရန်",
		reRecord: "နမူနာ အသစ်တင်ရန်",
		listening: "နားထောင်နေသည်",
		analyzing: "အသံကို ဖတ်နေသည်",
		cloneReady: "ကူးယူပြီးပါပြီ",
		needConsent: "ဤအသံကို အသုံးပြုခွင့်ရှိကြောင်း အတည်ပြုပါ။",
		consent: "ဤအသံကို ကူးယူရန် ခွင့်ပြုချက် ရှိပါသည်။",
		seconds: "စက္ကန့်",
		scriptTitle: "စာသား",
		scriptHint: "မြန်မာ၊ အင်္ဂလိပ် သို့မဟုတ် အခြားဘာသာဖြင့် ရေးပါ။",
		placeholder: "ပြောချင်သော စကားလုံးများကို ရိုက်ပါ…",
		generate: "အသံထုတ်ရန်",
		generating: "ပြောနေသည်",
		download: "ဒေါင်းလုဒ်",
		play: "ဖွင့်ရန်",
		pause: "ခဏရပ်",
		studioVoices: "စတူဒီယို အသံများ",
		useClone: "ကျွန်ုပ်၏ အသံကူး",
		usingClone: "သင့်အသံကူးဖြင့် ပြောနေသည်",
		speed: "အမြန်နှုန်း",
		timbre: "အသံသြဇာ",
		detected: "တွေ့ရှိ",
		history: "မကြာသေးမီ",
		emptyPlayer: "အသံထုတ်ပြီး ဤနေရာတွင် နားဆင်ပါ။",
		micDenied: "မိုက်ခရိုဖုန်း ပိတ်ထားသည်။ ဖိုင်တင်ပါ။",
		tooShort: "အနည်းဆုံး ၃ စက္ကန့် လိုအပ်သည်။",
		tooLong: "ပထမ ၂၀ စက္ကန့်အထိ ဖြတ်လိုက်သည်။",
		chars: "စာလုံး",
		sampleEn: "နမူနာထည့်ရန်",
		footer: "အခမဲ့ အသုံးပြုနိုင်သည်။ ခွင့်ပြုချက်ရှိသော အသံကိုသာ ကူးယူပါ။",
		privacy: "နမူနာအသံသည် သင့်စက်မှ ထွက်မသွားပါ။",
		error: "အသံမထုတ်နိုင်ပါ။ ထပ်မံကြိုးစားပါ။",
		readyHint: "သင့်အသံ၏ လှိုင်းနှုန်းနှင့် နီးသော အသံကို ရွေးပြီး အရောင်တင်ပေးသည်။",
		female: "အမျိုးသမီး",
		male: "အမျိုးသား",
		hz: "Hz",
		noClone: "စတူဒီယိုအသံ ရွေးပါ၊ သို့မဟုတ် အရင်ကူးယူပါ။"
	}
};
var SCRIPT_RULES = [
	{
		re: /[\u1000-\u109F\uAA60-\uAA7F\uA9E0-\uA9FF]/,
		lang: "my",
		locale: "my-MM",
		label: "Myanmar",
		labelMy: "မြန်မာ"
	},
	{
		re: /[\u3040-\u30FF]/,
		lang: "ja",
		locale: "ja-JP",
		label: "Japanese",
		labelMy: "ဂျပန်"
	},
	{
		re: /[\uAC00-\uD7AF]/,
		lang: "ko",
		locale: "ko-KR",
		label: "Korean",
		labelMy: "ကိုရီးယား"
	},
	{
		re: /[\u4E00-\u9FFF]/,
		lang: "zh",
		locale: "zh-CN",
		label: "Chinese",
		labelMy: "တရုတ်"
	},
	{
		re: /[\u0900-\u097F]/,
		lang: "hi",
		locale: "hi-IN",
		label: "Hindi",
		labelMy: "ဟိန္ဒီ"
	},
	{
		re: /[\u0E00-\u0E7F]/,
		lang: "th",
		locale: "th-TH",
		label: "Thai",
		labelMy: "ထိုင်း"
	},
	{
		re: /[\u0600-\u06FF]/,
		lang: "ar",
		locale: "ar-SA",
		label: "Arabic",
		labelMy: "အာရဗီ"
	},
	{
		re: /[\u0400-\u04FF]/,
		lang: "ru",
		locale: "ru-RU",
		label: "Russian",
		labelMy: "ရုရှ"
	}
];
function detectLang(text) {
	for (const rule of SCRIPT_RULES) if (rule.re.test(text)) return {
		lang: rule.lang,
		locale: rule.locale,
		label: rule.label,
		labelMy: rule.labelMy
	};
	return {
		lang: "en",
		locale: "en-US",
		label: "English",
		labelMy: "အင်္ဂလိပ်"
	};
}
var EPS = 1e-8;
var ENV_BINS = 48;
function encodeWav(samples, sampleRate) {
	const n = samples.length;
	const buffer = /* @__PURE__ */ new ArrayBuffer(44 + n * 2);
	const view = new DataView(buffer);
	writeStr(view, 0, "RIFF");
	view.setUint32(4, 36 + n * 2, true);
	writeStr(view, 8, "WAVE");
	writeStr(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeStr(view, 36, "data");
	view.setUint32(40, n * 2, true);
	let offset = 44;
	for (let i = 0; i < n; i++) {
		const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
		view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
		offset += 2;
	}
	return new Blob([buffer], { type: "audio/wav" });
}
function writeStr(view, offset, str) {
	for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
function mixToMono(buffer) {
	const ch0 = buffer.getChannelData(0);
	if (buffer.numberOfChannels === 1) return new Float32Array(ch0);
	const out = new Float32Array(buffer.length);
	const n = buffer.numberOfChannels;
	for (let c = 0; c < n; c++) {
		const ch = buffer.getChannelData(c);
		for (let i = 0; i < buffer.length; i++) out[i] += ch[i] ?? 0;
	}
	for (let i = 0; i < out.length; i++) out[i] /= n;
	return out;
}
function trimSilence(samples, sampleRate) {
	const thresh = .012;
	let start = 0;
	let end = samples.length - 1;
	while (start < end && Math.abs(samples[start] ?? 0) < thresh) start++;
	while (end > start && Math.abs(samples[end] ?? 0) < thresh) end--;
	const pad = Math.floor(sampleRate * .04);
	start = Math.max(0, start - pad);
	end = Math.min(samples.length, end + pad);
	return samples.subarray(start, end);
}
function downsample(samples, fromRate, toRate) {
	if (fromRate === toRate) return samples;
	const ratio = fromRate / toRate;
	const length = Math.max(1, Math.floor(samples.length / ratio));
	const out = new Float32Array(length);
	for (let i = 0; i < length; i++) {
		const x = i * ratio;
		const i0 = Math.floor(x);
		const i1 = Math.min(samples.length - 1, i0 + 1);
		const t = x - i0;
		out[i] = (samples[i0] ?? 0) * (1 - t) + (samples[i1] ?? 0) * t;
	}
	return out;
}
async function decodeToBuffer(blob) {
	const ctx = new AudioContext();
	try {
		const arr = await blob.arrayBuffer();
		return await ctx.decodeAudioData(arr.slice(0));
	} finally {
		ctx.close();
	}
}
function yinF0(samples, sampleRate) {
	const minF = 70;
	const tauMin = Math.floor(sampleRate / 380);
	const tauMax = Math.min(Math.floor(sampleRate / minF), Math.floor(samples.length / 3));
	const frame = Math.min(samples.length, Math.floor(sampleRate * .04));
	const hop = Math.floor(frame / 2);
	const f0s = [];
	const diff = new Float32Array(tauMax + 1);
	const cmnd = new Float32Array(tauMax + 1);
	for (let pos = 0; pos + frame + tauMax < samples.length; pos += hop) {
		diff.fill(0);
		for (let tau = 1; tau <= tauMax; tau++) {
			let sum = 0;
			for (let i = 0; i < frame; i++) {
				const d = (samples[pos + i] ?? 0) - (samples[pos + i + tau] ?? 0);
				sum += d * d;
			}
			diff[tau] = sum;
		}
		cmnd[0] = 1;
		let run = 0;
		for (let tau = 1; tau <= tauMax; tau++) {
			run += diff[tau] ?? 0;
			cmnd[tau] = (diff[tau] ?? 0) * tau / (run || 1);
		}
		let tau = tauMin;
		let found = -1;
		for (; tau < tauMax; tau++) if ((cmnd[tau] ?? 1) < .15) {
			while (tau + 1 < tauMax && (cmnd[tau + 1] ?? 1) < (cmnd[tau] ?? 1)) tau++;
			found = tau;
			break;
		}
		if (found > 0) {
			const s0 = cmnd[found - 1] ?? 0;
			const s1 = cmnd[found] ?? 0;
			const s2 = cmnd[found + 1] ?? 0;
			const denom = 2 * (s0 - 2 * s1 + s2);
			const shift = denom === 0 ? 0 : (s0 - s2) / denom;
			f0s.push(sampleRate / (found + shift));
		}
	}
	if (!f0s.length) return 160;
	f0s.sort((a, b) => a - b);
	return f0s[Math.floor(f0s.length / 2)] ?? 160;
}
function spectralCentroid(samples, sampleRate) {
	const n = 1024;
	const hop = 512;
	let num = 0;
	let den = 0;
	const re = new Float32Array(n);
	const im = new Float32Array(n);
	for (let pos = 0; pos + n < samples.length; pos += hop) {
		re.fill(0);
		im.fill(0);
		for (let i = 0; i < n; i++) {
			const w = .5 - .5 * Math.cos(2 * Math.PI * i / 1023);
			re[i] = (samples[pos + i] ?? 0) * w;
		}
		fft(re, im, false);
		const bins = n / 2;
		for (let k = 1; k < bins; k++) {
			const mag = Math.hypot(re[k] ?? 0, im[k] ?? 0);
			const freq = k * sampleRate / n;
			num += freq * mag;
			den += mag;
		}
	}
	return den > EPS ? num / den : 1800;
}
function meanEnvelope(samples) {
	const n = 1024;
	const hop = 512;
	const half = n / 2;
	const acc = new Float64Array(half);
	let frames = 0;
	const re = new Float32Array(n);
	const im = new Float32Array(n);
	for (let pos = 0; pos + n < samples.length; pos += hop) {
		re.fill(0);
		im.fill(0);
		for (let i = 0; i < n; i++) {
			const w = .5 - .5 * Math.cos(2 * Math.PI * i / 1023);
			re[i] = (samples[pos + i] ?? 0) * w;
		}
		fft(re, im, false);
		for (let k = 0; k < half; k++) acc[k] += Math.log(Math.hypot(re[k] ?? 0, im[k] ?? 0) + EPS);
		frames++;
	}
	if (!frames) return new Array(ENV_BINS).fill(0);
	const env = [];
	const group = Math.floor(half / ENV_BINS);
	for (let b = 0; b < ENV_BINS; b++) {
		let s = 0;
		for (let k = 0; k < group; k++) s += acc[b * group + k] ?? 0;
		env.push(s / (group * frames));
	}
	const mean = env.reduce((a, v) => a + v, 0) / env.length;
	return env.map((v) => v - mean);
}
function analyzeSamples(samples, sampleRate) {
	const mono = trimSilence(samples, sampleRate);
	const work = downsample(mono, sampleRate, 16e3);
	const f0 = yinF0(work, 16e3);
	const gender = f0 >= 165 ? "female" : "male";
	let rms = 0;
	for (let i = 0; i < work.length; i++) rms += (work[i] ?? 0) ** 2;
	rms = Math.sqrt(rms / Math.max(1, work.length));
	return {
		f0,
		gender,
		centroid: spectralCentroid(work, 16e3),
		rms,
		duration: mono.length / sampleRate,
		envelope: meanEnvelope(work)
	};
}
async function analyzeBlob(blob) {
	const buffer = await decodeToBuffer(blob);
	const samples = mixToMono(buffer);
	const maxSamples = Math.floor(buffer.sampleRate * 20);
	const clipped = samples.length > maxSamples ? samples.subarray(0, maxSamples) : samples;
	return {
		profile: analyzeSamples(clipped, buffer.sampleRate),
		samples: clipped,
		sampleRate: buffer.sampleRate
	};
}
async function applyTimbre(mp3Blob, envelope, blend) {
	const amount = Math.max(0, Math.min(1, blend));
	if (amount < .05 || envelope.length < 8) return mp3Blob;
	const buffer = await decodeToBuffer(mp3Blob);
	return encodeWav(morphEnvelope(mixToMono(buffer), envelope, amount), buffer.sampleRate);
}
function morphEnvelope(samples, refEnv, blend) {
	const n = 1024;
	const hop = 512;
	const half = n / 2;
	const out = new Float32Array(samples.length);
	const window = new Float32Array(n);
	for (let i = 0; i < n; i++) window[i] = .5 - .5 * Math.cos(2 * Math.PI * i / 1023);
	const re = new Float32Array(n);
	const im = new Float32Array(n);
	const ola = new Float32Array(samples.length + n);
	const winSum = new Float32Array(samples.length + n);
	const group = Math.floor(half / ENV_BINS);
	for (let pos = 0; pos + n <= samples.length; pos += hop) {
		for (let i = 0; i < n; i++) {
			re[i] = (samples[pos + i] ?? 0) * (window[i] ?? 0);
			im[i] = 0;
		}
		fft(re, im, false);
		const srcEnv = new Array(ENV_BINS).fill(0);
		for (let b = 0; b < ENV_BINS; b++) {
			let s = 0;
			for (let k = 0; k < group; k++) {
				const idx = b * group + k;
				s += Math.log(Math.hypot(re[idx] ?? 0, im[idx] ?? 0) + EPS);
			}
			srcEnv[b] = s / group;
		}
		const srcMean = srcEnv.reduce((a, v) => a + v, 0) / ENV_BINS;
		for (let b = 0; b < ENV_BINS; b++) srcEnv[b] -= srcMean;
		for (let b = 0; b < ENV_BINS; b++) {
			const target = (srcEnv[b] ?? 0) * (1 - blend) + (refEnv[b] ?? 0) * blend;
			const gain = Math.exp(target - (srcEnv[b] ?? 0));
			const g = Math.max(.35, Math.min(2.6, gain));
			for (let k = 0; k < group; k++) {
				const idx = b * group + k;
				re[idx] = (re[idx] ?? 0) * g;
				im[idx] = (im[idx] ?? 0) * g;
			}
		}
		fft(re, im, true);
		for (let i = 0; i < n; i++) {
			const w = window[i] ?? 0;
			ola[pos + i] += (re[i] ?? 0) * w;
			winSum[pos + i] += w * w;
		}
	}
	for (let i = 0; i < samples.length; i++) {
		const d = winSum[i] ?? 0;
		out[i] = d > EPS ? (ola[i] ?? 0) / d : samples[i] ?? 0;
	}
	let peak = EPS;
	for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i] ?? 0));
	const norm = peak > .98 ? .98 / peak : 1;
	if (norm !== 1) for (let i = 0; i < out.length; i++) out[i] *= norm;
	return out;
}
function fft(re, im, invert) {
	const n = re.length;
	for (let i = 1, j = 0; i < n; i++) {
		let bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) {
			const tr = re[i] ?? 0;
			re[i] = re[j] ?? 0;
			re[j] = tr;
			const ti = im[i] ?? 0;
			im[i] = im[j] ?? 0;
			im[j] = ti;
		}
	}
	for (let len = 2; len <= n; len <<= 1) {
		const ang = (invert ? 2 : -2) * Math.PI / len;
		const wlenRe = Math.cos(ang);
		const wlenIm = Math.sin(ang);
		for (let i = 0; i < n; i += len) {
			let wRe = 1;
			let wIm = 0;
			for (let j = 0; j < len / 2; j++) {
				const uRe = re[i + j] ?? 0;
				const uIm = im[i + j] ?? 0;
				const vRe = (re[i + j + len / 2] ?? 0) * wRe - (im[i + j + len / 2] ?? 0) * wIm;
				const vIm = (re[i + j + len / 2] ?? 0) * wIm + (im[i + j + len / 2] ?? 0) * wRe;
				re[i + j] = uRe + vRe;
				im[i + j] = uIm + vIm;
				re[i + j + len / 2] = uRe - vRe;
				im[i + j + len / 2] = uIm - vIm;
				const nRe = wRe * wlenRe - wIm * wlenIm;
				wIm = wRe * wlenIm + wIm * wlenRe;
				wRe = nRe;
			}
		}
	}
	if (invert) for (let i = 0; i < n; i++) {
		re[i] = (re[i] ?? 0) / n;
		im[i] = (im[i] ?? 0) / n;
	}
}
function base64ToBlob(b64, mime) {
	const bin = atob(b64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return new Blob([bytes], { type: mime });
}
var KEY = "nila-quota-v1";
var DAILY_LIMIT = 40;
function today() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function read() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return {
			day: today(),
			count: 0
		};
		const parsed = JSON.parse(raw);
		if (parsed.day !== today()) return {
			day: today(),
			count: 0
		};
		return parsed;
	} catch {
		return {
			day: today(),
			count: 0
		};
	}
}
function remainingToday() {
	return Math.max(0, DAILY_LIMIT - read().count);
}
function takeQuota() {
	const q = read();
	if (q.count >= DAILY_LIMIT) return false;
	q.count += 1;
	localStorage.setItem(KEY, JSON.stringify(q));
	return true;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var synthesizeSpeech = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("9811a5c2d3cb151df62f5f712f7f9948149a06c5aebfd46fbe07648a8926a9d1"));
function Glass({ className, children }) {
	const ref = import_react.useRef(null);
	const onMove = (e) => {
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		el.style.setProperty("--mx", `${e.clientX - r.left}px`);
		el.style.setProperty("--my", `${e.clientY - r.top}px`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		onMouseMove: onMove,
		className: cn("glass", className),
		children
	});
}
function PeakWave({ peaks, progress, className }) {
	const bars = peaks.length ? peaks : Array.from({ length: 48 }, () => .12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-10 items-center gap-px", className),
		"aria-hidden": true,
		children: bars.map((p, i) => {
			const on = i / Math.max(1, bars.length - 1) <= progress;
			const h = 8 + p * 28;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("w-full rounded-full transition-colors duration-[var(--motion-quick)]", on ? "bg-accent" : "bg-fg/20"),
				style: { height: `${h}px` }
			}, i);
		})
	});
}
function extractPeaks(samples, count = 56) {
	if (!samples.length) return [];
	const size = Math.floor(samples.length / count) || 1;
	const peaks = [];
	for (let i = 0; i < count; i++) {
		let max = 0;
		const start = i * size;
		for (let j = 0; j < size; j++) max = Math.max(max, Math.abs(samples[start + j] ?? 0));
		peaks.push(Math.min(1, max * 1.6));
	}
	return peaks;
}
var SAMPLES = {
	en: "The rain on the glass is almost music. Stay with me a little longer.",
	my: "မှန်သားပေါ်က မိုးစက်တွေက သီချင်းလိုပါပဲ။ နည်းနည်းပိုနေပါဦး။"
};
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function Studio() {
	const [locale, setLocale] = import_react.useState("en");
	const t = COPY[locale];
	const [consent, setConsent] = import_react.useState(false);
	const [recording, setRecording] = import_react.useState(false);
	const [recSeconds, setRecSeconds] = import_react.useState(0);
	const [analyzing, setAnalyzing] = import_react.useState(false);
	const [clone, setClone] = import_react.useState(null);
	const [useClone, setUseClone] = import_react.useState(true);
	const [script, setScript] = import_react.useState("");
	const [speed, setSpeed] = import_react.useState(1);
	const [timbre, setTimbre] = import_react.useState(.42);
	const [voiceId, setVoiceId] = import_react.useState(DEFAULT_VOICE_ID);
	const [generating, setGenerating] = import_react.useState(false);
	const [audioUrl, setAudioUrl] = import_react.useState(null);
	const [playing, setPlaying] = import_react.useState(false);
	const [progress, setProgress] = import_react.useState(0);
	const [peaks, setPeaks] = import_react.useState([]);
	const [history, setHistory] = import_react.useState([]);
	const [liveLevels, setLiveLevels] = import_react.useState(() => Array(28).fill(.08));
	const recorderRef = import_react.useRef(null);
	const chunksRef = import_react.useRef([]);
	const recTimerRef = import_react.useRef(null);
	const recStartedRef = import_react.useRef(0);
	const audioRef = import_react.useRef(null);
	const rafRef = import_react.useRef(null);
	const fileRef = import_react.useRef(null);
	const analyserRef = import_react.useRef(null);
	const streamRef = import_react.useRef(null);
	import_react.useEffect(() => {
		try {
			const saved = localStorage.getItem("nila-locale");
			if (saved === "my" || saved === "en") setLocale(saved);
			else if (navigator.language.toLowerCase().startsWith("my")) setLocale("my");
		} catch {}
	}, []);
	import_react.useEffect(() => {
		try {
			localStorage.setItem("nila-locale", locale);
		} catch {}
		document.documentElement.lang = locale === "my" ? "my" : "en";
	}, [locale]);
	import_react.useEffect(() => {
		return () => {
			stopRecording(true);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			if (audioUrl) URL.revokeObjectURL(audioUrl);
		};
	}, []);
	const detected = detectLang(script);
	const selected = voiceById(voiceId) ?? STUDIO_VOICES[0];
	function setUiLocale(next) {
		setLocale(next);
	}
	async function ingestBlob(blob) {
		setAnalyzing(true);
		try {
			const { profile } = await analyzeBlob(blob);
			if (profile.duration < 3) {
				toast(t.tooShort);
				return;
			}
			if (profile.duration > 19.5) toast(t.tooLong);
			setClone({
				f0: profile.f0,
				gender: profile.gender,
				duration: profile.duration,
				envelope: profile.envelope
			});
			setUseClone(true);
			toast(t.cloneReady);
		} catch {
			toast(t.error);
		} finally {
			setAnalyzing(false);
		}
	}
	function tickLevels() {
		const analyser = analyserRef.current;
		if (!analyser) return;
		const buf = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteTimeDomainData(buf);
		const bars = [];
		const step = Math.floor(buf.length / 28);
		for (let i = 0; i < 28; i++) {
			let max = 0;
			for (let j = 0; j < step; j++) max = Math.max(max, Math.abs((buf[i * step + j] ?? 128) - 128) / 128);
			bars.push(.08 + max * .92);
		}
		setLiveLevels(bars);
		rafRef.current = requestAnimationFrame(tickLevels);
	}
	async function startRecording() {
		if (!consent) {
			toast(t.needConsent);
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: {
				echoCancellation: true,
				noiseSuppression: true
			} });
			streamRef.current = stream;
			const ctx = new (window.AudioContext || window.webkitAudioContext)();
			const source = ctx.createMediaStreamSource(stream);
			const analyser = ctx.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			analyserRef.current = analyser;
			tickLevels();
			const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
			const rec = new MediaRecorder(stream, { mimeType: mime });
			chunksRef.current = [];
			rec.ondataavailable = (e) => {
				if (e.data.size) chunksRef.current.push(e.data);
			};
			rec.onstop = () => {
				ingestBlob(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
				stream.getTracks().forEach((tr) => tr.stop());
				ctx.close();
			};
			recorderRef.current = rec;
			rec.start();
			recStartedRef.current = Date.now();
			setRecSeconds(0);
			setRecording(true);
			recTimerRef.current = window.setInterval(() => {
				const s = (Date.now() - recStartedRef.current) / 1e3;
				setRecSeconds(s);
				if (s >= 20) stopRecording();
			}, 200);
		} catch {
			toast(t.micDenied);
		}
	}
	function stopRecording(silent = false) {
		if (recTimerRef.current) {
			clearInterval(recTimerRef.current);
			recTimerRef.current = null;
		}
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		analyserRef.current = null;
		const rec = recorderRef.current;
		if (rec && rec.state !== "inactive") rec.stop();
		recorderRef.current = null;
		streamRef.current?.getTracks().forEach((tr) => tr.stop());
		streamRef.current = null;
		if (!silent) setRecording(false);
		else setRecording(false);
	}
	function onUpload(file) {
		if (!file) return;
		if (!consent) {
			toast(t.needConsent);
			return;
		}
		ingestBlob(file);
	}
	async function generate() {
		const text = script.replace(/\s+/g, " ").trim().slice(0, 500);
		if (!text) {
			toast(locale === "my" ? "စာသား ရိုက်ပါ။" : "Write something to speak.");
			return;
		}
		if (generating) return;
		if (remainingToday() <= 0) {
			toast(locale === "my" ? "ယနေ့အတွက် ကန့်သတ်ချက် ပြည့်သွားပါပြီ။" : "Daily limit reached. Come back tomorrow.");
			return;
		}
		const lang = detectLang(text);
		let chosen = selected;
		let pitchPct = 0;
		const cloning = Boolean(useClone && clone);
		if (cloning && clone) {
			chosen = pickCloneVoice(lang.lang, clone.gender);
			pitchPct = clamp((clone.f0 / chosen.typicalF0 - 1) * 100, -35, 35);
		} else if (chosen.lang !== lang.lang) chosen = pickCloneVoice(lang.lang, chosen.gender);
		const ratePct = clamp((speed - 1) * 100, -40, 40);
		setGenerating(true);
		try {
			if (!takeQuota()) {
				toast(locale === "my" ? "ယနေ့အတွက် ကန့်သတ်ချက် ပြည့်သွားပါပြီ။" : "Daily limit reached.");
				return;
			}
			const result = await synthesizeSpeech({ data: {
				text,
				voiceId: chosen.id,
				ratePct,
				pitchPct: cloning ? pitchPct : 0
			} });
			if (!result.ok) {
				toast(result.error || t.error);
				return;
			}
			let blob = base64ToBlob(result.audioBase64, result.mime);
			if (cloning && clone && timbre > .04) blob = await applyTimbre(blob, clone.envelope, timbre);
			if (audioUrl) URL.revokeObjectURL(audioUrl);
			const url = URL.createObjectURL(blob);
			setAudioUrl(url);
			try {
				const buf = await decodeToBuffer(blob);
				setPeaks(extractPeaks(mixToMono(buf)));
			} catch {
				setPeaks([]);
			}
			setHistory((h) => [{
				id: crypto.randomUUID(),
				text,
				url,
				at: Date.now()
			}, ...h].slice(0, 6));
			window.setTimeout(() => {
				const el = audioRef.current;
				if (el) {
					el.src = url;
					el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
				}
			}, 40);
		} catch {
			toast(t.error);
		} finally {
			setGenerating(false);
		}
	}
	function togglePlay() {
		const el = audioRef.current;
		if (!el || !audioUrl) return;
		if (playing) {
			el.pause();
			setPlaying(false);
		} else el.play().then(() => setPlaying(true));
	}
	function onTime() {
		const el = audioRef.current;
		if (!el || !el.duration) return;
		setProgress(el.currentTime / el.duration);
	}
	function download() {
		if (!audioUrl) return;
		const a = document.createElement("a");
		a.href = audioUrl;
		a.download = clone && useClone ? "nila-clone.wav" : "nila-voice.mp3";
		a.click();
	}
	const voicesForLang = STUDIO_VOICES.filter((v) => v.lang === detected.lang);
	const shownVoices = voicesForLang.length ? voicesForLang : STUDIO_VOICES.filter((v) => v.lang === "en");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh overflow-x-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "noise" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute top-64 -left-24 h-72 w-72 rounded-full bg-success/10 blur-3xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { classNames: { toast: "bg-bg-elevated text-fg border-border" } }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6 sm:pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-[0.18em] text-fg-subtle",
								children: t.kicker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-fg sm:text-5xl",
								children: t.brand
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-md text-sm text-fg-muted sm:text-base",
								children: t.tagline
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "size-4 text-fg-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex rounded-full bg-glass p-1 shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: cn("h-9 min-w-11 rounded-full px-3 text-xs font-medium", locale === "en" ? "bg-accent text-accent-fg" : "text-fg-muted"),
									onClick: () => setUiLocale("en"),
									children: "EN"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: cn("h-9 min-w-11 rounded-full px-3 text-xs font-medium", locale === "my" ? "bg-accent text-accent-fg" : "text-fg-muted"),
									onClick: () => setUiLocale("my"),
									children: "မြန်မာ"
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							className: "flex flex-col gap-5 p-5 sm:p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-medium tracking-tight",
								children: t.cloneTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-fg-muted",
								children: t.cloneHint
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-4 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative grid size-40 place-items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("orb absolute inset-0 rounded-full", recording && "animate-pulse") }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-0",
												children: liveLevels.map((v, i) => {
													const ang = i / liveLevels.length * Math.PI * 2 - Math.PI / 2;
													const r = 70;
													const x = 80 + Math.cos(ang) * r;
													const y = 80 + Math.sin(ang) * r;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "absolute w-1 rounded-full bg-accent/80",
														style: {
															left: x,
															top: y,
															height: 6 + v * 16,
															transform: `translate(-50%, -50%) rotate(${ang * 180 / Math.PI + 90}deg)`,
															opacity: recording ? .95 : .25
														}
													}, i);
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "relative z-10 text-center",
												children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-medium tabular-nums text-fg",
													children: [recSeconds.toFixed(1), t.seconds]
												}) : clone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm font-medium text-fg",
													children: [
														Math.round(clone.f0),
														" ",
														t.hz
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "mx-auto size-7 text-fg" })
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap justify-center gap-2",
										children: [
											recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "danger",
												onClick: () => stopRecording(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5 fill-current" }), t.stop]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												onClick: () => void startRecording(),
												disabled: analyzing,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {}), analyzing ? t.analyzing : t.record]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "glass",
												onClick: () => fileRef.current?.click(),
												disabled: recording || analyzing,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), t.upload]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												ref: fileRef,
												type: "file",
												accept: "audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac",
												className: "hidden",
												onChange: (e) => onUpload(e.target.files?.[0])
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex max-w-sm items-start gap-2 text-xs text-fg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: consent,
											onChange: (e) => setConsent(e.target.checked),
											className: "mt-0.5 size-4 accent-accent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.consent })]
									}),
									clone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex w-full flex-col gap-2 rounded-[20px] bg-glass px-4 py-3 text-sm shadow-[var(--shadow-border)]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-success",
													children: t.cloneReady
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-fg-subtle",
													children: [
														clone.gender === "female" ? t.female : t.male,
														" · ",
														clone.duration.toFixed(1),
														t.seconds
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-fg-muted",
												children: t.readyHint
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center justify-between gap-3 text-xs text-fg-muted",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.useClone }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: useClone,
													onChange: (e) => setUseClone(e.target.checked),
													className: "size-4 accent-accent"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "block text-xs text-fg-muted",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "mb-1 flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.timbre }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "tabular-nums",
														children: [Math.round(timbre * 100), "%"]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "range",
													min: 0,
													max: .85,
													step: .01,
													value: timbre,
													onChange: (e) => setTimbre(Number(e.target.value)),
													className: "w-full accent-accent"
												})]
											})
										]
									}) : null
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							className: "flex flex-col gap-4 p-5 sm:p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-lg font-medium tracking-tight",
										children: t.scriptTitle
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-fg-muted",
										children: t.scriptHint
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full bg-glass px-3 py-1 text-xs text-fg-muted shadow-[var(--shadow-border)]",
										children: [
											t.detected,
											": ",
											locale === "my" ? detected.labelMy : detected.label
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: script,
									onChange: (e) => setScript(e.target.value.slice(0, 500)),
									placeholder: t.placeholder,
									rows: 7,
									className: "min-h-40 w-full resize-y rounded-[20px] bg-bg/50 px-4 py-3 text-sm leading-relaxed text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs text-fg-subtle",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-fg-muted underline-offset-4 hover:text-fg hover:underline",
										onClick: () => setScript(SAMPLES[locale]),
										children: t.sampleEn
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums",
										children: [
											script.length,
											"/",
											500,
											" ",
											t.chars
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-xs text-fg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mb-1 flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.speed }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular-nums",
											children: [speed.toFixed(2), "×"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: .7,
										max: 1.35,
										step: .01,
										value: speed,
										onChange: (e) => setSpeed(Number(e.target.value)),
										className: "w-full accent-accent"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "lg",
									className: "w-full",
									onClick: () => void generate(),
									disabled: generating,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {}), generating ? t.generating : t.generate]
								}),
								useClone && clone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center text-xs text-success",
									children: t.usingClone
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center text-xs text-fg-subtle",
									children: t.noClone
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						className: "flex flex-col gap-4 p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "glass",
									size: "icon",
									onClick: togglePlay,
									disabled: !audioUrl,
									"aria-label": playing ? t.pause : t.play,
									children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "ml-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-w-0 flex-1",
									children: audioUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeakWave, {
										peaks,
										progress
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-fg-subtle",
										children: t.emptyPlayer
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "glass",
									onClick: download,
									disabled: !audioUrl,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: t.download
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
							ref: audioRef,
							onTimeUpdate: onTime,
							onEnded: () => {
								setPlaying(false);
								setProgress(1);
							},
							className: "hidden"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium text-fg-muted",
							children: t.studioVoices
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
							children: shownVoices.map((v) => {
								const active = v.id === selected.id && !(useClone && clone);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setVoiceId(v.id);
										setUseClone(false);
									},
									className: cn("min-h-11 shrink-0 rounded-full px-4 py-2 text-left text-sm shadow-[var(--shadow-border)] transition-[background-color,color] duration-[var(--motion-quick)]", active ? "bg-accent text-accent-fg" : "bg-glass text-fg hover:bg-glass-strong"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-medium leading-tight",
										children: locale === "my" ? v.nameMy : v.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("block text-[11px]", active ? "text-accent-fg/70" : "text-fg-subtle"),
										children: locale === "my" ? v.styleMy : v.style
									})]
								}, v.id);
							})
						})]
					}),
					history.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium text-fg-muted",
							children: t.history
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "flex flex-col gap-2",
							children: history.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex min-h-11 w-full items-center justify-between gap-3 rounded-[20px] bg-glass px-4 py-3 text-left text-sm shadow-[var(--shadow-border)] hover:bg-glass-strong",
								onClick: () => {
									setAudioUrl(item.url);
									const el = audioRef.current;
									if (el) {
										el.src = item.url;
										el.play().then(() => setPlaying(true));
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-1 text-fg",
									children: item.text
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 shrink-0 text-fg-muted" })]
							}) }, item.id))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 text-center text-xs text-fg-subtle",
						children: [
							t.privacy,
							" · ",
							t.footer
						]
					})
				]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };
