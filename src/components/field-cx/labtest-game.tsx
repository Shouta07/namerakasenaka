"use client";

import {
  BADGES,
  LAB_VIEW_META,
  MATERIALS,
  STAGES,
  STREAK_NOTE,
  STREAK_WEEKS,
  badgeEarned,
  gaugePercent,
  materialRow,
  materialsLevel,
  stageIndexFor,
  type LabView,
} from "@/lib/field-cx/labtest-fixtures";

/**
 * 検査値を「肌をつくる材料あつめ」に読みかえるお客様側の画面。
 *
 * ゲーミフィケーションの狙いは楽しさではなく、わかりやすさと、
 * 責められている感じを消すこと:
 * - 良い/悪いの判定表 → どこまでそろったかのゲージ
 * - バッジは数字の良し悪しではなく「続けたこと」に対して配る
 * - できなかった週は色が薄くなるだけで、消えない
 */
export function LabtestGame({ view }: { view: LabView }) {
  const lv = materialsLevel(view);
  const before = materialsLevel("first");
  const leveledUp = view === "retest" && lv.level > before.level;
  const stageIndex = stageIndexFor(view);
  const badges = BADGES.map((b) => ({ ...b, earned: badgeEarned(b, view) }));
  const weeks = view === "first" ? [] : STREAK_WEEKS;

  return (
    <div className="rounded-3xl border border-stone-200 bg-gradient-to-b from-brand-50/60 to-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
            CUSTOMER VIEW — お客様のスマホ
          </p>
          <h3 className="mt-1 text-lg font-bold text-stone-900">
            数字を「材料あつめ」に読みかえる
          </h3>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-[12px] font-bold text-stone-600">
          {LAB_VIEW_META[view].label}（{LAB_VIEW_META[view].when}）の画面
        </span>
      </div>

      {/* レベル */}
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-brand-700 text-white">
            <span className="text-[10px] font-bold opacity-80">Lv.</span>
            <span className="ml-0.5 text-2xl font-extrabold tabular-nums">
              {lv.level}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-bold text-stone-900">{lv.title}</p>
              {leveledUp ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-bold text-amber-800">
                  ✨ Lv.{before.level} → Lv.{lv.level} に上がりました
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[12px] text-stone-500">
              肌をつくる材料 {lv.total} つのうち、
              <strong className="text-stone-700">{lv.gathered} つ</strong>
              そろいました（平均 {lv.percent}%）
            </p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: lv.total }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 flex-1 rounded-full transition-all duration-700 ${
                    i < lv.gathered ? "bg-emerald-500" : "bg-stone-100"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-stone-400">
              材料が1つ適正に届くたびに、レベルが1つ上がります。
            </p>
          </div>
        </div>
      </div>

      {/* 材料ゲージ */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MATERIALS.map((m) => {
          const row = materialRow(m);
          const pct = gaugePercent(row, row[view]);
          const pctFirst = gaugePercent(row, row.first);
          const full = pct >= 100;
          return (
            <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden>
                  {m.emoji}
                </span>
                <p className="text-[13.5px] font-bold text-stone-900">{m.label}</p>
                <span className="text-[11px] text-stone-400">{m.role}</span>
                <span
                  className={`ml-auto text-[12px] font-bold tabular-nums ${
                    full ? "text-emerald-700" : "text-stone-600"
                  }`}
                >
                  {full ? "そろいました" : `${pct}%`}
                </span>
              </div>
              <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-stone-100">
                {/* 初回の位置を薄く残す — どれだけ進んだかが見える */}
                {view === "retest" && pctFirst < pct ? (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-brand-100"
                    style={{ width: `${pctFirst}%` }}
                  />
                ) : null}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                    full ? "bg-emerald-500" : "bg-brand-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">
                {row.name} {row[view]}
                {row.unit}
                {view === "retest" && row.retest !== row.first ? (
                  <span className="ml-1 text-stone-400">
                    （初回 {row.first}
                    {row.unit}）
                  </span>
                ) : null}
              </p>
            </div>
          );
        })}
      </div>

      {/* クエストマップ */}
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="text-[13.5px] font-bold text-stone-900">
          🗺 いま、どこにいるか
        </h4>
        <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {STAGES.map((s, i) => {
            const done = i < stageIndex;
            const current = i === stageIndex;
            return (
              <li
                key={s.id}
                className={`flex-1 rounded-2xl border p-3 ${
                  current
                    ? "border-brand-500 bg-brand-50/60"
                    : done
                      ? "border-stone-200 bg-stone-50"
                      : "border-dashed border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base" aria-hidden>
                    {s.emoji}
                  </span>
                  {done ? (
                    <span className="text-[10.5px] font-bold text-emerald-700">✓ 通過</span>
                  ) : current ? (
                    <span className="text-[10.5px] font-bold text-brand-700">▶ いまここ</span>
                  ) : (
                    <span className="text-[10.5px] font-bold text-stone-400">これから</span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] font-bold text-stone-900">{s.label}</p>
                <p className="text-[10.5px] tabular-nums text-stone-400">{s.weeks}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-stone-600">
                  {s.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 継続ヒートマップ */}
      <div className="mt-3 rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="text-[13.5px] font-bold text-stone-900">
          🔥 「今日のひとつ」をつづけた記録
        </h4>
        {weeks.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-center">
            <p className="text-[12.5px] font-semibold text-stone-600">
              これから記録がたまっていきます
            </p>
            <p className="mt-1 text-[11.5px] text-stone-400">
              明日の「今日のひとつ」から、1マスずつ埋まります。
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {weeks.map((w) => (
              <div key={w.week} className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 7 }, (_, d) => (
                    <span
                      key={d}
                      aria-hidden
                      className={`h-4 w-2.5 rounded-sm ${
                        d < w.done ? "bg-brand-500" : "bg-stone-100"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9.5px] tabular-nums text-stone-400">
                  W{w.week}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-stone-500">
          {STREAK_NOTE}
        </p>
      </div>

      {/* バッジ */}
      <div className="mt-3 rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="text-[13.5px] font-bold text-stone-900">
          🏅 あつめたバッジ{" "}
          <span className="ml-1 text-[11.5px] font-medium text-stone-400">
            {badges.filter((b) => b.earned).length} / {badges.length}
          </span>
        </h4>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-3 text-center ${
                b.earned
                  ? "border-brand-100 bg-brand-50/50"
                  : "border-dashed border-stone-200 bg-white"
              }`}
            >
              <p className={`text-2xl ${b.earned ? "" : "opacity-25 grayscale"}`} aria-hidden>
                {b.emoji}
              </p>
              <p
                className={`mt-1 text-[11.5px] font-bold ${
                  b.earned ? "text-stone-900" : "text-stone-400"
                }`}
              >
                {b.label}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-stone-400">{b.how}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-stone-500">
          バッジは検査値の良し悪しでは配りません。続けたこと・受け取ったことに対して増えます。
        </p>
      </div>
    </div>
  );
}
