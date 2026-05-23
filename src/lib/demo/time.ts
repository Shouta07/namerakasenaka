/**
 * Relative time helpers for demo / sales-pitch contexts.
 *
 * The salon-side experience should feel "live" — fixtures use ISO timestamps
 * but the rendered copy is computed at render time relative to `now`, so a
 * page that was generated weeks ago still reads naturally during a demo.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const MONTH_LABEL = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function toDate(input: Date | string): Date {
  return input instanceof Date ? input : new Date(input);
}

/**
 * Return a Japanese relative-time label for the input timestamp.
 *
 * - <1 minute → "たった今"
 * - <1 hour   → "N 分前"
 * - <1 day    → "N 時間前"
 * - yesterday → "昨日"
 * - <7 days   → "N 日前"
 * - <30 days  → "先週" / "2 週間前" / ...
 * - same year → "M/d"
 * - otherwise → "YYYY/M/d"
 */
export function relativeTimeJa(input: Date | string, now: Date = new Date()): string {
  const d = toDate(input);
  if (Number.isNaN(d.getTime())) return "";
  const delta = now.getTime() - d.getTime();

  // Future (rare in demo): fall through to a date label below.
  if (delta < 0) {
    const absDays = Math.round(-delta / DAY);
    if (absDays === 0) return "本日中";
    if (absDays === 1) return "明日";
    if (absDays < 7) return `${absDays} 日後`;
    return formatShortDate(d, now);
  }

  if (delta < MINUTE) return "たった今";
  if (delta < HOUR) {
    const mins = Math.max(1, Math.floor(delta / MINUTE));
    return `${mins} 分前`;
  }
  if (delta < DAY) {
    const hrs = Math.max(1, Math.floor(delta / HOUR));
    return `${hrs} 時間前`;
  }

  // Beyond a day: prefer calendar-aware "昨日" over numeric 24h math.
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "昨日";

  const days = Math.floor(delta / DAY);
  if (days < 7) return `${days} 日前`;
  if (days < 14) return "先週";
  if (days < 30) return `${Math.floor(days / 7)} 週間前`;
  if (days < 60) return "先月";
  return formatShortDate(d, now);
}

function formatShortDate(d: Date, now: Date): string {
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

/** Returns ISO string N days before now (preserving wall-clock hour/min). */
export function daysAgoIso(days: number, hour = 10, minute = 0, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Returns ISO string N days in the future (preserving wall-clock hour/min). */
export function daysAheadIso(days: number, hour = 10, minute = 0, base: Date = new Date()): string {
  return daysAgoIso(-days, hour, minute, base);
}

/** Minutes ago helper. */
export function minutesAgoIso(mins: number, base: Date = new Date()): string {
  return new Date(base.getTime() - mins * MINUTE).toISOString();
}

/** Hours ago helper. */
export function hoursAgoIso(hours: number, base: Date = new Date()): string {
  return new Date(base.getTime() - hours * HOUR).toISOString();
}

/** Japanese long form e.g. "2026年5月18日(月)". */
export function longDateJa(input: Date | string): string {
  const d = toDate(input);
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getFullYear()}年${MONTH_LABEL[d.getMonth()]}${d.getDate()}日(${weekday})`;
}

/** HH:MM clock label. */
export function clockJa(input: Date | string): string {
  const d = toDate(input);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
