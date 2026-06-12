"use client";

import { Sparkles } from "lucide-react";
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
      <section className="rounded-3xl border border-[#dceadf] bg-[#f3f8f3] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#7da589]">
          きょうのひとつ
        </p>
        <p className="mt-2 text-base leading-relaxed text-[#3c6347]">
          今日のぶんは記録済みです。ゆっくり過ごしてくださいね 🌱
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border-2 border-[#bcd8c4] bg-gradient-to-b from-[#eef6ee] to-white p-5 shadow-sm sm:p-6">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5d8a6c]">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        きょうのひとつ
      </p>
      <p className="mt-3 text-xl font-semibold leading-snug text-stone-800">{action}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        これだけで今日は十分です
      </p>
      <p className="mt-4 text-right">
        <button
          type="button"
          onClick={() =>
            document
              .getElementById(DAILY_CHECK_ANCHOR_ID)
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="text-sm font-medium text-[#587f63] underline underline-offset-2 hover:text-[#3c6347]"
        >
          今日のチェックへ ↓
        </button>
      </p>
    </section>
  );
}
