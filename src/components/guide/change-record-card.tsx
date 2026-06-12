"use client";

import { Check, Leaf, Sparkles } from "lucide-react";
import type { DailyCheckRecord } from "@/lib/guide/source";
import { localDateString } from "@/lib/guide/source";
import {
  computeCheckStats,
  latestReachedMilestone,
  MILESTONE_DAYS,
} from "@/lib/guide/milestones";
import { cn } from "@/lib/utils/cn";

/**
 * 変化の記録 — 連続記録バッジ + マイルストーン + 14日のドットストリップ +
 * 肌の調子ミニトレンド + 直近メモ。
 * 「自分の身体は変えられる」という実感（自信）のための小さなダッシュボード。
 */
export function ChangeRecordCard({ checks }: { checks: DailyCheckRecord[] }) {
  const byDate = new Map(checks.map((c) => [c.date, c]));
  const stats = computeCheckStats(checks);
  const latestMilestone = latestReachedMilestone(stats);
  // 日付粒度のデータなので「直近24時間」≒「今日達成」と扱う。
  const celebrate =
    latestMilestone && latestMilestone.reachedAt === localDateString()
      ? MILESTONE_DAYS[latestMilestone.id]
      : null;

  // Last 14 days, oldest → newest.
  const days: { date: string; check: DailyCheckRecord | undefined }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const date = localDateString(d);
    days.push({ date, check: byDate.get(date) });
  }

  const recordedDays = checks.length;
  const actionDays = checks.filter((c) => c.actionDone).length;

  const trend = checks
    .filter((c) => c.skinCondition != null)
    .slice(-10);

  const recentMemos = checks
    .filter((c) => c.memo)
    .slice(-3)
    .reverse();

  const encouragement =
    recordedDays >= 7
      ? "すこしずつ、確実に進んでいます"
      : recordedDays >= 3
        ? "いいペースです。記録が増えるほど、変化が見えてきます"
        : "記録は何日からでも始められます。今日の1回で十分です";

  return (
    <div className="space-y-5">
      {celebrate != null ? (
        <p className="flex items-center gap-2 rounded-2xl border border-[#cfe3cf] bg-gradient-to-r from-[#eaf3ea] to-[#f6faf3] px-4 py-3 text-base font-medium leading-relaxed text-[#3c6347]">
          <Sparkles className="h-5 w-5 flex-none text-[#7da589]" aria-hidden />
          {celebrate}日続きました。すばらしい積み重ねです 🌱
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ea] px-3.5 py-1.5 text-base font-semibold text-[#3c6347]">
          <Leaf className="h-4 w-4 text-[#5d8a6c]" aria-hidden />
          れんぞく {stats.currentStreak}日
        </span>
        <p className="text-sm text-stone-500">
          これまで {stats.totalDays}日 記録できました
          <span className="ml-1.5 text-stone-400">
            （アクション実践 {actionDays}日）
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {stats.milestones.map((m) => {
          const n = MILESTONE_DAYS[m.id];
          const reached = m.reachedAt != null;
          return (
            <span
              key={m.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm",
                reached
                  ? "bg-[#dceadf] font-medium text-[#3c6347]"
                  : "border border-dashed border-stone-300 text-stone-400",
              )}
            >
              {reached ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              {n}日
            </span>
          );
        })}
      </div>

      {stats.skinTrend === "up" ? (
        <p className="rounded-2xl bg-[#f3f8f3] px-4 py-3 text-base leading-relaxed text-[#3c6347]">
          肌の調子が少しずつ上向いている記録になっています
        </p>
      ) : stats.skinTrend === "down" ? (
        <p className="rounded-2xl bg-[#f6f9f6] px-4 py-3 text-base leading-relaxed text-stone-600">
          ゆらぎがある時期かもしれません。あせらず続けていきましょう
        </p>
      ) : null}

      <div className="space-y-1.5">
        <p className="text-sm text-stone-500">この14日間</p>
        <div className="flex items-center gap-1.5">
          {days.map(({ date, check }) => (
            <span
              key={date}
              title={date}
              className={cn(
                "h-3.5 flex-1 rounded-full",
                check
                  ? check.actionDone
                    ? "bg-[#5d8a6c]"
                    : "bg-[#b9d2c1]"
                  : "bg-stone-200/70",
              )}
            />
          ))}
        </div>
        <p className="text-xs text-stone-400">
          濃い緑＝アクションできた日 / うすい緑＝記録だけの日
        </p>
      </div>

      {trend.length >= 2 ? (
        <div className="space-y-1.5">
          <p className="text-sm text-stone-500">肌の調子のうつりかわり</p>
          <div className="flex h-16 items-end gap-1.5">
            {trend.map((c) => (
              <div
                key={c.date}
                title={`${c.date}：${c.skinCondition}/5`}
                className="flex-1 rounded-t-lg bg-[#9dc0a8]"
                style={{ height: `${(c.skinCondition ?? 0) * 20}%` }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {recentMemos.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-sm text-stone-500">さいきんのメモ</p>
          <ul className="space-y-1.5">
            {recentMemos.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl bg-[#f6f9f6] px-3.5 py-2.5 text-sm leading-relaxed text-stone-600"
              >
                {c.memo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="rounded-2xl bg-[#eaf3ea] px-4 py-3 text-base font-medium leading-relaxed text-[#3c6347]">
        {encouragement}
      </p>
    </div>
  );
}
