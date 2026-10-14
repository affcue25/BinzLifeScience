import type { ListItem } from './types';

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/** Like str() but keeps line breaks and spacing inside the text. */
export function text(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim() : '';
}

export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === 'on' || fd.get(key) === 'true';
}

export function int(fd: FormData, key: string, fallback = 0): number {
  const n = parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Reads a JSON array of objects written by the admin list editors. */
export function list(fd: FormData, key: string): ListItem[] {
  const raw = fd.get(key);
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: ListItem[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const row: ListItem = {};
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        row[k] = typeof v === 'string' ? v.trim() : '';
      }
      if (Object.values(row).some((v) => v !== '')) out.push(row);
    }
    return out;
  } catch {
    return [];
  }
}

/** Only files uploaded through the admin are accepted as image / PDF paths. */
export function asset(value: string): string {
  return /^\/uploads\/[A-Za-z0-9._-]+$/.test(value) ? value : '';
}

/** Allows site paths, http(s), mailto and tel links. Blocks javascript: and friends. */
export function link(value: string, fallback = ''): string {
  const v = value.trim();
  if (!v) return fallback;
  if (v.startsWith('/') || v.startsWith('#')) return v;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  return fallback;
}
