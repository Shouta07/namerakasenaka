"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PLAN_META } from "@/lib/toppings/plans";
import { PLAN_ORDER } from "@/lib/toppings/types";
import {
  ROI_ASSUMPTIONS,
  ROI_CAUTION,
  ROI_DEFAULT,
  simulateRoi,
  type RoiInput,
} from "@/lib/field-cx/roi";

const yen = (n: number) => `¥${Math.round(n).toLocaleString()}`;

/**
 * 回収試算。
 *
 * 「機能が多いか」ではなく「何件の成約で元が取れるか」で買うかが決まる。
 * 前提を隠さず、上乗せを0にすれば差が消えるようにしてある —
 * 盛った数字は、その場では効いても契約後に効かなくなる。
 */
export function RoiSimulator() {
  const [input, setInput] = useState<RoiInput>(ROI_DEFAULT);
  const r = useMemo(() => simulateRoi(input), [input]);
  const set = <K extends keyof RoiInput>(k: K, v: RoiInput[K]) =>
    setInput((cur) => ({ ...cur, [k]: v }));

  const max = Math.max(r.beforeJpy, r.afterJpy) || 1;

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* 入力 */}
        <div>
          <h3 className="text-[15px] font-bold text-stone-900">
            御社の数字を入れてみてください
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-stone-500">
            だいたいで大丈夫です。あとから何度でも変えられます。
          </p>

          <div className="mt-4 space-y-4">
            <Field
              label="月の初回カウンセリング数"
              suffix="件"
              value={input.counselingPerMonth}
              min={1}
              max={80}
              step={1}
              onChange={(v) => set("counselingPerMonth", v)}
            />
            <Field
              label="コース1本の月あたり売上"
              suffix="円"
              value={input.monthlyTicketJpy}
              min={5000}
              max={100000}
              step={1000}
              onChange={(v) => set("monthlyTicketJpy", v)}
              format={(v) => v.toLocaleString()}
            />
            <Field
              label="いまの成約率"
              suffix="%"
              value={input.closeRatePct}
              min={5}
              max={95}
              step={1}
              onChange={(v) => set("closeRatePct", v)}
            />
            <Field
              label="いまの平均継続月数"
              suffix="ヶ月"
              value={input.retentionMonths}
              min={1}
              max={12}
              step={0.5}
              onChange={(v) => set("retentionMonths", v)}
            />

            <div className="rounded-2xl bg-brand-50/60 p-4">
              <p className="text-[11.5px] font-bold text-brand-700">
                Field CX で見込む上乗せ（変えられます）
              </p>
              <div className="mt-3 space-y-3.5">
                <Field
                  label="成約率の上乗せ"
                  suffix="pt"
                  value={input.closeLiftPt}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(v) => set("closeLiftPt", v)}
                />
                <Field
                  label="継続月数の上乗せ"
                  suffix="ヶ月"
                  value={input.retentionLiftMonths}
                  min={0}
                  max={6}
                  step={0.5}
                  onChange={(v) => set("retentionLiftMonths", v)}
                />
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-stone-500">
                0 にすると、いまのままの数字が出ます。差が出るのは、上乗せを見込んだぶんだけです。
              </p>
            </div>

            <div>
              <p className="text-[11.5px] font-bold text-stone-700">プラン</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {PLAN_ORDER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={input.plan === p}
                    onClick={() => set("plan", p)}
                    className={`min-h-11 rounded-full px-4 text-[12.5px] font-bold transition ${
                      input.plan === p
                        ? "bg-brand-700 text-white"
                        : "border border-stone-200 text-stone-600 hover:border-brand-500"
                    }`}
                  >
                    {PLAN_META[p].name}
                    <span className="ml-1.5 text-[10.5px] font-semibold opacity-70">
                      {yen(PLAN_META[p].priceJpy)}/月
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 結果 */}
        <div>
          <div className="rounded-2xl bg-brand-700 p-5 text-white">
            <p className="text-[12px] font-semibold text-white/80">
              月額 {yen(r.planCostJpy)} を回収するのに必要な追加成約
            </p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">
              {r.paybackContracts}
              <span className="ml-1 text-lg font-bold">件</span>
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/85">
              在籍が {Math.ceil(r.paybackContracts)} 名増えれば、その月の費用は戻ります。
              月に {input.counselingPerMonth} 件のカウンセリングのうちの、
              {Math.ceil(r.paybackContracts)} 件です。
            </p>
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-bold text-stone-700">
              その月のカウンセリングが、継続期間を通じて生む売上
            </p>
            <p className="text-[11px] text-stone-500">
              一度に入る金額ではありません。費用と比べるのは、下の「月あたりの増収」です。
            </p>
            <div className="mt-3 space-y-2.5">
              <Bar label="いま" value={r.beforeJpy} max={max} tone="light" />
              <Bar label="Field CX 導入後" value={r.afterJpy} max={max} tone="dark" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="月あたりの増収（ならし）" value={yen(r.monthlyGainJpy)} strong />
            <Stat
              label="費用を引いた残り"
              value={yen(r.netJpy)}
              strong={r.netJpy > 0}
              warn={r.netJpy <= 0}
            />
            <Stat label="費用に対して" value={`${r.roiMultiple} 倍`} />
            <Stat
              label="損益が並ぶ成約率の上乗せ"
              value={`${r.breakEvenLiftPt} pt`}
            />
          </div>

          <details className="mt-4 rounded-2xl bg-stone-50 p-4">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[12px] font-bold text-stone-700">
              この試算の前提を見る ▼
            </summary>
            <ul className="mt-2 space-y-1">
              {ROI_ASSUMPTIONS.map((a) => (
                <li key={a} className="text-[11.5px] leading-relaxed text-stone-600">
                  ・{a}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 border-t border-stone-200 pt-2 text-[11px] leading-relaxed text-stone-500">
              {ROI_CAUTION}
            </p>
          </details>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/field-cx/pricing"
              className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white hover:bg-brand-500"
            >
              プランの中身を見る →
            </Link>
            <Link
              href="/field-cx/labtest"
              className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 text-[13px] font-bold text-stone-700 hover:border-brand-500"
            >
              成約が決まる画面を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  suffix,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-semibold text-stone-700">{label}</span>
        <span className="text-[14px] font-extrabold tabular-nums text-stone-900">
          {format ? format(value) : value}
          <span className="ml-0.5 text-[11px] font-bold text-stone-400">
            {suffix}
          </span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-11 w-full cursor-pointer accent-brand-700"
      />
    </label>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "light" | "dark";
}) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-stone-600">{label}</span>
        <span className="text-[13px] font-extrabold tabular-nums text-stone-900">
          {yen(value)}
        </span>
      </div>
      <div className="mt-1 h-3 w-full rounded-r-md bg-stone-100">
        <div
          className={`h-3 rounded-r-md ${
            tone === "dark" ? "bg-brand-700" : "bg-brand-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  strong,
  warn,
}: {
  label: string;
  value: string;
  strong?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 p-3">
      <p className="text-[10.5px] font-semibold text-stone-500">{label}</p>
      <p
        className={`mt-0.5 text-[15px] font-extrabold tabular-nums ${
          warn ? "text-amber-700" : strong ? "text-brand-700" : "text-stone-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
