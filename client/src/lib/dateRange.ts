// Shared date-range filtering used by the CEO/admin reporting pages
// (Activity Logs, Dashboard, Analytics, Partnership Pipeline).
//
// A range is defined by a preset (all / day / week / month) anchored on a
// reference date. `start`/`end` are the inclusive bounds — null/null means
// "all time" (no filtering).

export type RangePreset = 'all' | 'day' | 'week' | 'month';

export interface DateRange {
  preset: RangePreset;
  anchor: Date;
  start: Date | null;
  end: Date | null;
}

/** Coerce a Firestore Timestamp | Date | string | number into a Date (or null). */
export function toJsDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
// Week starts on Monday.
const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  const offset = (x.getDay() + 6) % 7; // Mon=0 … Sun=6
  x.setDate(x.getDate() - offset);
  return x;
};
const endOfWeek = (d: Date) => { const x = startOfWeek(d); x.setDate(x.getDate() + 6); return endOfDay(x); };
const startOfMonth = (d: Date) => { const x = startOfDay(d); x.setDate(1); return x; };
const endOfMonth = (d: Date) => endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));

/** Build a DateRange for a preset anchored on a given date. */
export function makeRange(preset: RangePreset, anchor: Date = new Date()): DateRange {
  switch (preset) {
    case 'day':   return { preset, anchor, start: startOfDay(anchor), end: endOfDay(anchor) };
    case 'week':  return { preset, anchor, start: startOfWeek(anchor), end: endOfWeek(anchor) };
    case 'month': return { preset, anchor, start: startOfMonth(anchor), end: endOfMonth(anchor) };
    case 'all':
    default:      return { preset: 'all', anchor, start: null, end: null };
  }
}

/** Move the anchor forward/backward by one unit of the active preset. */
export function shiftRange(range: DateRange, dir: -1 | 1): DateRange {
  if (range.preset === 'all') return range;
  const a = new Date(range.anchor);
  if (range.preset === 'day') a.setDate(a.getDate() + dir);
  else if (range.preset === 'week') a.setDate(a.getDate() + dir * 7);
  else if (range.preset === 'month') a.setMonth(a.getMonth() + dir);
  return makeRange(range.preset, a);
}

/** Inclusive test. "All time" (no bounds) always matches. */
export function inRange(date: Date | null, range: DateRange): boolean {
  if (!range.start || !range.end) return true;
  if (!date) return false;
  return date >= range.start && date <= range.end;
}

/** Human label for the active range. */
export function rangeLabel(range: DateRange): string {
  const { preset, anchor, start, end } = range;
  if (preset === 'all') return 'All time';
  if (preset === 'day') {
    return anchor.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (preset === 'month') {
    return anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  // week
  const s = start!.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const e = end!.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
}

export const ALL_TIME = makeRange('all');
