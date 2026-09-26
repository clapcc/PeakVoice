import {
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
  type VoiceGender,
} from "@/lib/voice/catalog";
import { detectLang } from "@/lib/voice/detect-lang";
import { analyzeBlob, applyTimbre, base64ToBlob, decodeToBuffer, mixToMono } from "@/lib/voice/audio";
import { remainingToday, takeQuota } from "@/lib/voice/quota";
import { MAX_CHARS, synthesizeSpeech } from "@/lib/voice/server";
import { Glass } from "./glass";
import { extractPeaks, PeakWave } from "./waveform";

type CloneProfile = {
  f0: number;
  gender: VoiceGender;
  duration: number;
  envelope: number[];
};

type HistoryItem = {
  id: string;
  text: string;
  url: string;
  at: number;
};

const SAMPLES: Record<AppLocale, string> = {
  en: "The rain on the glass is almost music. Stay with me a little longer.",
  my: "မှန်သားပေါ်က မိုးစက်တွေက သီချင်းလိုပါပဲ။ နည်းနည်းပိုနေပါဦး။",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function Studio() {
  const [locale, setLocale] = React.useState<AppLocale>("en");
  const t = COPY[locale];
  const [consent, setConsent] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [recSeconds, setRecSeconds] = React.useState(0);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [clone, setClone] = React.useState<CloneProfile | null>(null);
  const [useClone, setUseClone] = React.useState(true);
  const [script, setScript] = React.useState("");
  const [speed, setSpeed] = React.useState(1);
  const [timbre, setTimbre] = React.useState(0.42);
  const [voiceId, setVoiceId] = React.useState(DEFAULT_VOICE_ID);
  const [generating, setGenerating] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [peaks, setPeaks] = React.useState<number[]>([]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [liveLevels, setLiveLevels] = React.useState<number[]>(() => Array(28).fill(0.08));

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
      const saved = localStorage.getItem("nila-locale");
      if (saved === "my" || saved === "en") setLocale(saved);
      else if (navigator.language.toLowerCase().startsWith("my")) setLocale("my");
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("nila-locale", locale);
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

  function setUiLocale(next: AppLocale) {
    setLocale(next);
  }

  async function ingestBlob(blob: Blob) {
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
        envelope: profile.envelope,
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
    const bars: number[] = [];
    const step = Math.floor(buf.length / 28);
    for (let i = 0; i < 28; i++) {
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

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
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
    } else if (chosen.lang !== lang.lang) {
      chosen = pickCloneVoice(lang.lang, chosen.gender);
    }

    const ratePct = clamp((speed - 1) * 100, -40, 40);
    setGenerating(true);
    try {
      if (!takeQuota()) {
        toast(locale === "my" ? "ယနေ့အတွက် ကန့်သတ်ချက် ပြည့်သွားပါပြီ။" : "Daily limit reached.");
        return;
      }
      const result = await synthesizeSpeech({
        data: {
          text,
          voiceId: chosen.id,
          ratePct,
          pitchPct: cloning ? pitchPct : 0,
        },
      });
      if (!result.ok) {
        toast(result.error || t.error);
        return;
      }
      let blob = base64ToBlob(result.audioBase64, result.mime);
      if (cloning && clone && timbre > 0.04) {
        blob = await applyTimbre(blob, clone.envelope, timbre);
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
      setHistory((h) => [{ id: crypto.randomUUID(), text, url, at: Date.now() }, ...h].slice(0, 6));
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
    a.download = clone && useClone ? "nila-clone.wav" : "nila-voice.mp3";
    a.click();
  }

  const voicesForLang = STUDIO_VOICES.filter((v) => v.lang === detected.lang);
  const shownVoices = voicesForLang.length ? voicesForLang : STUDIO_VOICES.filter((v) => v.lang === "en");

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-bg text-fg">
      <div className="noise" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-64 -left-24 h-72 w-72 rounded-full bg-success/10 blur-3xl"
      />

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "bg-bg-elevated text-fg border-border",
          },
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-subtle">{t.kicker}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-fg sm:text-5xl">
              {t.brand}
            </h1>
            <p className="mt-2 max-w-md text-sm text-fg-muted sm:text-base">{t.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-fg-subtle" />
            <div className="flex rounded-full bg-glass p-1 shadow-[var(--shadow-border)]">
              <button
                type="button"
                className={cn(
                  "h-9 min-w-11 rounded-full px-3 text-xs font-medium",
                  locale === "en" ? "bg-accent text-accent-fg" : "text-fg-muted",
                )}
                onClick={() => setUiLocale("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={cn(
                  "h-9 min-w-11 rounded-full px-3 text-xs font-medium",
                  locale === "my" ? "bg-accent text-accent-fg" : "text-fg-muted",
                )}
                onClick={() => setUiLocale("my")}
              >
                မြန်မာ
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <Glass className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-medium tracking-tight">{t.cloneTitle}</h2>
              <p className="mt-1 text-sm text-fg-muted">{t.cloneHint}</p>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative grid size-36 place-items-center">
                <div
                  className={cn(
                    "orb absolute inset-0 rounded-full transition-[box-shadow] duration-[var(--motion-fast)]",
                    recording && "shadow-[0_0_0_1px_rgb(194_65_74/0.55),0_12px_40px_rgb(0_0_0/0.35)]",
                  )}
                />
                {recording ? (
                  <svg
                    className="absolute inset-[-6px] size-[calc(100%+12px)] -rotate-90"
                    viewBox="0 0 156 156"
                    aria-hidden
                  >
                    <circle
                      cx="78"
                      cy="78"
                      r="72"
                      fill="none"
                      stroke="rgb(255 255 255 / 0.12)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="78"
                      cy="78"
                      r="72"
                      fill="none"
                      stroke="rgb(232 238 246 / 0.9)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 72}`}
                      strokeDashoffset={`${2 * Math.PI * 72 * (1 - Math.min(1, recSeconds / 20))}`}
                    />
                  </svg>
                ) : null}
                <div className="relative z-10 text-center">
                  {recording ? (
                    <p className="font-medium tabular-nums text-fg">
                      {recSeconds.toFixed(1)}
                      {t.seconds}
                    </p>
                  ) : clone ? (
                    <p className="text-sm font-medium text-fg">
                      {Math.round(clone.f0)} {t.hz}
                    </p>
                  ) : (
                    <Mic className="mx-auto size-7 text-fg" />
                  )}
                </div>
              </div>
              {recording ? (
                <PeakWave peaks={liveLevels} progress={1} className="h-8 w-48" />
              ) : null}

              <div className="flex flex-wrap justify-center gap-2">
                {recording ? (
                  <Button variant="danger" onClick={() => stopRecording()}>
                    <Square className="size-3.5 fill-current" />
                    {t.stop}
                  </Button>
                ) : (
                  <Button onClick={() => void startRecording()} disabled={analyzing}>
                    <Mic />
                    {analyzing ? t.analyzing : t.record}
                  </Button>
                )}
                <Button variant="glass" onClick={() => fileRef.current?.click()} disabled={recording || analyzing}>
                  <Upload />
                  {t.upload}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
              </div>

              <label className="flex max-w-sm items-start gap-2 text-xs text-fg-muted">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-4 accent-accent"
                />
                <span>{t.consent}</span>
              </label>

              {clone ? (
                <div className="flex w-full flex-col gap-2 rounded-[20px] bg-glass px-4 py-3 text-sm shadow-[var(--shadow-border)]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-success">{t.cloneReady}</span>
                    <span className="text-xs text-fg-subtle">
                      {clone.gender === "female" ? t.female : t.male} · {clone.duration.toFixed(1)}
                      {t.seconds}
                    </span>
                  </div>
                  <p className="text-xs text-fg-muted">{t.readyHint}</p>
                  <label className="flex items-center justify-between gap-3 text-xs text-fg-muted">
                    <span>{t.useClone}</span>
                    <input
                      type="checkbox"
                      checked={useClone}
                      onChange={(e) => setUseClone(e.target.checked)}
                      className="size-4 accent-accent"
                    />
                  </label>
                  <label className="block text-xs text-fg-muted">
                    <span className="mb-1 flex justify-between">
                      <span>{t.timbre}</span>
                      <span className="tabular-nums">{Math.round(timbre * 100)}%</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={0.85}
                      step={0.01}
                      value={timbre}
                      onChange={(e) => setTimbre(Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                  </label>
                </div>
              ) : null}
            </div>
          </Glass>

          <Glass className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium tracking-tight">{t.scriptTitle}</h2>
                <p className="mt-1 text-sm text-fg-muted">{t.scriptHint}</p>
              </div>
              <span className="rounded-full bg-glass px-3 py-1 text-xs text-fg-muted shadow-[var(--shadow-border)]">
                {t.detected}: {locale === "my" ? detected.labelMy : detected.label}
              </span>
            </div>

            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value.slice(0, MAX_CHARS))}
              placeholder={t.placeholder}
              rows={7}
              className="min-h-40 w-full resize-y rounded-[20px] bg-bg/50 px-4 py-3 text-sm leading-relaxed text-fg shadow-[var(--shadow-border)] outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
            />

            <div className="flex items-center justify-between text-xs text-fg-subtle">
              <button type="button" className="text-fg-muted underline-offset-4 hover:text-fg hover:underline" onClick={() => setScript(SAMPLES[locale])}>
                {t.sampleEn}
              </button>
              <span className="tabular-nums">
                {script.length}/{MAX_CHARS} {t.chars}
              </span>
            </div>

            <label className="block text-xs text-fg-muted">
              <span className="mb-1 flex justify-between">
                <span>{t.speed}</span>
                <span className="tabular-nums">{speed.toFixed(2)}×</span>
              </span>
              <input
                type="range"
                min={0.7}
                max={1.35}
                step={0.01}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </label>

            <Button size="lg" className="w-full" onClick={() => void generate()} disabled={generating}>
              <Volume2 />
              {generating ? t.generating : t.generate}
            </Button>
            {useClone && clone ? (
              <p className="text-center text-xs text-success">{t.usingClone}</p>
            ) : (
              <p className="text-center text-xs text-fg-subtle">{t.noClone}</p>
            )}
          </Glass>
        </div>

        <Glass className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
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
                <p className="text-sm text-fg-subtle">{t.emptyPlayer}</p>
              )}
            </div>
            <Button variant="glass" onClick={download} disabled={!audioUrl}>
              <Download />
              <span className="hidden sm:inline">{t.download}</span>
            </Button>
          </div>
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

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-fg-muted">{t.studioVoices}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shownVoices.map((v) => {
              const active = v.id === selected.id && !(useClone && clone);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVoiceId(v.id);
                    setUseClone(false);
                  }}
                  className={cn(
                    "min-h-11 shrink-0 rounded-full px-4 py-2 text-left text-sm shadow-[var(--shadow-border)] transition-[background-color,color] duration-[var(--motion-quick)]",
                    active ? "bg-accent text-accent-fg" : "bg-glass text-fg hover:bg-glass-strong",
                  )}
                >
                  <span className="block font-medium leading-tight">{locale === "my" ? v.nameMy : v.name}</span>
                  <span className={cn("block text-[11px]", active ? "text-accent-fg/70" : "text-fg-subtle")}>
                    {locale === "my" ? v.styleMy : v.style}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {history.length ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-fg-muted">{t.history}</h2>
            <ul className="flex flex-col gap-2">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[20px] bg-glass px-4 py-3 text-left text-sm shadow-[var(--shadow-border)] hover:bg-glass-strong"
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
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="pt-2 text-center text-xs text-fg-subtle">
          {t.privacy} · {t.footer}
        </p>
      </div>
    </div>
  );
}
