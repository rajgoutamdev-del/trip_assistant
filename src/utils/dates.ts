const MS_PER_DAY = 86_400_000;

export const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const todayISO = (): string => toISODate(new Date());

export const parseISODate = (iso: string): Date => new Date(`${iso}T00:00:00`);

export const addDays = (iso: string, days: number): string =>
  toISODate(new Date(parseISODate(iso).getTime() + days * MS_PER_DAY));

export function daysBetween(fromISO: string, toISOValue: string): number {
  return Math.round((parseISODate(toISOValue).getTime() - parseISODate(fromISO).getTime()) / MS_PER_DAY);
}

/** Inclusive night count used for trip length: 1st to 3rd = 3 days. */
export const tripLengthDays = (startISO: string, endISO: string): number =>
  Math.max(1, daysBetween(startISO, endISO) + 1);

export const daysUntil = (iso: string): number => daysBetween(todayISO(), iso);

export const monthOf = (iso: string): number => parseISODate(iso).getMonth() + 1;

export function eachDate(startISO: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(startISO, i));
}

export function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export const isNightHours = (date = new Date()): boolean => {
  const hour = date.getHours();
  return hour >= 20 || hour < 6;
};
