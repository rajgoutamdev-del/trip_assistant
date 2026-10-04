type ClassValue = string | number | false | null | undefined;

/** Minimal class joiner — no need for a dependency to do this. */
export const cn = (...values: ClassValue[]): string => values.filter(Boolean).join(' ');
