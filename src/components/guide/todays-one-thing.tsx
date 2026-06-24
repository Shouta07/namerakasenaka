"use client";

import { Check, Sparkles } from "lucide-react";
import type { DailyCheckRecord } from "@/lib/guide/source";

/** GuideContent 内の「今日のチェック」カードへスクロールするためのアンカー。 */
export const DAILY_CHECK_ANCHOR_ID = "daily-check";

/**
 * day-of-year に基づき、3つの weekly_actions から今日のひとつを選ぶ。
 * 同じ日のあいだは安定し、日付が変わるとローテーションする（決定的）。
 */
export function pickTodaysAction(actions: string[], today: string): string | null {
  if (actions.length === 0) return null;
  const [y, m, d] = today.split("-").map(Number);
  if (!y || !m || !d) return actions[0];
  const dayOfYear =
    Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000) + 1;
  return actions[dayOfYear % actions.length];
}

/**
 * 「きょうのひとつ」— 週間アクションから毎日ひとつだけを最上部に掲げる。
 * 「今なにをすればいいか」が一目でわかる、今日感のためのカード。
 */
export function TodaysOneThing({
  actions,
  today,
  todayCheck,
}: {
  /** guide.weekly_actions（必ず3つ）。 */
  actions: string[];
  /** YYYY-MM-DD。 */
  today: string;
  todayCheck: DailyCheckRecord | null;
}) {
  const action = pickTodaysAction(actions, today);
  if (!action) return null;

  // 今日のアクションが記録済みなら、静かなねぎらいの状態に切り替える。
  if (todayCheck?.actionDone) {
    return (
      <section className="flex items-center gap-4 rounded-3xl border border-[#cfe3d3] bg-[#f3f8f3] p-5 sm:p-6">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#5d8a6c] text-white shadow-sm">
          <Check className="h-5 w-5" aria-hidden strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7da589]">
            きょうのひとつ
          </p>
          <p className="mt-1 text-base leading-relaxed text-[#3c6347]">
            今日のぶんは完了しました。ゆっくり過ごしてくださいね 🌱
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-[#bcd8c4] bg-gradient-to-br from-[#eef6ee] via-white to-[#fdf7f3] p-5 shadow-sm sm:p-6">
      {/* やわらかい背景アクセント */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#d6ecda]/50 blur-2xl" />
      <div className="relative">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5d8a6c]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          きょうのひとつ
        </p>
        <div className="mt-3 flex items-start gap-3.5">
          <span className="mt-0.5 flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 border-[#bcd8c4] bg-white text-[#5d8a6c] shadow-sm">
            <Check className="h-5 w-5" aria-hidden strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold leading-snug text-stone-800">{action}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
              これだけで今日は十分です
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(DAILY_CHECK_ANCHOR_ID)
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#5d8a6c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.99] hover:bg-[#4f7a5d]"
        >
          できたら記録する ↓
        </button>
      </div>
    </section>
  );
}
