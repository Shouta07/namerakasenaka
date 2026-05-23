"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { cn } from "@/lib/utils/cn";
import type { DayAvailability, TimeSlot } from "@/lib/demo/fixtures";

export type DateSlotPickerProps = {
  availability: DayAvailability[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  /** Date string (YYYY-MM-DD) flagged as the course-recommended slot. */
  recommendedDate?: string;
  /** Time string (HH:mm) flagged as the recommended slot on the recommended day. */
  recommendedTime?: string;
  therapistName?: string;
  /** Fired when the user taps "この枠で予約する". */
  onConfirm?: (args: { date: string; time: string }) => void;
  /** Disables the confirm CTA while a parent request is in flight. */
  submitting?: boolean;
  /** Label override for the confirm button. */
  confirmLabel?: string;
  /** Optional link/CTA shown when no slots are open. */
  emptyStateCta?: React.ReactNode;
};

const WEEKDAY_SHORT = ["日", "月", "火", "水", "木", "金", "土"] as const;

function dateFromKey(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatDateLong(iso: string): string {
  const d = dateFromKey(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAY_SHORT[d.getDay()]})`;
}

function statusLabel(day: DayAvailability): {
  text: string;
  tone: "ok" | "warn" | "full" | "closed";
} {
  if (day.isClosed) return { text: "定休日", tone: "closed" };
  if (day.openSlots === 0) return { text: "満", tone: "full" };
  if (day.openSlots <= 2) return { text: `残り ${day.openSlots}`, tone: "warn" };
  return { text: `空き ${day.openSlots}`, tone: "ok" };
}

function nowClock(now: Date): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function DateSlotPicker({
  availability,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  recommendedDate,
  recommendedTime,
  therapistName,
  onConfirm,
  submitting,
  confirmLabel = "この枠で予約する",
  emptyStateCta,
}: DateSlotPickerProps) {
  const [updatedAt] = React.useState(() => new Date());
  const slotGridRef = React.useRef<HTMLDivElement | null>(null);
  const recommendedCardRef = React.useRef<HTMLButtonElement | null>(null);

  // Scroll the recommended date into view on mount so it's immediately visible.
  React.useEffect(() => {
    if (!recommendedDate) return;
    const node = recommendedCardRef.current;
    if (!node) return;
    try {
      node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    } catch {
      // ignore — scrollIntoView is best-effort.
    }
    // Only on mount or when recommended date changes.
  }, [recommendedDate]);

  // When date changes, scroll the slot grid into view.
  React.useEffect(() => {
    if (!selectedDate) return;
    const node = slotGridRef.current;
    if (!node) return;
    try {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // ignore
    }
  }, [selectedDate]);

  const selectedDay = React.useMemo(
    () => availability.find((d) => d.date === selectedDate) ?? null,
    [availability, selectedDate],
  );

  const dotTone = (tone: "ok" | "warn" | "full" | "closed"): string => {
    switch (tone) {
      case "ok":
        return "bg-emerald-500";
      case "warn":
        return "bg-amber-500";
      case "full":
        return "bg-red-500";
      default:
        return "bg-stone-300";
    }
  };

  const visibleSlots: TimeSlot[] = React.useMemo(() => {
    if (!selectedDay) return [];
    // 'closed' slots are hidden from the grid entirely.
    return selectedDay.slots.filter((s) => s.status !== "closed");
  }, [selectedDay]);

  const canConfirm = Boolean(selectedDate && selectedTime) && !submitting;

  return (
    <div className="space-y-5">
      {/* Header: 担当 + live timestamp. */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          {therapistName ? (
            <>
              担当: <span className="font-semibold text-stone-900">{therapistName}</span>
            </>
          ) : (
            <>サロン全体の空き状況</>
          )}
        </span>
        <span aria-label="最終更新">予約状況の更新: {nowClock(updatedAt)}</span>
      </div>

      {/* Step 1 — date strip. */}
      <section aria-labelledby="step-date" className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 id="step-date" className="text-sm font-semibold text-stone-900">
            1. 日付を選ぶ
          </h3>
          <span className="text-[11px] text-stone-500">14 日間</span>
        </div>
        <ul
          className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 sm:grid sm:snap-none sm:grid-cols-7 sm:gap-2 sm:overflow-visible"
        >
          {availability.map((day) => {
            const isSelected = day.date === selectedDate;
            const isRecommended = day.isRecommended;
            const disabled = day.isClosed || day.openSlots === 0;
            const stat = statusLabel(day);
            const d = dateFromKey(day.date);
            return (
              <li key={day.date} className="snap-start">
                <button
                  type="button"
                  ref={isRecommended ? recommendedCardRef : null}
                  disabled={disabled}
                  onClick={() => onSelectDate(day.date)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDateLong(day.date)} ${stat.text}`}
                  className={cn(
                    "relative flex w-16 flex-col items-center justify-between rounded-xl border px-1.5 py-2 text-center transition-all duration-150 ease-out sm:w-full",
                    isSelected ? "h-20 scale-[1.02]" : "h-16",
                    disabled
                      ? "border-stone-200 bg-stone-50 text-stone-400"
                      : isSelected
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-stone-200 bg-white text-stone-700 hover:border-brand-300",
                    isRecommended && !isSelected && "border-brand-300",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      day.weekday === 0 && !disabled && !isSelected && "text-red-600",
                      day.weekday === 6 && !disabled && !isSelected && "text-blue-600",
                    )}
                  >
                    {WEEKDAY_SHORT[day.weekday]}
                  </span>
                  <span
                    className={cn(
                      isSelected ? "text-xl font-semibold" : "text-lg font-semibold",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] leading-none">
                    <span
                      aria-hidden
                      className={cn("inline-block h-1.5 w-1.5 rounded-full", dotTone(stat.tone))}
                    />
                    <span
                      className={cn(
                        stat.tone === "warn" && "text-amber-600",
                        stat.tone === "full" && "text-red-600",
                        stat.tone === "closed" && "text-stone-400",
                      )}
                    >
                      {stat.text}
                    </span>
                  </span>
                  {isRecommended ? (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-brand-500 bg-white px-1.5 py-px text-[9px] font-semibold leading-none text-brand-700 shadow-sm">
                      推奨
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Step 2 — slot grid. */}
      <section
        ref={slotGridRef}
        aria-labelledby="step-slot"
        className="space-y-2 scroll-mt-4"
      >
        <h3 id="step-slot" className="text-sm font-semibold text-stone-900">
          2. 時間を選ぶ
        </h3>

        {!selectedDay ? (
          <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center text-sm text-stone-500">
            まず上の日付を選んでください。
          </p>
        ) : selectedDay.isClosed ? (
          <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center text-sm text-stone-500">
            この日は定休日です。別の日を選択してください。
          </p>
        ) : visibleSlots.every((s) => s.status !== "open") ? (
          <div className="space-y-3 rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center">
            <p className="text-sm text-stone-600">
              この日は空きがありません — 別の日を選択してください。
            </p>
            {emptyStateCta}
          </div>
        ) : (
          <>
            <p className="text-xs text-stone-500">
              {formatDateLong(selectedDay.date)} の空き枠
            </p>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {visibleSlots.map((slot) => {
                const isSelected = slot.time === selectedTime;
                const isRecommended =
                  selectedDay.isRecommended &&
                  recommendedTime !== undefined &&
                  slot.time === recommendedTime &&
                  slot.status === "open";
                const disabled = slot.status !== "open";
                return (
                  <li key={slot.time} className="relative">
                    {isRecommended ? (
                      <span className="absolute -top-2 left-2 z-10 rounded-full border border-brand-500 bg-white px-1.5 py-px text-[9px] font-semibold leading-none text-brand-700 shadow-sm">
                        推奨
                      </span>
                    ) : null}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelectTime(slot.time)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-lg border px-2 text-sm font-medium transition-all duration-150 ease-out",
                        slot.status === "open" &&
                          !isSelected &&
                          "border-stone-200 bg-white text-stone-800 hover:bg-brand-50",
                        isSelected &&
                          "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500 shadow-sm",
                        slot.status === "booked" &&
                          "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 line-through",
                        slot.status === "past" &&
                          "cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300",
                        isRecommended && !isSelected && "border-brand-400",
                      )}
                    >
                      {slot.time}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {/* Step 3 — sticky confirm bar. */}
      {selectedDate && selectedTime ? (
        <StickyActionBar>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-600 sm:text-sm">
              予約: {" "}
              <span className="font-semibold text-stone-900">
                {formatDateLong(selectedDate)} {selectedTime}
              </span>
              {therapistName ? (
                <>
                  {" "}/ 担当:{" "}
                  <span className="font-semibold text-stone-900">{therapistName}</span>
                </>
              ) : null}
            </p>
            <Button
              type="button"
              size="lg"
              disabled={!canConfirm}
              onClick={() => {
                if (!selectedDate || !selectedTime) return;
                onConfirm?.({ date: selectedDate, time: selectedTime });
              }}
              className="w-full sm:w-auto"
            >
              {submitting ? "送信中…" : confirmLabel}
            </Button>
          </div>
        </StickyActionBar>
      ) : null}
    </div>
  );
}

/** Combine YYYY-MM-DD + HH:mm → ISO string (local time). */
export function combineDateTimeToIso(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  return dt.toISOString();
}

/** Format the per-day label as "M月D日(曜)". */
export function formatDateJa(iso: string): string {
  return format(dateFromKey(iso), "M月d日(EEE)");
}
