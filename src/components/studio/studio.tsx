import {
  Check,
  Download,
  Languages,
  Mic,
  Pause,
  Play,
  Square,
  Upload,
  Volume2,
} from "lucide-react";
import * as React from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COPY, type AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DEFAULT_VOICE_ID,
  pickCloneVoice,
  STUDIO_VOICES,
  voiceById,
} from "@/lib/voice/catalog";
import { detectLang } from "@/lib/voice/detect-lang";
import {
  analyzeBlob,
  applyTimbre,
  base64ToBlob,
  blobToBase64,
  decodeToBuffer,
  downsample,
  encodeWav,
  mixToMono,
  type VoiceProfile,
} from "@/lib/voice/audio";
import { CHUNK_CHARS, MAX_CHARS, MAX_CLONE_SECONDS, MIN_CLONE_SECONDS, splitScript } from "@/lib/voice/limits";
import { remainingToday, takeQuota } from "@/lib/voice/quota";
import { createCustomVoice, synthesizeSpeech } from "@/lib/voice/server";
import { Glass } from "./glass";
import { extractPeaks, PeakWave } from "./waveform";

type HistoryItem = {
  id: string;
  text: string;
  url: string;
};

const SAMPLES: Record<AppLocale, string> = {
  en: "Stay with the blue hour a little longer. The city is still listening.",
  my: "ဒီည အပြာရောင် အလင်းထဲမှာ ခဏလေး ပိုနေပါဦး။",
};

function pickMime(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

export function Studio() {
  const [locale, setLocale] = React.useState<AppLocale>("en");
  const t = COPY[locale];
  const [consent, setConsent] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [recSeconds, setRecSeconds] = React.useState(0);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [clone, setClone] = React.useState<VoiceProfile | null>(null);
  const [neuralId, setNeuralId] = React.useState<string | null>(null);
  const [useClone, setUseClone] = React.useState(true);
  const [script, setScript] = React.useState("");
  const [speed, setSpeed] = React.useState(1);
  const [voiceId, setVoiceId] = React.useState(DEFAULT_VOICE_ID);
  const [generating, setGenerating] = React.useState(false);
  const [genHint, setGenHint] = React.useState("");
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [peaks, setPeaks] = React.useState<number[]>([]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [liveLevels, setLiveLevels] = React.useState<number[]>(() => Array(24).fill(0.08));

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const recTimerRef = React.useRef<number | null>(null);
  const recStartedRef = React.useRef(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("peakvoice-locale") ?? localStorage.getItem("nila-locale");
      if (saved === "my" || saved === "en") setLocale(saved);
      else if (navigator.language.toLowerCase().startsWith("my")) setLocale("my");
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("peakvoice-locale", locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale === "my" ? "my" : "en";
  }, [locale]);

  React.useEffect(() => {
    return () => {
      stopRecording(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detected = detectLang(script);
  const selected = voiceById(voiceId) ?? STUDIO_VOICES[0]!;
  const cloning = Boolean(useClone && clone);

  async function tryNeural(wav: Blob, language: string) {
    try {
      const b64 = await blobToBase64(wav);
      const res = await createCustomVoice({ data: { wavBase64: b64, language } });
      if (res.ok && res.voiceId) setNeuralId(res.voiceId);
    } catch {
      /* neural clone is optional */
    }
  }

  async function ingestBlob(blob: Blob) {
    setAnalyzing(true);
    try {
      const { profile, samples, sampleRate } = await analyzeBlob(blob);
      if (profile.duration < MIN_CLONE_SECONDS) {
        toast(t.tooShort);
        return;
      }
      if (profile.duration > MAX_CLONE_SECONDS - 0.4) toast(t.tooLong);
      setClone(profile);
      setUseClone(true);
      setNeuralId(null);
      toast(t.cloneReady);
      const wav = encodeWav(downsample(samples, sampleRate, 16000), 16000);
      const lang = locale === "my" ? "my" : "en";
      void tryNeural(wav, lang);
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
    const bars: number[] = [];
    const step = Math.floor(buf.length / 24);
    for (let i = 0; i < 24; i++) {
      let max = 0;
      for (let j = 0; j < step; j++) {
        max = Math.max(max, Math.abs((buf[i * step + j] ?? 128) - 128) / 128);
      }
      bars.push(0.08 + max * 0.92);
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      tickLevels();

      const mime = pickMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        void ingestBlob(blob);
        stream.getTracks().forEach((tr) => tr.stop());
        void ctx.close();
      };
      recorderRef.current = rec;
      rec.start();
      recStartedRef.current = Date.now();
      setRecSeconds(0);
      setRecording(true);
      recTimerRef.current = window.setInterval(() => {
        const s = (Date.now() - recStartedRef.current) / 1000;
        setRecSeconds(s);
        if (s >= MAX_CLONE_SECONDS) stopRecording();
      }, 200);
    } catch {
      toast(t.micDenied);
    }
  }

  function stopRecording(_silent = false) {
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
    setRecording(false);
  }

  function onUpload(file: File | undefined) {
    if (!file) return;
    if (!consent) {
      toast(t.needConsent);
      return;
    }
    void ingestBlob(file);
  }

  async function generate() {
    const text = script.replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
    if (!text) {
      toast(locale === "my" ? "စာသား ရိုက်ပါ။" : "Write something first.");
      return;
    }
    if (generating) return;
    if (remainingToday() <= 0) {
      toast(t.limit);
      return;
    }

    const lang = detectLang(text);
    let chosen = selected;
    if (cloning && clone) chosen = pickCloneVoice(lang.lang, clone.gender);
    else if (chosen.lang !== lang.lang) chosen = pickCloneVoice(lang.lang, chosen.gender);

    const ratePct = Math.min(40, Math.max(-40, (speed - 1) * 100));
    const pitchPct =
      cloning && clone
        ? Math.round(
            Math.min(35, Math.max(-35, (clone.f0 / Math.max(80, chosen.typicalF0) - 1) * 100)),
          )
        : 0;
    const parts = splitScript(text, CHUNK_CHARS);
    setGenerating(true);
    setGenHint(parts.length > 1 ? `1/${parts.length}` : "");
    try {
      if (!takeQuota()) {
        toast(t.limit);
        return;
      }
      const blobs: Blob[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts.length > 1) setGenHint(`${i + 1}/${parts.length}`);
        const result = await synthesizeSpeech({
          data: {
            text: parts[i] ?? text,
            voiceId: chosen.id,
            ratePct,
            pitchPct,
            language: lang.lang,
            neuralId: cloning ? neuralId ?? undefined : undefined,
          },
        });
        if (!result.ok) {
          toast(result.error || t.error);
          return;
        }
        blobs.push(base64ToBlob(result.audioBase64, result.mime));
      }
      let blob = blobs.length === 1 ? blobs[0]! : new Blob(blobs, { type: blobs[0]?.type || "audio/mpeg" });
      if (cloning && clone && !neuralId && text.length <= 1800) {
        try {
          blob = await applyTimbre(blob, clone.envelope, 0.86);
        } catch {
          /* pitch match still stands */
        }
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      try {
        const buf = await decodeToBuffer(blob);
        setPeaks(extractPeaks(mixToMono(buf)));
      } catch {
        setPeaks([]);
      }
      setHistory((h) => [{ id: crypto.randomUUID(), text, url }, ...h].slice(0, 5));
      window.setTimeout(() => {
        const el = audioRef.current;
        if (el) {
          el.src = url;
          void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
      }, 40);
    } catch {
      toast(t.error);
    } finally {
      setGenerating(false);
      setGenHint("");
    }
  }

  function togglePlay() {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play().then(() => setPlaying(true));
    }
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
    a.download = cloning ? "peakvoice-clone.wav" : "peakvoice.mp3";
    a.click();
  }

  const voicesForLang = STUDIO_VOICES.filter((v) => v.lang === detected.lang);
  const shownVoices = voicesForLang.length ? voicesForLang : STUDIO_VOICES.filter((v) => v.lang === "en");

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-bg text-fg">
      <div className="noise" />

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "bg-bg-elevated text-fg border-border",
          },
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-fg shadow-[var(--shadow-border)]">
              <Volume2 className="size-5" />
            </span>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Peak<span className="text-accent">Voice</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-fg-subtle" />
            <div className="flex rounded-2xl bg-glass p-1 shadow-[var(--shadow-border)]">
              <button
                type="button"
                className={cn(
                  "h-9 min-w-11 rounded-xl px-3 text-xs font-medium",
                  locale === "en" ? "bg-accent text-accent-fg" : "text-fg-muted",
                )}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={cn(
                  "h-9 min-w-11 rounded-xl px-3 text-xs font-medium",
                  locale === "my" ? "bg-accent text-accent-fg" : "text-fg-muted",
                )}
                onClick={() => setLocale("my")}
              >
                မြန်မာ
              </button>
            </div>
          </div>
        </header>

        <Glass className="flex flex-col gap-3 p-3">
          <button
            type="button"
            className={cn("tile", recording && "tile-on")}
            onClick={() => (recording ? stopRecording() : void startRecording())}
            disabled={analyzing}
          >
            {recording ? <Square className="size-7 fill-current" /> : <Mic className="size-7" />}
            <span className="text-sm font-semibold tracking-tight">
              {recording ? `${recSeconds.toFixed(0)}${t.seconds}` : analyzing ? t.analyzing : t.record}
            </span>
            {recording ? <PeakWave peaks={liveLevels} progress={1} className="h-6 w-24" /> : null}
          </button>

          <button
            type="button"
            className="tile"
            onClick={() => fileRef.current?.click()}
            disabled={recording || analyzing}
          >
            <Upload className="size-7" />
            <span className="text-sm font-semibold tracking-tight">{t.upload}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />

          <button
            type="button"
            className={cn("tile", cloning && "tile-on")}
            onClick={() => {
              if (!clone) {
                toast(locale === "my" ? "အရင် သွင်း" : "Record first");
                return;
              }
              setUseClone((v) => !v);
            }}
          >
            {clone ? <Check className="size-7" /> : <Volume2 className="size-7" />}
            <span className="text-sm font-semibold tracking-tight">{clone ? t.cloneReady : t.useClone}</span>
            {clone ? (
              <span className="text-xs tabular-nums text-current/80">
                {Math.round(clone.f0)}
                {t.hz}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className={cn("tile", consent && "tile-on")}
            onClick={() => setConsent((v) => !v)}
          >
            <Check className="size-7" />
            <span className="text-sm font-semibold tracking-tight">{t.consent}</span>
          </button>
        </div>

        <Glass className="flex flex-col gap-3 p-3">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value.slice(0, MAX_CHARS))}
            placeholder={t.placeholder}
            rows={5}
            className="min-h-32 w-full resize-y rounded-md bg-bg px-4 py-3 text-base leading-relaxed text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-md bg-bg text-xs font-medium text-fg-muted"
              onClick={() => setScript(SAMPLES[locale])}
            >
              {t.sample}
            </button>
            <input
              type="range"
              min={0.7}
              max={1.35}
              step={0.01}
              value={speed}
              aria-label={t.speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="min-h-11 flex-1 accent-accent"
            />
            <span className="w-12 text-right text-xs tabular-nums text-fg-muted">{speed.toFixed(2)}×</span>
            <span className="w-16 text-right text-xs tabular-nums text-fg-subtle">
              {script.length}/{MAX_CHARS}
            </span>
          </div>
          <Button size="lg" className="h-14 w-full rounded-md text-base" onClick={() => void generate()} disabled={generating}>
            <Volume2 />
            {generating ? (genHint ? `${t.generating} ${genHint}` : t.generating) : t.generate}
          </Button>
        </Glass>

        <Glass className="flex items-center gap-3 p-3">
          <Button
            variant="glass"
            size="icon"
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-label={playing ? t.pause : t.play}
          >
            {playing ? <Pause className="ml-0" /> : <Play className="ml-0.5" />}
          </Button>
          <div className="min-w-0 flex-1">
            {audioUrl ? (
              <PeakWave peaks={peaks} progress={progress} />
            ) : (
              <div className="h-8 rounded-md bg-bg" />
            )}
          </div>
          <Button variant="glass" onClick={download} disabled={!audioUrl}>
            <Download />
            <span className="hidden sm:inline">{t.download}</span>
          </Button>
          <audio
            ref={audioRef}
            onTimeUpdate={onTime}
            onEnded={() => {
              setPlaying(false);
              setProgress(1);
            }}
            className="hidden"
          />
        </Glass>

        <section>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {shownVoices.map((v) => {
              const active = v.id === selected.id && !cloning;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVoiceId(v.id);
                    setUseClone(false);
                  }}
                  className={cn("tile px-2 text-center", active && "tile-on")}
                >
                  <span className="text-sm font-medium leading-tight">{locale === "my" ? v.nameMy : v.name}</span>
                  <span className={cn("text-xs", active ? "text-accent-fg/80" : "text-fg-subtle")}>
                    {locale === "my" ? v.styleMy : v.style}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {history.length ? (
          <section className="grid grid-cols-2 gap-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex min-h-14 items-center justify-between gap-2 rounded-md bg-bg-elevated px-3 py-3 text-left text-sm shadow-[var(--shadow-border)]"
                  onClick={() => {
                    setAudioUrl(item.url);
                    const el = audioRef.current;
                    if (el) {
                      el.src = item.url;
                      void el.play().then(() => setPlaying(true));
                    }
                  }}
                >
                  <span className="line-clamp-1 text-fg">{item.text}</span>
                  <Play className="size-4 shrink-0 text-fg-muted" />
                </button>
              ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
