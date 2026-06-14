"use client";

import { LESSONS, type LessonBadge } from "@/lib/lessons/fixtures";

/**
 * 🌱 「腸のおはなし」 — 獲得バッジの横スクロール一覧。
 *
 * - 未獲得バッジは grayscale + 半透明で並べ、進捗の見通しを残す。
 * - 完全に取得済みでも mythical な「次」がないわけではなく、ふりかえりへの導線になる。
 */
export function LessonBadges({ earned }: { earned: LessonBadge[] }) {
  const earnedIds = new Set(earned.map((b) => b.id));
  const all = LESSONS.map((l) => l.badge);

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        学びの種コレクション
      </p>
      <ul
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
        aria-label="獲得バッジ一覧"
      >
        {all.map((b) => {
          const got = earnedIds.has(b.id);
          return (
            <li
              key={b.id}
              className={
                "flex w-20 flex-none flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center " +
                (got
                  ? "border-[#cfe3cf] bg-[#f3f8f3]"
                  : "border-stone-200 bg-stone-50 opacity-50 grayscale")
              }
              title={b.name + (got ? "（獲得済み）" : "（これから）")}
            >
              <span aria-hidden className="text-2xl">
                {b.emoji}
              </span>
              <span className="text-[11px] font-medium leading-tight text-stone-700">
                {b.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
