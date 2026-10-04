import type { MonthNote } from '@/types';

export const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_SHORT = MONTH_LABELS.map((m) => m.slice(0, 3));

const RATING_MAP: Record<string, MonthNote['rating']> = {
  i: 'ideal',
  g: 'good',
  m: 'mixed',
  a: 'avoid',
};

/**
 * Compact climate table builder — keeps the destination files readable.
 * `ratings` is a 12-character string of i/g/m/a, one per month.
 */
export function buildMonths(
  highs: number[],
  lows: number[],
  ratings: string,
  notes: string[],
): MonthNote[] {
  return MONTH_LABELS.map((label, index) => ({
    month: index + 1,
    label,
    rating: RATING_MAP[ratings[index]] ?? 'mixed',
    note: notes[index] ?? '',
    avgHighC: highs[index],
    avgLowC: lows[index],
  }));
}
