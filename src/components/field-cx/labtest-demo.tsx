"use client";

import { useState } from "react";
import Link from "next/link";
import { LabtestGame } from "@/components/field-cx/labtest-game";
import { LabtestRadar } from "@/components/field-cx/labtest-radar";
import {
  LABTEST_DISCLAIMER,
  LAB_JUDGEMENT_META,
  LAB_META,
  LAB_ROWS,
  LAB_VIEW_META,
  RETEST_TALK,
  judgeLab,
  translationsFor,
  type LabView,
} from "@/lib/field-cx/labtest-fixtures";


const VIEWS: LabView[] = ["first", "retest"];

/**
 * 1枚の血液検査が6ヶ月の関係になるまでを、5ステップの実データで見せるデモ。
 *
 * 画面全体が「初回 / 3ヶ月後」のタブで切り替わる。検査値・翻訳・材料ゲージ・
 * バッジ・現在地がまとめて動くので、伴走が一周したことが一目で伝わる。
 */
export function LabtestDemo() {
  const [view, setView] = useState<LabView>("first");
  const vm = LAB_VIEW_META[view];

  return (
    <div className="space-y-12">
      {/* ヒーロー */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          LAB TEST → CONTINUOUS CARE
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
          1枚の検査結果が、
          <br className="sm:hidden" />
          <span className="text-brand-700">6ヶ月の関係</span>になる。
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          検査結果を渡して終わり、にしない。数字を「あなたの体で起きていること」に翻訳して成約を決め、
          来店の間も伴走し、3ヶ月後の再検査で変化を数字で見せる。
          その一周ぶんを、デモデータでそのままお見せします。
        </p>
      </section>

      {/* 画面全体の時点切り替え — ここを押すと下がまるごと変わる */}
      <div className="sticky top-[var(--field-cx-nav-h)] z-10 -mx-5 border-y border-stone-200 bg-white/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div
            className="flex rounded-full border border-stone-200 bg-stone-50 p-0.5"
            role="tablist"
            aria-label="検査の時点"
          >
            {VIEWS.map((v) => {
              const m = LAB_VIEW_META[v];
              const active = view === v;
              return (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setView(v)}
                  className={`min-h-11 rounded-full px-5 text-[13px] font-bold transition ${
                    active
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-stone-500 hover:text-brand-700"
                  }`}
                >
                  {m.label}
                  <span
                    className={`ml-1.5 text-[10.5px] font-semibold ${
                      active ? "text-white/70" : "text-stone-400"
                    }`}
                  >
                    {m.when}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[12.5px] leading-relaxed text-stone-600">
            {vm.caption}
            <span className="ml-1 text-stone-400">
              — 検査値・翻訳・材料ゲージ・バッジが、この時点にそろって切り替わります。
            </span>
          </p>
        </div>
      </div>

      {/* STEP 2 — 翻訳 */}
      <Step
        title="翻訳する"
        lead={
          view === "first"
            ? "まず6つの「力」に翻訳して全体像を1枚にし、選んだ力については「なぜそうなっているのか」を地図でたどります。そのうえで、検査でわかったこと → からだで起きていること → 今日からできること の3列に落とします。AIが下書きし、サロンが確認してから出します。"
            : "再検査も同じ形で翻訳し直します。レーダーは初回の形を破線で残すので、どこがどれだけ伸びたかがそのまま見えます。"
        }
      >
        <LabtestRadar view={view} />

        <details className="group mt-6">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[13px] font-bold text-brand-700">
            1項目ずつの詳しい翻訳を読む
            <span className="ml-1 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {translationsFor(view).map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <div className="space-y-3">
                <Row label="検査でわかったこと" tone="fact" body={t.finding} />
                <Row label="からだで起きていること" tone="mean" body={t.meaning} />
                <Row label="今日からできること" tone="act" body={t.action} />
              </div>
              <p className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-[12px] leading-relaxed text-stone-600">
                背中の肌との関係： {t.skinLink}
              </p>
            </article>
            ))}
          </div>
        </details>
      </Step>

      {/* 根拠 — 結論のあとに置き、既定では畳む */}
      <Step
        collapsed
        openLabel="検査値（10項目）を見る"
        title="この翻訳のもとになった検査値"
        lead="基準範囲だけでなく「適正範囲」を持つのがポイント。基準値内でも、整えたい水準から外れている項目に印がつきます。"
      >
        {/* 取り込みの出所 — どこの・いつの・何項目か */}
        <dl className="mb-2 flex flex-wrap gap-x-6 gap-y-1 rounded-2xl bg-white px-4 py-3 text-[12px]">
          <div>
            <dt className="text-stone-400">採血日</dt>
            <dd className="font-semibold text-stone-700">
              {new Date(LAB_META.collectedOn[view]).toLocaleDateString("ja-JP")}
            </dd>
          </div>
          <div>
            <dt className="text-stone-400">検査</dt>
            <dd className="font-semibold text-stone-700">
              {LAB_META.panel}（{LAB_META.lab}）
            </dd>
          </div>
          <div>
            <dt className="text-stone-400">取り込んだ項目</dt>
            <dd className="font-semibold text-stone-700">
              全 {LAB_META.totalItems} 項目 → 肌に関わる {LAB_ROWS.length} 項目を表示
            </dd>
          </div>
        </dl>

        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-stone-200 text-[11.5px] text-stone-500">
                <th className="px-4 py-2.5 font-semibold">項目</th>
                <th className="px-3 py-2.5 font-semibold">{vm.label}の値</th>
                <th className="px-3 py-2.5 font-semibold">基準範囲</th>
                <th className="px-3 py-2.5 font-semibold">適正範囲</th>
                <th className="px-3 py-2.5 font-semibold">判定</th>
                <th className="px-4 py-2.5 font-semibold">この項目が見ていること</th>
              </tr>
            </thead>
            <tbody>
              {LAB_ROWS.map((r) => {
                const j = judgeLab(r, r[view]);
                const meta = LAB_JUDGEMENT_META[j];
                return (
                  <tr key={r.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-stone-900">{r.name}</p>
                      <p className="text-[11px] text-stone-400">{r.category}</p>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums font-bold text-stone-900">
                      {r[view]}
                      <span className="ml-1 text-[10.5px] font-medium text-stone-400">
                        {r.unit}
                      </span>
                      {view === "retest" ? (
                        <span className="ml-1.5 text-[10.5px] font-medium text-stone-400">
                          （初回 {r.first}）
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-stone-500">
                      {r.refMin}〜{r.refMax}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-stone-500">
                      {r.optMin}〜{r.optMax}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] leading-relaxed text-stone-600">
                      {r.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-stone-500">
          ※ 実際の経過表は {LAB_META.totalItems} 項目。食物IgG抗体パネルも同じ画面に取り込みます。
        </p>
      </Step>

      {/* お客様側 — ゲーミフィケーション */}
      <section>
        <div className="flex items-baseline gap-3">
          <span className="flex h-7 flex-none items-center justify-center rounded-full bg-stone-900 px-2.5 text-[10.5px] font-extrabold text-white">
            お客様側
          </span>
          <h2 className="text-xl font-bold text-stone-900">
            そのまま渡すと、数字は「点数」に見えてしまう
          </h2>
        </div>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-stone-600">
          同じ検査結果を、お客様のスマホでは「肌をつくる材料が、どこまでそろったか」として見せます。
          足りない＝ダメ、ではなく、集めている途中。
          <strong className="text-stone-800">上のタブを切り替える</strong>と、
          続けたぶんだけゲージが伸びるのが見えます。
        </p>
        <details className="group mt-4">
          <summary className="cursor-pointer list-none rounded-2xl border border-stone-200 bg-white p-4 text-[13px] font-bold text-brand-700 transition hover:border-brand-500">
            お客様のスマホ画面を開く（材料あつめ・バッジ・現在地）
            <span className="ml-1 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="mt-4">
            <LabtestGame view={view} />
          </div>
        </details>
      </section>

      {/* 再検査のときだけ出す。初回に見せても意味がない。 */}
      {view === "retest" ? (
      <Step
        title="再検査で見せる"
        lead="3ヶ月後、同じ項目をもう一度。ここで数字が動いていると、継続は「お願い」ではなく「自然な続き」になります。"
      >
        <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
          <h3 className="text-[14px] font-bold text-stone-900">
            🗣 再検査のあと、こう伝える
          </h3>
          <p className="mt-2 text-[14px] font-bold leading-relaxed text-brand-700">
            「{RETEST_TALK.headline}」
          </p>
          <ul className="mt-3 space-y-1.5">
            {RETEST_TALK.points.map((p) => (
              <li key={p} className="text-[12.5px] leading-relaxed text-stone-700">
                ・{p}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-brand-100 pt-2.5 text-[12px] leading-relaxed text-stone-600">
            {RETEST_TALK.note}
          </p>
        </div>
      </Step>
      ) : null}

      {/* フッタ */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-[12px] leading-relaxed text-stone-500">{LABTEST_DISCLAIMER}</p>
        <Link
          href="/field-cx/pricing"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-700 px-5 text-[13px] font-bold text-white hover:bg-brand-500"
        >
          料金を見る →
        </Link>
      </section>
    </div>
  );
}

/**
 * 1ステップ。
 *
 * `collapsed` を付けたステップは畳んだ状態で始まる。
 * 全部を開いて置くと7画面を超え、商談で最後まで到達しない —
 * 深い話は「見たい人が開く」に寄せて、既定の1周を短くする。
 */
function Step({
  title,
  lead,
  collapsed,
  openLabel,
  children,
}: {
  title: string;
  lead: string;
  collapsed?: boolean;
  openLabel?: string;
  children: React.ReactNode;
}) {
  const head = (
    <>
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-stone-600">
        {lead}
      </p>
    </>
  );

  if (!collapsed) {
    return (
      <section>
        {head}
        <div className="mt-4">{children}</div>
      </section>
    );
  }

  return (
    <section>
      <details className="group">
        <summary className="cursor-pointer list-none rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand-500">
          {head}
          <span className="mt-3 inline-flex min-h-11 items-center text-[12.5px] font-bold text-brand-700">
            {openLabel ?? "開いて見る"}
            <span className="ml-1 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </span>
        </summary>
        <div className="mt-4">{children}</div>
      </details>
    </section>
  );
}

const ROW_TONE = {
  fact: { label: "text-stone-500", body: "text-stone-900 font-semibold" },
  mean: { label: "text-sky-700", body: "text-stone-700" },
  act: { label: "text-emerald-700", body: "text-stone-700" },
} as const;

function Row({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: keyof typeof ROW_TONE;
}) {
  const t = ROW_TONE[tone];
  return (
    <div>
      <p className={`text-[11px] font-bold ${t.label}`}>{label}</p>
      <p className={`mt-0.5 text-[13px] leading-relaxed ${t.body}`}>{body}</p>
    </div>
  );
}

