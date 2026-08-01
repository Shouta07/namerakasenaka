"use client";

import { useState } from "react";
import {
  CAUSE_LAYER_META,
  CAUSE_MAP_NOTE,
  CAUSE_NODES,
  LAB_VIEW_META,
  RADAR_AXES,
  gaugePercent,
  judgeLab,
  radarRow,
  routeFor,
  type CauseLayer,
  type LabView,
} from "@/lib/accord/labtest-fixtures";

/**
 * 6つの「力」のレーダーと、「なぜそうなっているのか」の地図。
 *
 * 配色は1色2段（初回=薄い / いまの時点=濃い）。before→after は同一の
 * 指標の推移なので、識別色ではなく明度差で見せる。線種（初回は破線）と
 * 直接ラベルを併用し、色だけに頼らせない。数値は上の表にも出ている。
 */

// ラベルが viewBox の外に出ないよう、半径に対して余白を広くとる。
const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 100;
const LABEL_RATIO = 1.26;
// 斜めの軸ラベルは左右に長く出るため、viewBox を横に広げて逃がす。
const VB_X = -34;
const VB_W = SIZE + 68;
const LAYERS: CauseLayer[] = ["life", "body", "sign", "skin"];

function point(i: number, total: number, ratio: number) {
  const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
  return {
    x: CX + Math.cos(angle) * R * ratio,
    y: CY + Math.sin(angle) * R * ratio,
  };
}

function polygon(values: number[]): string {
  return values
    .map((v, i) => {
      const p = point(i, values.length, v / 100);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

export function LabtestRadar({ view }: { view: LabView }) {
  const [selected, setSelected] = useState(RADAR_AXES[0].id);
  const axis = RADAR_AXES.find((a) => a.id === selected) ?? RADAR_AXES[0];
  const row = radarRow(axis);
  const route = routeFor(axis.id);
  const routeSet = new Set(route.path);

  const firstValues = RADAR_AXES.map((a) => {
    const r = radarRow(a);
    return gaugePercent(r, r.first);
  });
  const currentValues = RADAR_AXES.map((a) => {
    const r = radarRow(a);
    return gaugePercent(r, r[view]);
  });
  const showBoth = view === "retest";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* レーダー */}
        <figure className="rounded-2xl border border-stone-200 bg-white p-4">
          <figcaption className="text-[13px] font-bold text-stone-900">
            6つの力が、いまどこまでそろっているか
          </figcaption>
          <p className="mt-0.5 text-[11px] text-stone-500">
            外側が「適正の目安に届いた状態」。中心に近いほど足りていません。
          </p>

          <svg
            viewBox={`${VB_X} 0 ${VB_W} ${SIZE}`}
            className="mx-auto mt-1 w-full max-w-[340px]"
            role="img"
            aria-label={`6つの力のレーダーチャート。${RADAR_AXES.map(
              (a, i) => `${a.label} ${currentValues[i]}%`,
            ).join("、")}`}
          >
            {/* グリッド — 1px・ソリッド・控えめ */}
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <polygon
                key={g}
                points={polygon(RADAR_AXES.map(() => g * 100))}
                fill="none"
                stroke="#e7e5e4"
                strokeWidth={1}
              />
            ))}
            {RADAR_AXES.map((a, i) => {
              const p = point(i, RADAR_AXES.length, 1);
              return (
                <line
                  key={a.id}
                  x1={CX}
                  y1={CY}
                  x2={p.x}
                  y2={p.y}
                  stroke="#e7e5e4"
                  strokeWidth={1}
                />
              );
            })}

            {/* 初回（薄い・破線）— 塗りは重ねない。2枚重ねると濁って読めなくなる */}
            {showBoth ? (
              <polygon
                points={polygon(firstValues)}
                fill="none"
                stroke="#c89679"
                strokeWidth={2}
                strokeDasharray="4 3"
                strokeLinejoin="round"
              />
            ) : null}

            {/* いまの時点（濃い・実線） */}
            <polygon
              points={polygon(currentValues)}
              fill="#8c5a3c"
              fillOpacity={0.1}
              stroke="#8c5a3c"
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* 頂点 — 8px以上・サーフェス色の2pxリング */}
            {RADAR_AXES.map((a, i) => {
              const p = point(i, RADAR_AXES.length, currentValues[i] / 100);
              const r = radarRow(a);
              const on = a.id === selected;
              return (
                <g key={a.id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={on ? 6 : 4.5}
                    fill="#8c5a3c"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  {/* 当たり判定はマークより大きく */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setSelected(a.id)}
                  >
                    <title>{`${a.label}：${currentValues[i]}%（${r.name} ${r[view]}${r.unit}）`}</title>
                  </circle>
                  {/* 直接ラベルは選択中の1点だけ。全点に数字を置くと読まれない */}
                  {on ? (
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={800}
                      fill="#1c1917"
                      stroke="#ffffff"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {currentValues[i]}%
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* 軸ラベル — テキストはテキスト色のまま */}
            {RADAR_AXES.map((a, i) => {
              const p = point(i, RADAR_AXES.length, LABEL_RATIO);
              const on = a.id === selected;
              // 左右の軸はラベルが外にはみ出すので、端を基準に寄せる。
              const dx = p.x - CX;
              const anchor =
                Math.abs(dx) < 8 ? "middle" : dx > 0 ? "start" : "end";
              return (
                <text
                  key={a.id}
                  x={p.x}
                  y={p.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className="cursor-pointer"
                  fontSize={on ? 12 : 11}
                  fontWeight={on ? 800 : 600}
                  fill={on ? "#1c1917" : "#78716c"}
                  onClick={() => setSelected(a.id)}
                >
                  {a.label}
                </text>
              );
            })}
          </svg>

          {/* 凡例 — 2系列あるときは必ず出す */}
          {showBoth ? (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
              <span className="flex items-center gap-1.5 text-[11.5px] text-stone-600">
                <svg width="18" height="8" aria-hidden>
                  <line
                    x1="0"
                    y1="4"
                    x2="18"
                    y2="4"
                    stroke="#c89679"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                </svg>
                初回（Week 1）
              </span>
              <span className="flex items-center gap-1.5 text-[11.5px] text-stone-600">
                <svg width="18" height="8" aria-hidden>
                  <line x1="0" y1="4" x2="18" y2="4" stroke="#8c5a3c" strokeWidth="2" />
                </svg>
                3ヶ月後（Week 12）
              </span>
            </div>
          ) : (
            <p className="mt-1 text-center text-[11.5px] text-stone-500">
              {LAB_VIEW_META[view].label}（{LAB_VIEW_META[view].when}）の状態
            </p>
          )}
        </figure>

        {/* 選んだ力の翻訳 */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap gap-1.5">
            {RADAR_AXES.map((a) => {
              const on = a.id === selected;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a.id)}
                  className={`min-h-11 rounded-full px-4 text-[12px] font-bold transition ${
                    on
                      ? "bg-brand-700 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <h4 className="text-[16px] font-extrabold text-stone-900">
                {axis.label}
              </h4>
              <span className="text-[12px] text-stone-500">
                {row.name} {row[view]}
                {row.unit}
              </span>
              <span className="ml-auto text-[13px] font-bold tabular-nums text-brand-700">
                {gaugePercent(row, row[view])}%
              </span>
            </div>

            <dl className="mt-3 space-y-2.5">
              <div>
                <dt className="text-[11px] font-bold text-stone-500">
                  これは、何をする力か
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-800">
                  {axis.what}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold text-sky-700">
                  足りないと、どうなりうるか
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-700">
                  {axis.ifLow}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold text-emerald-700">
                  いまの状態
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-stone-700">
                  {judgeLab(row, row[view]) === "optimal"
                    ? "適正の範囲に入っています。いまのやり方を続けましょう。"
                    : `適正の目安（${row.optMin}〜${row.optMax}${row.unit}）まで、あと少しです。`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* なぜの地図 */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="text-[14px] font-bold text-stone-900">
            🗺 なぜ「{axis.label}」がこうなっているのか
          </h4>
          <span className="text-[11.5px] text-stone-500">
            左から右へ、1本の道をたどります
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {LAYERS.map((layer, li) => (
            <div key={layer}>
              <p className="text-[11px] font-bold text-stone-900">
                {li + 1}. {CAUSE_LAYER_META[layer].label}
              </p>
              <p className="text-[10px] text-stone-400">
                {CAUSE_LAYER_META[layer].hint}
              </p>
              <ul className="mt-2 space-y-1.5">
                {CAUSE_NODES.filter((n) => n.layer === layer).map((n) => {
                  const on = routeSet.has(n.id);
                  return (
                    <li
                      key={n.id}
                      className={`rounded-xl px-3 py-2 text-[11.5px] leading-snug transition ${
                        on
                          ? "bg-brand-700 font-bold text-white"
                          : "bg-stone-50 text-stone-400"
                      }`}
                    >
                      {on ? "▶ " : ""}
                      {n.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-3 rounded-xl bg-brand-50/60 px-4 py-3 text-[12.5px] leading-relaxed text-stone-700">
          {route.story}
        </p>
        <p className="mt-2 text-[11.5px] leading-relaxed text-stone-500">
          {CAUSE_MAP_NOTE}
        </p>
      </div>
    </div>
  );
}
