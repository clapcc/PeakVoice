const KEY = "peakvoice-quota-v1";
const DAILY_LIMIT = 40;

type Quota = { day: string; count: number };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Quota {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { day: today(), count: 0 };
    const parsed = JSON.parse(raw) as Quota;
    if (parsed.day !== today()) return { day: today(), count: 0 };
    return parsed;
  } catch {
    return { day: today(), count: 0 };
  }
}

export function remainingToday(): number {
  return Math.max(0, DAILY_LIMIT - read().count);
}

export function takeQuota(): boolean {
  const q = read();
  if (q.count >= DAILY_LIMIT) return false;
  q.count += 1;
  localStorage.setItem(KEY, JSON.stringify(q));
  return true;
}

export const QUOTA_LIMIT = DAILY_LIMIT;
