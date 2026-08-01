"use client";

import { useState } from "react";
import {
  LAB_JUDGEMENT_META,
  LAB_META,
  LAB_ROWS,
  gaugePercent,
  judgeLab,
  labChange,
} from "@/lib/accord/labtest-fixtures";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

type Mode = "raw" | "friendly";

/**
 * 受け取った検査データの一覧。
 *
 * 「検査票のまま」と「わかりやすく」を切り替えられる。
 * 同じ10項目が、生の数値からどう読みかえられているのかを
 * 自分の目で確かめられることが、図を信じられる条件になる。
 */
export function LabDataList() {
  const [mode, setMode] = useState<Mode>("raw");

  // 変換のしくみを1件で説明するための例（目安に届いていない項目を選ぶ）。
  const sample =
    LAB_ROWS.find((r) => gaugePercent(r, r.retest) < 100) ?? LAB_ROWS[0];
  const samplePct = gaugePercent(sample, sample.retest);

  return (
    <div>
      {/* 出所 */}
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-2xl bg-stone-50 p-3 text-[11.5px]">
        <div>
          <dt className="text-stone-400">1回目の採血</dt>
          <dd className="font-semibold text-stone-700">
            {fmtDate(LAB_META.collectedOn.first)}
          </dd>
        </div>
        <div>
          <dt className="text-stone-400">2回目の採血</dt>
          <dd className="font-semibold text-stone-700">
            {fmtDate(LAB_META.collectedOn.retest)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-stone-400">検査</dt>
          <dd className="font-semibold text-stone-700">
            {LAB_META.panel}（{LAB_META.lab}）
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-stone-400">取り込んだ項目</dt>
          <dd className="font-semibold text-stone-700">
            全 {LAB_META.totalItems} 項目のうち、肌に関わる {LAB_ROWS.length} 項目
          </dd>
        </div>
      </dl>

      {/* 同じデータの2つの見え方 */}
      <div className="mt-3 flex rounded-full border border-stone-200 bg-white p-0.5">
        {(
          [
            ["raw", "検査票のまま"],
            ["friendly", "わかりやすく"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={mode === k}
            onClick={() => setMode(k)}
            className={`min-h-11 flex-1 rounded-full text-[12.5px] font-bold transition ${
              mode === k ? "bg-[#3c6347] text-white" : "text-stone-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-stone-500">
        {mode === "raw"
          ? "クリニックから届いた検査票と同じ並びです。"
          : "同じ10項目を、読める形に置きかえたものです。数字は変えていません。"}
      </p>

      {mode === "raw" ? <RawTable /> : <FriendlyList />}

      {/* 変換のしくみ — %がどこから来たのかを1件で示す */}
      <div className="mt-3 rounded-2xl bg-[#f6f9f6] p-3">
        <p className="text-[11.5px] font-bold text-stone-700">
          レーダーの % は、こう出しています
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-stone-700">
          {sample.name} は <strong>{sample.retest}</strong>
          {sample.unit}。目安の下限が {sample.optMin}
          {sample.unit} なので、{sample.retest} ÷ {sample.optMin} ={" "}
          <strong>{samplePct}%</strong> と表示しています。
          目安の範囲に入っていれば 100% です。
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-stone-500">
          単位がばらばらの項目を1枚の図に重ねるための置きかえです。
          検査値そのものは上の「検査票のまま」で確認できます。
        </p>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
        検査値の解釈と診断は医師が行います。内容は{LAB_META.reviewedBy}が確認しています。
      </p>
    </div>
  );
}

/** 検査票の書式に寄せた素の表。加工していないことが伝わる見た目にする。 */
function RawTable() {
  return (
    // スマホで基準範囲まで読めるよう4列に収める。単位は項目名の下へ。
    <div className="mt-2 rounded-2xl border border-stone-200 bg-white">
      <table className="w-full table-fixed text-left text-[12px] tabular-nums">
        <thead>
          <tr className="border-b border-stone-200 text-[10.5px] text-stone-500">
            <th className="w-[38%] px-3 py-2 font-semibold">検査項目</th>
            <th className="w-[15%] px-1 py-2 text-right font-semibold">4/2</th>
            <th className="w-[15%] px-1 py-2 text-right font-semibold">7/20</th>
            <th className="px-3 py-2 text-right font-semibold">基準範囲</th>
          </tr>
        </thead>
        <tbody>
          {LAB_ROWS.map((r) => (
            <tr key={r.id} className="border-b border-stone-100 last:border-0">
              <td className="px-3 py-2 align-top">
                <span className="block font-medium leading-tight text-stone-800">
                  {r.name}
                </span>
                <span className="block text-[10px] text-stone-400">{r.unit}</span>
              </td>
              <td className="px-1 py-2 text-right align-top text-stone-500">
                {r.first}
              </td>
              <td className="px-1 py-2 text-right align-top font-bold text-stone-900">
                {r.retest}
              </td>
              <td className="px-3 py-2 text-right align-top text-[11px] text-stone-500">
                {r.refMin}〜{r.refMax}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 同じデータを、判定と意味つきで読める形に。 */
function FriendlyList() {
  return (
    <ul className="mt-2 divide-y divide-stone-100">
      {LAB_ROWS.map((r) => {
        const j = judgeLab(r, r.retest);
        const meta = LAB_JUDGEMENT_META[j];
        const change = labChange(r);
        return (
          <li key={r.id} className="py-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold text-stone-900">{r.name}</span>
              <span className="text-[10.5px] text-stone-400">{r.category}</span>
              <span
                className={`ml-auto whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.chip}`}
              >
                {meta.label}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span className="text-[12px] tabular-nums text-stone-400">
                {r.first}
              </span>
              <span className="text-[11px] text-stone-300" aria-hidden>
                →
              </span>
              <span className="text-[15px] font-extrabold tabular-nums text-stone-900">
                {r.retest}
              </span>
              <span className="text-[11px] text-stone-500">{r.unit}</span>
              {r.first !== r.retest ? (
                <span className="text-[11px] text-stone-400">（{change.label}）</span>
              ) : null}
              <span className="ml-auto text-[10.5px] tabular-nums text-stone-400">
                目安 {r.optMin}〜{r.optMax}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-500">
              {r.note}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
