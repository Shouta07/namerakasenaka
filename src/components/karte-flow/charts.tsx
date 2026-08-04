"use client";

import { useState } from "react";
import {
  FUNNEL_THIS_MONTH,
  MONTHLY_TREND,
  STAFF_CONVERSION,
} from "@/lib/field-cx/fixtures";

/**
 * Field CX ダッシュボードのチャート群。
 *
 * 方針（dataviz 準拠）:
 * - すべて単一指標 or 全体に対する塗り（part-to-whole）。カテゴリカルな
 *   多色は使わない（ブランド茶は単独の sequential 用途に限定）。
 * - 値は直接ラベルで常時可視。ホバーは補足情報のみ。
 * - 2軸チャートは作らない。件数と率は別のチャートに分ける。
 */

const BRAND = "#8c5a3c";
const BRAND_SOFT = "#e9d5c6";

// ---------------------------------------------------------------
// ファネル（今月）
// ---------------------------------------------------------------

export function FunnelChart() {
  const max = FUNNEL_THIS_MONTH[0].count;
  return (
    <div className="space-y-2.5" role="img" aria-label="初回予約から成約までのファネル">
      {FUNNEL_THIS_MONTH.map((s, i) => {
        const prev = i > 0 ? FUNNEL_THIS_MONTH[i - 1].count : null;
        const rate = prev ? Math.round((s.count / prev) * 100) : null;
        return (
          <div key={s.stage} className="group">
            <div className="flex items-baseline justify-between">
              <p className="text-[12px] font-semibold text-stone-600">
                {s.stage}
              </p>
              <p className="text-[12px] tabular-nums text-stone-500">
                <span className="font-bold text-stone-900">{s.count}</span> 件
                {rate !== null ? (
                  <span className="ml-1.5 text-[11px] text-stone-400">
                    （前段から {rate}%）
                  </span>
                ) : null}
              </p>
            </div>
            <div className="mt-1 h-4 w-full rounded-[4px] bg-stone-100">
              <div
                className="h-4 rounded-[4px] transition-all group-hover:opacity-90"
                style={{
                  width: `${(s.count / max) * 100}%`,
                  background: BRAND,
                  opacity: 0.55 + (i / (FUNNEL_THIS_MONTH.length - 1)) * 0.45,
                }}
                title={`${s.stage}: ${s.count}件`}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-stone-400">
        初回予約 → 成約の通過率{" "}
        <span className="font-bold text-brand-700">
          {Math.round(
            (FUNNEL_THIS_MONTH[FUNNEL_THIS_MONTH.length - 1].count / max) * 100,
          )}
          %
        </span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------
// 成約率の推移（6ヶ月・折れ線）
// ---------------------------------------------------------------

export function TrendChart() {
  const [hover, setHover] = useState<number | null>(null);
  const data = MONTHLY_TREND.map((d) => ({
    ...d,
    rate: Math.round((d.contracts / d.counseling) * 100),
  }));
  const W = 560;
  const H = 180;
  const PAD = { l: 34, r: 16, t: 14, b: 26 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const yMax = 80;
  const x = (i: number) => PAD.l + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.t + innerH - (v / yMax) * innerH;
  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.rate)}`)
    .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="月別の成約率の推移（折れ線グラフ）"
      >
        {/* グリッド */}
        {[0, 20, 40, 60, 80].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              y1={y(v)}
              x2={W - PAD.r}
              y2={y(v)}
              stroke="#e7e5e4"
              strokeWidth={1}
            />
            <text
              x={PAD.l - 6}
              y={y(v)}
              fontSize={10}
              fill="#a8a29e"
              textAnchor="end"
              dominantBaseline="central"
            >
              {v}%
            </text>
          </g>
        ))}
        {/* 折れ線 */}
        <path d={path} fill="none" stroke={BRAND} strokeWidth={2} strokeLinejoin="round" />
        {/* 点 + ホバー */}
        {data.map((d, i) => (
          <g key={d.month}>
            <circle
              cx={x(i)}
              cy={y(d.rate)}
              r={hover === i ? 5.5 : 4}
              fill="#fff"
              stroke={BRAND}
              strokeWidth={2}
            />
            {/* ヒット領域 */}
            <rect
              x={x(i) - innerW / data.length / 2}
              y={PAD.t}
              width={innerW / data.length}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${d.month}: 成約率 ${d.rate}%（${d.contracts}/${d.counseling}件）`}</title>
            </rect>
            <text
              x={x(i)}
              y={H - 8}
              fontSize={10.5}
              fill="#78716c"
              textAnchor="middle"
            >
              {d.month}
            </text>
          </g>
        ))}
        {/* 直近値の直接ラベル */}
        <text
          x={x(data.length - 1)}
          y={y(data[data.length - 1].rate) - 10}
          fontSize={12}
          fontWeight={700}
          fill="#44403c"
          textAnchor="middle"
        >
          {data[data.length - 1].rate}%
        </text>
      </svg>
      {hover !== null ? (
        <p className="mt-1 text-[12px] text-stone-500">
          {data[hover].month}：成約率{" "}
          <span className="font-bold text-stone-900">{data[hover].rate}%</span>
          （カウンセリング {data[hover].counseling} 件中、成約{" "}
          {data[hover].contracts} 件）
        </p>
      ) : (
        <p className="mt-1 text-[11px] text-stone-400">
          ポイントにカーソルを合わせると内訳が見えます
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// スタッフ別 成約率（今月）
// ---------------------------------------------------------------

export function StaffChart() {
  return (
    <div className="space-y-3.5" role="img" aria-label="スタッフ別の今月の成約率">
      {STAFF_CONVERSION.map((s) => {
        const rate = Math.round((s.contracts / s.counseling) * 100);
        return (
          <div key={s.name}>
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold text-stone-700">
                {s.name}
              </p>
              <p className="text-[12px] tabular-nums text-stone-500">
                <span className="font-bold text-stone-900">{rate}%</span>
                <span className="ml-1.5 text-[11px] text-stone-400">
                  （{s.contracts}/{s.counseling} 件）
                </span>
              </p>
            </div>
            <div
              className="mt-1 h-3.5 w-full rounded-[4px] bg-stone-100"
              title={`${s.name}: 成約 ${s.contracts}件 / カウンセリング ${s.counseling}件`}
            >
              <div
                className="h-3.5 rounded-[4px]"
                style={{
                  width: `${rate}%`,
                  background: rate >= 60 ? BRAND : BRAND_SOFT,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-0.5 text-[11px] text-stone-400">
        薄い色 = 60% 未満。数字は責めるためではなく、練習テーマを決めるための材料です。
      </p>
    </div>
  );
}
