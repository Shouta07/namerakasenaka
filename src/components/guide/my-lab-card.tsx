"use client";

import {
  MATERIALS,
  gaugePercent,
  materialRow,
  materialsLevel,
} from "@/lib/accord/labtest-fixtures";

/**
 * お客様のスマホで見る、血液検査の可視化。
 *
 * サロン側の画面（/accord/labtest）と同じデータを、お客様の言葉に置き換える。
 * 数値の判定表ではなく「肌をつくる材料が、どこまでそろったか」。
 * 検査を受けた意味と、続けた結果が、1枚で分かることだけを狙う。
 */
export function MyLabCard() {
  const now = materialsLevel("retest");
  const before = materialsLevel("first");

  return (
    <section className="rounded-3xl border border-[#e3ece3] bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-bold text-stone-900">
          血液検査からわかったこと
        </h2>
        <span className="text-[11px] text-stone-400">7月の再検査ぶん</span>
      </div>

      {/* いまの状態 */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#f3f8f3] p-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#5d8a6c] text-white">
          <span className="text-[10px] font-bold opacity-80">Lv.</span>
          <span className="ml-0.5 text-xl font-extrabold tabular-nums">
            {now.level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-stone-900">{now.title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-stone-600">
            肌をつくる材料 {now.total} つのうち{" "}
            <strong className="text-[#3c6347]">{now.gathered} つ</strong>{" "}
            がそろいました（前回は {before.gathered} つ）
          </p>
        </div>
      </div>

      {/* 材料ごとの伸び */}
      <ul className="mt-4 space-y-3">
        {MATERIALS.map((m) => {
          const row = materialRow(m);
          const pct = gaugePercent(row, row.retest);
          const pctFirst = gaugePercent(row, row.first);
          const full = pct >= 100;
          return (
            <li key={m.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-base" aria-hidden>
                  {m.emoji}
                </span>
                <span className="text-[14px] font-bold text-stone-800">
                  {m.label}
                </span>
                <span className="text-[11px] text-stone-400">{m.role}</span>
                <span
                  className={`ml-auto text-[12px] font-bold tabular-nums ${
                    full ? "text-[#3c6347]" : "text-stone-500"
                  }`}
                >
                  {full ? "そろいました" : `${pct}%`}
                </span>
              </div>
              <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-stone-100">
                {pctFirst < pct ? (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#cfe3cf]"
                    style={{ width: `${pctFirst}%` }}
                  />
                ) : null}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    full ? "bg-[#5d8a6c]" : "bg-[#7da589]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {pctFirst < pct ? (
                <p className="mt-1 text-[11px] text-stone-400">
                  前回 {pctFirst}% → {pct}%
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 rounded-2xl bg-[#fafcfa] px-4 py-3 text-[12px] leading-relaxed text-stone-600">
        薄い色は前回の位置です。数字はあなたを評価するものではなく、
        次に何をするかを決めるための材料です。次の検査は11月ごろの予定です。
      </p>
    </section>
  );
}
