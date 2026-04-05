import { DateRangePreset } from '@/src/types';

/**
 * Returns an ISO date string (YYYY-MM-DD) offset from today by `n` days.
 */
export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

/**
 * Returns an ISO datetime string offset from today by `n` days,
 * with the given hour and minute (24h format).
 */
export function datetimeFromNow(n: number, hour: number, minute: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Converts a DateRangePreset to concrete start/end date strings (YYYY-MM-DD).
 */
export function resolveDateRange(preset: DateRangePreset): { startDate: string; endDate: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today': {
      const dateStr = formatDateOnly(today);
      return { startDate: dateStr, endDate: dateStr };
    }
    case 'this_week': {
      const endOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      endOfWeek.setDate(today.getDate() + daysUntilSunday);
      return { startDate: formatDateOnly(today), endDate: formatDateOnly(endOfWeek) };
    }
    case 'this_weekend': {
      const dayOfWeek = today.getDay();
      // Saturday
      const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return { startDate: formatDateOnly(saturday), endDate: formatDateOnly(sunday) };
    }
    case 'next_week': {
      const dayOfWeek = today.getDay();
      const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilNextMonday);
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      return { startDate: formatDateOnly(nextMonday), endDate: formatDateOnly(nextSunday) };
    }
    case 'this_month': {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { startDate: formatDateOnly(today), endDate: formatDateOnly(endOfMonth) };
    }
  }
}

/**
 * Returns true if `date` (YYYY-MM-DD) falls within [start, end] inclusive.
 */
export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
function formatDateOnly(d: Date): string {
  return d.toISOString().split('T')[0];
}
