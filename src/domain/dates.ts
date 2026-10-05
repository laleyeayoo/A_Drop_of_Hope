/** Small date helpers. All stored dates are ISO strings. */

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(a: string | Date, b: string | Date): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / DAY_MS;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** "YYYY-MM" in local time — used to group things by month. */
export function monthKey(date: string | Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "YYYY-MM-DD" in local time. */
export function dayKey(date: string | Date): string {
  const d = new Date(date);
  return `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** Accepts "YYYY", "YYYY-MM" or "YYYY-MM-DD" and checks it is a real date. */
export function isValidPartialDate(value: string): boolean {
  if (/^\d{4}$/.test(value)) return true;
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return false;
  if (m[3] === undefined) return true;
  const day = Number(m[3]);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Short month label for charts, e.g. "Oct". */
export function formatMonth(key: string, locale = 'en-US'): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short' });
}
