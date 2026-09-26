import { cn } from "@/lib/utils";

export function PeakWave({
  peaks,
  progress,
  className,
}: {
  peaks: number[];
  progress: number;
  className?: string;
}) {
  const bars = peaks.length ? peaks : Array.from({ length: 48 }, () => 0.12);
  return (
    <div className={cn("flex h-10 items-center gap-px", className)} aria-hidden>
      {bars.map((p, i) => {
        const t = i / Math.max(1, bars.length - 1);
        const on = t <= progress;
        const h = 8 + p * 28;
        return (
          <span
            key={i}
            className={cn(
              "w-full rounded-full transition-colors duration-[var(--motion-quick)]",
              on ? "bg-accent" : "bg-fg/20",
            )}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}

export function extractPeaks(samples: Float32Array, count = 56): number[] {
  if (!samples.length) return [];
  const size = Math.floor(samples.length / count) || 1;
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    let max = 0;
    const start = i * size;
    for (let j = 0; j < size; j++) {
      max = Math.max(max, Math.abs(samples[start + j] ?? 0));
    }
    peaks.push(Math.min(1, max * 1.6));
  }
  return peaks;
}
