export function parseJson<T>(input: unknown, fallback: T): T {
  if (input == null || input === '') return fallback;
  if (typeof input === 'object') return input as T;
  if (typeof input !== 'string') return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}
