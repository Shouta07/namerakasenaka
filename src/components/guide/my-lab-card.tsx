"use client";

import { useState } from "react";
import { LabRadar } from "@/components/charts/lab-radar";
import { LabValueBar } from "@/components/charts/lab-value-bar";
import { LabDataList } from "@/components/charts/lab-data-list";
import {
  LAB_ROWS,
  RADAR_AXES,
  gaugePercent,
  radarLevel,
  radarRow,
} from "@/lib/accord/labtest-fixtures";

/**
 * お客様のスマホで見る、血液検査の可視化。
 *
 * サロン側（/accord/labtest）と同じレーダーを、お客様の言葉で。
 * 数値の判定表ではなく「6つの力が、どこまでそろったか」。
 * 前回の形を破線で残すので、続けたぶんが図の広がりとして見える。
 */
export function MyLabCard() {
  const [selected, setSelected] = useState(0);
  const now = radarLevel("retest");
  const before = radarLevel("first");

  const values = RADAR_AXES.map((a) => {
    const row = radarRow(a);
    return gaugePercent(row, row.retest);
  });
  const compare = RADAR_AXES.map((a) => {
    const row = radarRow(a);
    return gaugePercent(row, row.first);
  });

  const axis = RADAR_AXES[selected];
  const row = radarRow(axis);

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
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-[#3c6347] text-white">
          <span className="text-[10px] font-bold opacity-80">Lv.</span>
          <span className="ml-0.5 text-xl font-extrabold tabular-nums">
            {now.level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-stone-900">{now.title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-stone-600">
            6つの力のうち{" "}
            <strong className="text-[#3c6347]">{now.gathered} つ</strong>{" "}
            が目安に届きました（前回は {before.gathered} つ）
          </p>
        </div>
      </div>

      {/* レーダー — 前回の形を破線で重ねる */}
      <div className="mt-2">
        <LabRadar
          labels={RADAR_AXES.map((a) => a.label)}
          values={values}
          compare={compare}
          selectedIndex={selected}
          onSelect={setSelected}
          color="#3c6347"
          compareColor="#7da589"
          labelSize={12}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
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
          前回（4月）
        </span>
        <span className="flex items-center gap-1.5 text-[11.5px] text-stone-600">
          <svg width="18" height="8" aria-hidden>
            <line x1="0" y1="4" x2="18" y2="4" stroke="#3c6347" strokeWidth="2" />
          </svg>
          いま（7月）
        </span>
      </div>

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
              {values[selected] >= 100
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
        {RADAR_AXES.map((a, i) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setSelected(i)}
              className={`flex min-h-11 w-full items-center gap-2 text-left ${
                i === selected ? "font-bold" : ""
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
      <details className="group mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[12.5px] font-bold text-[#3c6347]">
          受け取った検査データを見る（{LAB_ROWS.length}項目）
          <span className="ml-1 transition group-open:rotate-180" aria-hidden>
            ▾
          </span>
        </summary>
        <div className="mt-2">
          <LabDataList view="retest" />
        </div>
      </details>

      <p className="mt-3 rounded-2xl bg-[#fafcfa] px-4 py-3 text-[12px] leading-relaxed text-stone-600">
        破線が前回の形です。数字はあなたを評価するものではなく、
        次に何をするかを決めるための材料です。次の検査は11月ごろの予定です。
      </p>
    </section>
  );
}
