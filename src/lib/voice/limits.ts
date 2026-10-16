export const MAX_CHARS = 10_000;
export const CHUNK_CHARS = 2_500;
export const MIN_CLONE_SECONDS = 3;
export const MAX_CLONE_SECONDS = 30;

export function splitScript(text: string, max = CHUNK_CHARS): string[] {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return [];
  if (trimmed.length <= max) return [trimmed];

  const parts: string[] = [];
  const pieces = trimmed.split(/(?<=[။!?。！？.!?])\s+/);
  let buf = "";

  const flush = () => {
    const next = buf.trim();
    if (next) parts.push(next);
    buf = "";
  };

  for (const piece of pieces) {
    if (piece.length > max) {
      flush();
      for (let i = 0; i < piece.length; i += max) {
        parts.push(piece.slice(i, i + max));
      }
      continue;
    }
    const joined = buf ? `${buf} ${piece}` : piece;
    if (joined.length > max) {
      flush();
      buf = piece;
    } else {
      buf = joined;
    }
  }
  flush();
  return parts;
}
