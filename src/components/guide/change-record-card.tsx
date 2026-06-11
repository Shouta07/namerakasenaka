"use client";

import type { DailyCheckRecord } from "@/lib/guide/source";
import { localDateString } from "@/lib/guide/source";
import { cn } from "@/lib/utils/cn";

/**
 * 変化の記録 — 14日のドットストリップ + 肌の調子ミニトレンド + 直近メモ。
 * 「自分の身体は変えられる」という実感のための小さなダッシュボード。
 */
export function ChangeRecordCard({ checks }: { checks: DailyCheckRecord[] }) {
  const byDate = new Map(checks.map((c) => [c.date, c]));

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
      <div className="flex items-end gap-6">
        <div>
          <p className="text-sm text-stone-500">実践日数</p>
          <p className="text-2xl font-semibold text-[#3c6347]">
            {recordedDays}
            <span className="ml-0.5 text-base font-normal text-stone-500">日</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-stone-500">うちアクション実践</p>
          <p className="text-2xl font-semibold text-[#3c6347]">
            {actionDays}
            <span className="ml-0.5 text-base font-normal text-stone-500">日</span>
          </p>
        </div>
      </div>

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
