"use client";

import { useMemo, useRef, useState } from "react";
import { LabRadar } from "@/components/charts/lab-radar";
import { LabValueBar } from "@/components/charts/lab-value-bar";
import { LabDataList } from "@/components/charts/lab-data-list";
import {
  LAB_ROWS,
  RADAR_AXES,
  gaugePercent,
  radarLevelFromRows,
  type LabRow,
} from "@/lib/accord/labtest-fixtures";
import {
  usePublishedLabSeries,
  type PublishedLabSeries,
} from "@/lib/labtest/published";
import { isDemoMode } from "@/lib/demo";

/**
 * お客様のスマホで見る、血液検査の可視化。
 *
 * サロン側（/accord/labtest）と同じレーダーを、お客様の言葉で。
 * 数値の判定表ではなく「6つの力が、どこまでそろったか」。
 * 前回の形を破線で残すので、続けたぶんが図の広がりとして見える。
 */
export function MyLabCard({ customerId = null }: { customerId?: string | null }) {
  const [selected, setSelected] = useState(0);
  const [rawOpen, setRawOpen] = useState(false);
  const rawRef = useRef<HTMLDetailsElement>(null);

  function openRaw() {
    setRawOpen(true);
    // 開いてから位置を合わせる。畳んだままだと高さが確定しない。
    requestAnimationFrame(() =>
      rawRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  // 施術者が取り込んで公開した検査があればそれを使う。
  //
  // 無いときの扱いは、デモと本番で変える必要がある。
  // デモでは見本を出したい（空の図では商品を説明できない）。
  // だが本番で、ご自身の検査ページに架空の数値が出るのは事故に等しい。
  // だから本番では見本に落とさず、静かに何も出さない。
  const demo = isDemoMode();
  const published = usePublishedLabSeries(customerId);
  const rowById = useMemo(() => {
    const src: LabRow[] | null = published?.rows ?? (demo ? LAB_ROWS : null);
    return new Map((src ?? []).map((r) => [r.id, r]));
  }, [published, demo]);

  // 検査票に無かった項目は軸から外す。測っていないものを
  // 「届いていない」と描くと、事実でないことを図にしてしまう。
  const axes = useMemo(
    () => RADAR_AXES.filter((a) => rowById.has(a.rowId)),
    [rowById],
  );
  const rows = useMemo(
    () => axes.map((a) => rowById.get(a.rowId)!),
    [axes, rowById],
  );

  const safeIndex = Math.min(selected, Math.max(0, axes.length - 1));
  const now = radarLevelFromRows(rows, "retest");
  const before = radarLevelFromRows(rows, "first");

  const values = rows.map((r) => gaugePercent(r, r.retest));
  const compare = rows.map((r) => gaugePercent(r, r.first));

  if (axes.length === 0) return null;

  const axis = axes[safeIndex];
  const row = rows[safeIndex];
  const hasPrevious = published ? published.previousCollectedOn !== null : true;

  return (
    <section className="rounded-3xl border border-[#e3ece3] bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-bold text-stone-900">
          血液検査からわかったこと
        </h2>
        <span className="text-[11px] text-stone-400">
          {published ? `${jaDate(published.latestCollectedOn)} 採血ぶん` : "見本のデータ"}
        </span>
      </div>

      {/* この図が何からできているか。生データへの入口は、上にも置く。 */}
      <p className="mt-1 text-[11.5px] leading-relaxed text-stone-500">
        {published
          ? `${jaDate(published.latestCollectedOn)}の血液検査 ${published.totalValues} 項目から、店舗が取り込んでつくっています。`
          : `7月20日の血液検査 ${LAB_ROWS.length} 項目からつくっています。`}
        <button
          type="button"
          onClick={openRaw}
          className="tap-44 ml-1 font-bold text-[#3c6347] underline underline-offset-2"
        >
          生データを見る
        </button>
      </p>

      {/* いまの状態 */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#f3f8f3] p-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#3c6347] text-white">
          <span className="text-[10px] font-bold opacity-80">Lv.</span>
          <span className="ml-0.5 text-xl font-extrabold tabular-nums">
            {now.level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-stone-900">{now.title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-stone-600">
            {axes.length}つの力のうち{" "}
            <strong className="text-[#3c6347]">{now.gathered} つ</strong>{" "}
            が目安に届きました
            {hasPrevious ? `（前回は ${before.gathered} つ）` : ""}
          </p>
        </div>
      </div>

      {/* レーダー — 前回の形を破線で重ねる */}
      <div className="mt-2">
        <LabRadar
          labels={axes.map((a) => a.label)}
          values={values}
          compare={hasPrevious ? compare : undefined}
          selectedIndex={safeIndex}
          onSelect={setSelected}
          color="#3c6347"
          compareColor="#7da589"
          labelSize={12}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {hasPrevious ? (
          <span className="flex items-center gap-1.5 text-[11.5px] text-stone-600">
            <svg width="18" height="8" aria-hidden>
              <line
                x1="0"
                y1="4"
                x2="18"
                y2="4"
                stroke="#7da589"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            前回（{published ? jaShort(published.previousCollectedOn!) : "4月"}）
          </span>
        ) : null}
        <span className="flex items-center gap-1.5 text-[11.5px] text-stone-600">
          <svg width="18" height="8" aria-hidden>
            <line x1="0" y1="4" x2="18" y2="4" stroke="#3c6347" strokeWidth="2" />
          </svg>
          いま（{published ? jaShort(published.latestCollectedOn) : "7月"}）
        </span>
      </div>
      {!hasPrevious ? (
        <p className="text-center text-[11.5px] leading-relaxed text-stone-500">
          今回が1回目です。次の検査を受けると、前回の形が破線で重なります。
        </p>
      ) : null}

      {/* 選んだ力 — 元データと、その指標が何かを出す */}
      <div className="mt-3 rounded-2xl bg-[#f6f9f6] p-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-[16px] font-bold text-stone-900">{axis.label}</p>
          <span className="text-[11.5px] text-stone-500">{row.name}</span>
          <span className="ml-auto flex items-center gap-0.5" aria-label={`重要度 ${axis.importance}`}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                aria-hidden
                className={`text-[11px] ${i <= axis.importance ? "text-[#3c6347]" : "text-stone-300"}`}
              >
                ★
              </span>
            ))}
          </span>
        </div>

        {/* 実測値 — ここが「元データ」 */}
        <div className="mt-3 flex items-end gap-2">
          <span className="text-[26px] font-extrabold leading-none tabular-nums text-stone-900">
            {row.retest}
          </span>
          <span className="pb-0.5 text-[12px] font-semibold text-stone-500">
            {row.unit}
          </span>
          <span className="ml-auto pb-0.5 text-[12px] tabular-nums text-stone-500">
            前回 {row.first}
            {row.unit} → いま {row.retest}
            {row.unit}
          </span>
        </div>

        <div className="mt-2">
          <LabValueBar row={row} value={row.retest} previous={row.first} />
        </div>

        <dl className="mt-3 space-y-2.5">
          <div>
            <dt className="text-[11px] font-bold text-stone-500">
              これは何を見ている数字か
            </dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-800">
              {axis.what}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-stone-500">背中の肌との関わり</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-700">
              {axis.skinLink}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-[#3c6347]">いまの状態</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-700">
              {values[safeIndex] >= 100
                ? "目安に届いています。いまのやり方を続けましょう。"
                : axis.ifLow}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-[#3c6347]">今日からできること</dt>
            <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-700">
              {axis.action}
            </dd>
          </div>
        </dl>
      </div>

      {/* 数値の一覧 — 図だけに頼らせない */}
      <ul className="mt-3 divide-y divide-stone-100">
        {axes.map((a, i) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setSelected(i)}
              className={`flex min-h-11 w-full items-center gap-2 text-left ${
                i === safeIndex ? "font-bold" : ""
              }`}
            >
              <span className="flex-1 text-[13px] text-stone-700">{a.label}</span>
              <span className="text-[12px] tabular-nums text-stone-400">
                {compare[i]}%
              </span>
              <span className="text-[11px] text-stone-300" aria-hidden>
                →
              </span>
              <span
                className={`w-12 text-right text-[13px] font-bold tabular-nums ${
                  values[i] >= 100 ? "text-[#3c6347]" : "text-stone-700"
                }`}
              >
                {values[i]}%
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* 取り込んだ検査データそのもの。加工前を見られることが信用になる。 */}
      <details
        ref={rawRef}
        className="group mt-3 scroll-mt-16"
        open={rawOpen}
        onToggle={(e) => setRawOpen((e.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[12.5px] font-bold text-[#3c6347]">
          受け取った生の検査データを見る（
          {published ? published.totalValues : LAB_ROWS.length}項目）
          <span className="ml-1 transition group-open:rotate-180" aria-hidden>
            ▾
          </span>
        </summary>
        <div className="mt-2">
          {published ? (
            <IngestedRawTable series={published} />
          ) : (
            <LabDataList />
          )}
        </div>
      </details>

      <p className="mt-3 rounded-2xl bg-[#fafcfa] px-4 py-3 text-[12px] leading-relaxed text-stone-600">
        {hasPrevious ? "破線が前回の形です。" : ""}
        数字はあなたを評価するものではなく、次に何をするかを決めるための材料です。
      </p>

      {published ? (
        <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
          このページは、{jaDate(published.latestCollectedOn)}の検査結果を
          店舗（{published.importedBy}）が取り込んだものです。
          ご本人の同意にもとづいて表示しています。表示をやめたいときは、
          店舗にお申しつけください。
        </p>
      ) : null}
    </section>
  );
}

/** 2026-07-20 → 7月20日 */
function jaDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

/** 2026-07-20 → 7月 */
function jaShort(iso: string): string {
  const [, m] = iso.split("-");
  return `${Number(m)}月`;
}

/**
 * 取り込んだ生データの表。
 *
 * 「見せている図が、この数字からできている」を1画面で確かめられること。
 * 加工前を隠さないことが、数値を扱う商品の最低条件だと考えている。
 */
function IngestedRawTable({ series }: { series: PublishedLabSeries }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200">
      <table className="min-w-[400px] border-collapse text-[12px]">
        <thead>
          <tr className="bg-stone-50 text-stone-500">
            <th className="px-3 py-2 text-left font-medium">項目</th>
            <th className="px-3 py-2 text-right font-medium">
              {series.previousCollectedOn ? jaShort(series.previousCollectedOn) : "—"}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {jaShort(series.latestCollectedOn)}
            </th>
            <th className="px-3 py-2 text-left font-medium">適正の目安</th>
          </tr>
        </thead>
        <tbody>
          {series.rows.map((r) => (
            <tr key={r.id} className="border-t border-stone-100">
              <td className="px-3 py-2 text-stone-700">{r.name}</td>
              <td className="px-3 py-2 text-right tabular-nums text-stone-400">
                {series.previousCollectedOn ? r.first : "—"}
              </td>
              <td className="px-3 py-2 text-right font-bold tabular-nums text-stone-900">
                {r.retest}
              </td>
              <td className="px-3 py-2 tabular-nums text-stone-500">
                {r.optMin}〜{r.optMax} {r.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
