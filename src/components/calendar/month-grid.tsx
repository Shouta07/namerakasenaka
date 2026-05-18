import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils/cn";

export type CalendarAppointment = {
  id: string;
  scheduledAt: string; // ISO
  therapistId?: string | null;
  therapistName?: string | null;
  clientName?: string | null;
  status?: string;
  durationMin?: number;
};

export type MonthGridProps = {
  year: number;
  month: number; // 0-11
  appointments: CalendarAppointment[];
  /** ISO date string (yyyy-MM-dd) — shown as the next-recommended slot. */
  recommendedDate?: string;
  /** Map of therapistId → tailwind bg class fragment ("bg-emerald-500" etc.). */
  accentColorByTherapist?: Record<string, string>;
  /** Optional date (yyyy-MM-dd) currently selected. */
  selectedDate?: string;
  /** Optional href factory for clickable days. If omitted, days are static. */
  hrefForDate?: (isoDate: string) => string | null;
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function appointmentsByDay(
  appointments: CalendarAppointment[],
): Map<string, CalendarAppointment[]> {
  const map = new Map<string, CalendarAppointment[]>();
  for (const a of appointments) {
    const key = toIsoDate(new Date(a.scheduledAt));
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return map;
}

/**
 * Server component. Renders a month grid (sm+) and a chronological list (xs).
 * No external library beyond date-fns.
 */
export function MonthGrid({
  year,
  month,
  appointments,
  recommendedDate,
  accentColorByTherapist,
  selectedDate,
  hrefForDate,
}: MonthGridProps) {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  // 6 weeks * 7 days = 42 cells — covers all possible month layouts.
  const days: Date[] = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const byDay = appointmentsByDay(appointments);

  const monthLabel = format(monthStart, "yyyy年M月");

  // For the list view (xs), only show days within this month that have appointments
  // OR are the recommended day OR are the selected day.
  const xsDays = days.filter((d) => {
    if (!isSameMonth(d, monthStart)) return false;
    const iso = toIsoDate(d);
    if (byDay.has(iso)) return true;
    if (iso === recommendedDate) return true;
    if (iso === selectedDate) return true;
    return false;
  });

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-stone-900">{monthLabel}</p>

      {/* sm+ grid */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 text-xs">
          {WEEKDAY_LABELS.map((w, idx) => (
            <div
              key={w}
              className={cn(
                "bg-stone-50 px-2 py-1 text-center font-semibold text-stone-600",
                idx === 0 && "text-red-600",
                idx === 6 && "text-blue-600",
              )}
            >
              {w}
            </div>
          ))}
          {days.map((d) => {
            const iso = toIsoDate(d);
            const inMonth = isSameMonth(d, monthStart);
            const appts = byDay.get(iso) ?? [];
            const isRecommended = iso === recommendedDate;
            const isSelected = iso === selectedDate;
            const isToday = isSameDay(d, new Date());
            const dow = d.getDay();
            const href = hrefForDate?.(iso) ?? null;

            const inner = (
              <div
                className={cn(
                  "flex h-20 flex-col gap-1 bg-white p-1.5",
                  !inMonth && "bg-stone-50/60 text-stone-300",
                  isRecommended && "ring-2 ring-brand-500 ring-inset",
                  isSelected && "bg-brand-50",
                  href && "cursor-pointer hover:bg-brand-50/60",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      inMonth && dow === 0 && "text-red-600",
                      inMonth && dow === 6 && "text-blue-600",
                      isToday && "rounded-full bg-stone-900 px-1.5 text-white",
                    )}
                  >
                    {format(d, "d")}
                  </span>
                  {isRecommended ? (
                    <span className="rounded bg-brand-500 px-1 text-[9px] font-semibold text-white">
                      推奨
                    </span>
                  ) : null}
                </div>
                {appts.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5">
                    {appts.slice(0, 3).map((a) => {
                      const tColor =
                        (a.therapistId && accentColorByTherapist?.[a.therapistId]) ||
                        "bg-brand-400";
                      return (
                        <span
                          key={a.id}
                          title={`${format(new Date(a.scheduledAt), "HH:mm")} ${a.clientName ?? ""}`.trim()}
                          className={cn("inline-block h-1.5 w-1.5 rounded-full", tColor)}
                        />
                      );
                    })}
                    {appts.length > 3 ? (
                      <span className="text-[9px] text-stone-500">+{appts.length - 3}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );

            return href ? (
              <a key={iso} href={href} className="block">
                {inner}
              </a>
            ) : (
              <div key={iso}>{inner}</div>
            );
          })}
        </div>

        <ul className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
          <li className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-400" /> 予約あり
          </li>
          <li className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full ring-2 ring-brand-500" /> 推奨枠
          </li>
        </ul>
      </div>

      {/* xs list */}
      <div className="sm:hidden">
        {xsDays.length === 0 ? (
          <p className="text-sm text-stone-500">この月の予約はまだありません。</p>
        ) : (
          <ul className="space-y-2">
            {xsDays.map((d) => {
              const iso = toIsoDate(d);
              const appts = byDay.get(iso) ?? [];
              const isRecommended = iso === recommendedDate;
              const isSelected = iso === selectedDate;
              const href = hrefForDate?.(iso) ?? null;
              const content = (
                <div
                  className={cn(
                    "rounded-lg border p-3",
                    isRecommended
                      ? "border-brand-500 bg-brand-50/40"
                      : "border-stone-200 bg-white",
                    isSelected && "ring-2 ring-brand-500",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">
                      {format(d, "M月d日(EEE)")}
                    </p>
                    {isRecommended ? (
                      <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        推奨
                      </span>
                    ) : null}
                  </div>
                  {appts.length === 0 ? (
                    <p className="mt-1 text-xs text-stone-500">この日は空きがあります。</p>
                  ) : (
                    <ul className="mt-1 space-y-0.5">
                      {appts.map((a) => (
                        <li key={a.id} className="text-xs text-stone-600">
                          {format(new Date(a.scheduledAt), "HH:mm")}
                          {a.clientName ? ` ・ ${a.clientName}` : ""}
                          {a.therapistName ? ` ・ ${a.therapistName}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
              return (
                <li key={iso}>
                  {href ? (
                    <a href={href} className="block">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
