import type { VoiceGender } from "./catalog";

export type VoiceProfile = {
  f0: number;
  gender: VoiceGender;
  centroid: number;
  rms: number;
  duration: number;
  envelope: number[];
  k: number[];
};

const EPS = 1e-8;
const ENV_BINS = 48;

export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const n = samples.length;
  const buffer = new ArrayBuffer(44 + n * 2);
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
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export function mixToMono(buffer: AudioBuffer): Float32Array {
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

export function trimSilence(samples: Float32Array, sampleRate: number): Float32Array {
  const thresh = 0.012;
  let start = 0;
  let end = samples.length - 1;
  while (start < end && Math.abs(samples[start] ?? 0) < thresh) start++;
  while (end > start && Math.abs(samples[end] ?? 0) < thresh) end--;
  const pad = Math.floor(sampleRate * 0.04);
  start = Math.max(0, start - pad);
  end = Math.min(samples.length, end + pad);
  return samples.subarray(start, end);
}

export function downsample(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
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

export async function decodeToBuffer(blob: Blob): Promise<AudioBuffer> {
  const ctx = new AudioContext();
  try {
    const arr = await blob.arrayBuffer();
    return await ctx.decodeAudioData(arr.slice(0));
  } finally {
    void ctx.close();
  }
}

function yinF0(samples: Float32Array, sampleRate: number): number {
  const minF = 70;
  const maxF = 380;
  const tauMin = Math.floor(sampleRate / maxF);
  const tauMax = Math.min(Math.floor(sampleRate / minF), Math.floor(samples.length / 3));
  const frame = Math.min(samples.length, Math.floor(sampleRate * 0.04));
  const hop = Math.floor(frame / 2);
  const f0s: number[] = [];
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
    for (; tau < tauMax; tau++) {
      if ((cmnd[tau] ?? 1) < 0.15) {
        while (tau + 1 < tauMax && (cmnd[tau + 1] ?? 1) < (cmnd[tau] ?? 1)) tau++;
        found = tau;
        break;
      }
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

function spectralCentroid(samples: Float32Array, sampleRate: number): number {
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
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
      re[i] = (samples[pos + i] ?? 0) * w;
    }
    fft(re, im, false);
    const bins = n / 2;
    for (let k = 1; k < bins; k++) {
      const mag = Math.hypot(re[k] ?? 0, im[k] ?? 0);
      const freq = (k * sampleRate) / n;
      num += freq * mag;
      den += mag;
    }
  }
  return den > EPS ? num / den : 1800;
}

function meanEnvelope(samples: Float32Array): number[] {
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
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
      re[i] = (samples[pos + i] ?? 0) * w;
    }
    fft(re, im, false);
    for (let k = 0; k < half; k++) {
      acc[k] += Math.log(Math.hypot(re[k] ?? 0, im[k] ?? 0) + EPS);
    }
    frames++;
  }
  if (!frames) return new Array(ENV_BINS).fill(0);
  const env: number[] = [];
  const group = Math.floor(half / ENV_BINS);
  for (let b = 0; b < ENV_BINS; b++) {
    let s = 0;
    for (let k = 0; k < group; k++) s += acc[b * group + k] ?? 0;
    env.push(s / (group * frames));
  }
  const mean = env.reduce((a, v) => a + v, 0) / env.length;
  return env.map((v) => v - mean);
}

export function analyzeSamples(samples: Float32Array, sampleRate: number): VoiceProfile {
  const mono = trimSilence(samples, sampleRate);
  const work = downsample(mono, sampleRate, 16000);
  const f0 = yinF0(work, 16000);
  const gender: VoiceGender = f0 >= 165 ? "female" : "male";
  let rms = 0;
  for (let i = 0; i < work.length; i++) rms += (work[i] ?? 0) ** 2;
  rms = Math.sqrt(rms / Math.max(1, work.length));
  return {
    f0,
    gender,
    centroid: spectralCentroid(work, 16000),
    rms,
    duration: mono.length / sampleRate,
    envelope: meanEnvelope(work),
    k: meanReflection(work, 16000),
  };
}

export async function analyzeBlob(blob: Blob): Promise<{ profile: VoiceProfile; samples: Float32Array; sampleRate: number }> {
  const buffer = await decodeToBuffer(blob);
  const samples = mixToMono(buffer);
  const maxSamples = Math.floor(buffer.sampleRate * 30);
  const clipped = samples.length > maxSamples ? samples.subarray(0, maxSamples) : samples;
  const profile = analyzeSamples(clipped, buffer.sampleRate);
  return { profile, samples: clipped, sampleRate: buffer.sampleRate };
}

export async function applyTimbre(mp3Blob: Blob, envelope: number[], blend: number): Promise<Blob> {
  const amount = Math.max(0, Math.min(1, blend));
  if (amount < 0.05 || envelope.length < 8) return mp3Blob;
  const buffer = await decodeToBuffer(mp3Blob);
  const src = mixToMono(buffer);
  const out = morphEnvelope(src, envelope, amount);
  return encodeWav(out, buffer.sampleRate);
}

function morphEnvelope(samples: Float32Array, refEnv: number[], blend: number): Float32Array {
  const n = 1024;
  const hop = 512;
  const half = n / 2;
  const out = new Float32Array(samples.length);
  const window = new Float32Array(n);
  for (let i = 0; i < n; i++) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
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
    const srcMean = srcEnv.reduce((a: number, v: number) => a + v, 0) / ENV_BINS;
    for (let b = 0; b < ENV_BINS; b++) srcEnv[b] -= srcMean;
    for (let b = 0; b < ENV_BINS; b++) {
      const target = (srcEnv[b] ?? 0) * (1 - blend) + (refEnv[b] ?? 0) * blend;
      const gain = Math.exp(target - (srcEnv[b] ?? 0));
      const g = Math.max(0.35, Math.min(2.6, gain));
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
  const norm = peak > 0.98 ? 0.98 / peak : 1;
  if (norm !== 1) for (let i = 0; i < out.length; i++) out[i] *= norm;
  return out;
}

function fft(re: Float32Array, im: Float32Array, invert: boolean) {
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
    const ang = ((invert ? 2 : -2) * Math.PI) / len;
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
  if (invert) {
    for (let i = 0; i < n; i++) {
      re[i] = (re[i] ?? 0) / n;
      im[i] = (im[i] ?? 0) / n;
    }
  }
}

export function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

const LPC_ORDER = 18;

function preemphasize(frame: Float32Array): Float32Array {
  const out = new Float32Array(frame.length);
  out[0] = frame[0] ?? 0;
  for (let i = 1; i < frame.length; i++) {
    out[i] = (frame[i] ?? 0) - 0.97 * (frame[i - 1] ?? 0);
  }
  return out;
}

function reflectionCoeffs(frame: Float32Array, order: number): number[] {
  const r = new Float64Array(order + 1);
  for (let k = 0; k <= order; k++) {
    let s = 0;
    for (let n = 0; n < frame.length - k; n++) s += (frame[n] ?? 0) * (frame[n + k] ?? 0);
    r[k] = s;
  }
  if ((r[0] ?? 0) < EPS) return new Array(order).fill(0);
  const a = new Float64Array(order + 1);
  a[0] = 1;
  const k: number[] = [];
  let e = r[0] ?? 1;
  for (let i = 1; i <= order; i++) {
    let lambda = r[i] ?? 0;
    for (let j = 1; j < i; j++) lambda += (a[j] ?? 0) * (r[i - j] ?? 0);
    const ki = e === 0 ? 0 : Math.max(-0.99, Math.min(0.99, -lambda / e));
    k.push(ki);
    const prev = Float64Array.from(a);
    a[i] = ki;
    for (let j = 1; j < i; j++) a[j] = (prev[j] ?? 0) + ki * (prev[i - j] ?? 0);
    e *= 1 - ki * ki;
  }
  return k;
}

function meanReflection(samples: Float32Array, sampleRate: number, order = LPC_ORDER): number[] {
  const frame = Math.round(sampleRate * 0.02);
  const hop = Math.round(frame / 2);
  const acc = new Float64Array(order);
  let n = 0;
  for (let pos = 0; pos + frame < samples.length; pos += hop) {
    const slice = samples.subarray(pos, pos + frame);
    let energy = 0;
    for (let i = 0; i < slice.length; i++) energy += (slice[i] ?? 0) ** 2;
    if (energy / frame < 0.00035) continue;
    const k = reflectionCoeffs(preemphasize(slice), order);
    for (let i = 0; i < order; i++) acc[i] += k[i] ?? 0;
    n++;
  }
  if (!n) return [];
  return Array.from(acc, (v) => v / n);
}

function kToA(k: number[]): number[] {
  const p = k.length;
  const a = new Array(p + 1).fill(0);
  a[0] = 1;
  for (let i = 1; i <= p; i++) {
    const ki = Math.max(-0.99, Math.min(0.99, k[i - 1] ?? 0));
    const prev = a.slice(0, i);
    a[i] = ki;
    for (let j = 1; j < i; j++) a[j] = (prev[j] ?? 0) + ki * (prev[i - j] ?? 0);
  }
  return a;
}

function firInverse(samples: Float32Array, a: number[]): Float32Array {
  const p = a.length - 1;
  const out = new Float32Array(samples.length);
  for (let n = 0; n < samples.length; n++) {
    let acc = 0;
    for (let i = 0; i <= p; i++) acc += (a[i] ?? 0) * (samples[n - i] ?? 0);
    out[n] = acc;
  }
  return out;
}

function iirSynth(exc: Float32Array, a: number[]): Float32Array {
  const p = a.length - 1;
  const out = new Float32Array(exc.length);
  for (let n = 0; n < exc.length; n++) {
    let acc = exc[n] ?? 0;
    for (let i = 1; i <= p; i++) acc -= (a[i] ?? 0) * (out[n - i] ?? 0);
    if (!Number.isFinite(acc)) acc = 0;
    out[n] = Math.max(-4, Math.min(4, acc));
  }
  return out;
}

function finitePeak(samples: Float32Array, maxPeak = 12): boolean {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i] ?? 0;
    if (!Number.isFinite(v)) return false;
    peak = Math.max(peak, Math.abs(v));
  }
  return peak > 0 && peak < maxPeak;
}

function wsolaStretch(input: Float32Array, rate: number): Float32Array {
  if (Math.abs(rate - 1) < 0.02) return input;
  const frame = 1024;
  const hopOut = 256;
  const hopIn = hopOut / rate;
  const outLen = Math.max(frame, Math.floor(input.length * rate));
  const out = new Float32Array(outLen + frame);
  let posIn = 0;
  let posOut = 0;
  const search = 80;
  while (posOut + frame < out.length && posIn + frame < input.length) {
    let best = Math.round(posIn);
    let bestCorr = -Infinity;
    const start = Math.max(0, Math.round(posIn) - search);
    const end = Math.min(input.length - frame, Math.round(posIn) + search);
    for (let c = start; c <= end; c += 2) {
      let corr = 0;
      for (let i = 0; i < 48; i++) corr += (out[posOut + i] ?? 0) * (input[c + i] ?? 0);
      if (corr > bestCorr) {
        bestCorr = corr;
        best = c;
      }
    }
    for (let i = 0; i < frame; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frame - 1));
      out[posOut + i] += (input[best + i] ?? 0) * w;
    }
    posIn += hopIn;
    posOut += hopOut;
  }
  return out.subarray(0, Math.min(outLen, Math.max(1, posOut)));
}

function resampleLinear(input: Float32Array, targetLen: number): Float32Array {
  if (input.length === targetLen) return input;
  const out = new Float32Array(targetLen);
  if (input.length < 2 || targetLen < 1) return out;
  const step = (input.length - 1) / Math.max(1, targetLen - 1);
  for (let i = 0; i < targetLen; i++) {
    const x = i * step;
    const i0 = Math.floor(x);
    const i1 = Math.min(input.length - 1, i0 + 1);
    const t = x - i0;
    out[i] = (input[i0] ?? 0) * (1 - t) + (input[i1] ?? 0) * t;
  }
  return out;
}

function shiftPitch(samples: Float32Array, ratio: number): Float32Array {
  const r = Math.max(0.5, Math.min(1.85, ratio));
  if (Math.abs(r - 1) < 0.03) return samples;
  if (samples.length > 3_200_000) return samples;
  const stretched = wsolaStretch(samples, r);
  return resampleLinear(stretched, samples.length);
}

function lpcSwap(samples: Float32Array, kSrc: number[], kDst: number[], amount: number): Float32Array {
  if (!kSrc.length || !kDst.length || amount < 0.08) return samples;
  const residual = firInverse(samples, kToA(kSrc));
  const swapped = iirSynth(residual, kToA(kDst));
  if (!finitePeak(swapped)) return samples;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = (samples[i] ?? 0) * (1 - amount) + (swapped[i] ?? 0) * amount;
  }
  return out;
}

function normalizePeak(samples: Float32Array, target = 0.96): Float32Array {
  let peak = EPS;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i] ?? 0));
  const g = peak > target ? target / peak : 1;
  if (g === 1) return samples;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = (samples[i] ?? 0) * g;
  return out;
}

export async function convertToClone(
  blob: Blob,
  model: Pick<VoiceProfile, "f0" | "envelope" | "k">,
  sourceF0: number,
  amount: number,
): Promise<Blob> {
  const blend = Math.max(0, Math.min(1, amount));
  if (blend < 0.05) return blob;
  const buffer = await decodeToBuffer(blob);
  let samples = mixToMono(buffer);
  if (buffer.sampleRate !== 16000) samples = downsample(samples, buffer.sampleRate, 16000);
  const ratio = (model.f0 || 160) / Math.max(70, sourceF0 || 160);
  samples = shiftPitch(samples, 1 + (ratio - 1) * blend);
  if (model.envelope.length >= 8) samples = morphEnvelope(samples, model.envelope, blend * 0.92);
  if (model.k.length >= 8) {
    const kSrc = meanReflection(samples, 16000);
    if (kSrc.length) samples = lpcSwap(samples, kSrc, model.k, blend * 0.7);
  }
  samples = normalizePeak(samples);
  return encodeWav(samples, 16000);
}

