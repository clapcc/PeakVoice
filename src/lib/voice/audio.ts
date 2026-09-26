import type { VoiceGender } from "./catalog";

export type VoiceProfile = {
  f0: number;
  gender: VoiceGender;
  centroid: number;
  rms: number;
  duration: number;
  envelope: number[];
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
  };
}

export async function analyzeBlob(blob: Blob): Promise<{ profile: VoiceProfile; samples: Float32Array; sampleRate: number }> {
  const buffer = await decodeToBuffer(blob);
  const samples = mixToMono(buffer);
  const maxSamples = Math.floor(buffer.sampleRate * 20);
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
