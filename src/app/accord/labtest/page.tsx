import Link from "next/link";
import { LabtestGame } from "@/components/accord/labtest-game";
import {
  FOOD_CLASS_LABEL,
  FOOD_REACTIONS,
  JOURNEY,
  LABTEST_DISCLAIMER,
  LAB_JUDGEMENT_META,
  LAB_ROWS,
  LAB_TRANSLATIONS,
  RETEST_TALK,
  ROTATION_PLAN,
  WHO_META,
  judgeLab,
  labChange,
  type LabRow,
} from "@/lib/accord/labtest-fixtures";

export const metadata = {
  title: "血液検査の翻訳ガイド — 検査から継続伴走まで",
};

const LOOP = [
  { n: "1", label: "検査を取り込む", emoji: "🩸" },
  { n: "2", label: "翻訳する", emoji: "📖" },
  { n: "3", label: "接客で見せる", emoji: "🤝" },
  { n: "4", label: "伴走する", emoji: "🌱" },
  { n: "5", label: "再検査で見せる", emoji: "🔁" },
];

/**
 * /accord/labtest — 1枚の血液検査が6ヶ月の関係になるまでを、
 * 5ステップの実データで見せるデモ。ヒーロー機能（ai-guide）の実機画面。
 */
export default function AccordLabtestPage() {
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
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {LOOP.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-stone-700">
                <span aria-hidden>{s.emoji}</span>
                {s.label}
              </span>
              {i < LOOP.length - 1 ? (
                <span className="text-stone-300" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* STEP 1 — 取り込み */}
      <Step
        n="1"
        title="検査結果を取り込む"
        lead="基準範囲だけでなく「適正範囲」を持つのがポイント。基準値内でも、整えたい水準から外れている項目に印がつきます。ここが、検査票をそのまま渡すのとの違いです。"
      >
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-stone-200 text-[11.5px] text-stone-500">
                <th className="px-4 py-2.5 font-semibold">項目</th>
                <th className="px-3 py-2.5 font-semibold">初回</th>
                <th className="px-3 py-2.5 font-semibold">基準範囲</th>
                <th className="px-3 py-2.5 font-semibold">適正範囲</th>
                <th className="px-3 py-2.5 font-semibold">判定</th>
                <th className="px-4 py-2.5 font-semibold">この項目が見ていること</th>
              </tr>
            </thead>
            <tbody>
              {LAB_ROWS.map((r) => {
                const j = judgeLab(r, r.first);
                const meta = LAB_JUDGEMENT_META[j];
                return (
                  <tr key={r.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-stone-900">{r.name}</p>
                      <p className="text-[11px] text-stone-400">{r.category}</p>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums font-bold text-stone-900">
                      {r.first}
                      <span className="ml-1 text-[10.5px] font-medium text-stone-400">
                        {r.unit}
                      </span>
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
          ※ 10項目のみ表示（実際の経過表は100項目以上）。食物IgG抗体パネルも同じ画面に取り込みます。
        </p>
      </Step>

      {/* STEP 2 — 翻訳 */}
      <Step
        n="2"
        title="翻訳する"
        lead="検査でわかったこと → からだで起きていること → 今日からできること。この3列に落ちてはじめて、お客様は自分の話として聞けます。AIが下書きし、サロンが確認してから出します。"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {LAB_TRANSLATIONS.map((t) => (
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
          <strong className="text-stone-800">初回 / 3ヶ月後を切り替える</strong>と、
          続けたぶんだけゲージが伸びるのが見えます。
        </p>
        <div className="mt-4">
          <LabtestGame />
        </div>
      </section>

      {/* STEP 3 — 接客 */}
      <Step
        n="3"
        title="接客で見せる"
        lead="紙の検査票を渡す代わりに、翻訳ガイドを一緒に見ながら話す。売り込みではなく、事実の共有が成約を決めます。"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            {
              emoji: "🖥️",
              title: "同じ画面を一緒に見る",
              body: "iPad を横に置いて、数字を指さしながら話す。説明する側とされる側ではなく、同じものを見る関係になります。",
            },
            {
              emoji: "🧩",
              title: "コースの理由が数字で立つ",
              body: "「皮ふが一周入れ替わるまで数ヶ月」「材料がそろうまで3ヶ月」。回数券の根拠を、感覚ではなく検査で説明できます。",
            },
            {
              emoji: "📲",
              title: "帰り道にもう一度読める",
              body: "同意のうえで LINE に翻訳ガイドを送信。ご家族に相談するときも、そのまま見せられます。",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-2xl" aria-hidden>
                {c.emoji}
              </p>
              <h3 className="mt-2 text-[14px] font-bold text-stone-900">{c.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone-600">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </Step>

      {/* STEP 4 — 伴走 */}
      <Step
        n="4"
        title="伴走する"
        lead="検査でわかった「避けたい食品」は、禁止リストではなく献立の組み方に変える。来店の間の12週間を、仕組みで持たせます。"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 食物IgG */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-[14px] font-bold text-stone-900">
              🍽 食物IgG抗体パネル（抜粋）
            </h3>
            <ul className="mt-3 space-y-1.5">
              {FOOD_REACTIONS.map((f) => (
                <li key={f.name} className="flex items-center gap-3">
                  <span className="w-36 flex-none truncate text-[12.5px] text-stone-700">
                    {f.name}
                  </span>
                  <span className="flex flex-none items-center gap-0.5" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-6 rounded-full ${
                          i < f.klass ? "bg-brand-500" : "bg-stone-200"
                        }`}
                      />
                    ))}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500">
                    クラス{f.klass}・{FOOD_CLASS_LABEL[f.klass]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ローテーション */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-[14px] font-bold text-stone-900">
              🔄 4日ローテーションの献立
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-stone-600">
              反応が高かった食品を外し、同じ食品が4日に1日以下になるように組みます。
              「食べてはいけない」ではなく「順番に食べる」に翻訳するのが続けるコツです。
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ROTATION_PLAN.map((d) => (
                <div key={d.day} className="rounded-xl bg-stone-50 p-3">
                  <p className="text-[11px] font-bold text-stone-500">{d.day}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-stone-700">
                    {d.items.join("・")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 12週タイムライン */}
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="text-[14px] font-bold text-stone-900">
            📅 検査から再検査までの12週間
          </h3>
          <ol className="mt-3 space-y-0">
            {JOURNEY.map((s, i) => {
              const who = WHO_META[s.who];
              return (
                <li key={`${s.week}-${s.title}`} className="flex gap-3">
                  <div className="flex flex-none flex-col items-center">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500" />
                    {i < JOURNEY.length - 1 ? (
                      <span className="w-px flex-1 bg-stone-200" />
                    ) : null}
                  </div>
                  <div className="pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold tabular-nums text-stone-400">
                        {s.week}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${who.chip}`}
                      >
                        {who.label}
                      </span>
                      <span className="text-[13px] font-bold text-stone-900">
                        {s.title}
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-stone-600">
                      {s.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Step>

      {/* STEP 5 — 再検査 */}
      <Step
        n="5"
        title="再検査で見せる"
        lead="3ヶ月後、同じ項目をもう一度。ここで数字が動いていると、継続は「お願い」ではなく「自然な続き」になります。"
      >
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-stone-200 text-[11.5px] text-stone-500">
                <th className="px-4 py-2.5 font-semibold">項目</th>
                <th className="px-3 py-2.5 font-semibold">初回</th>
                <th className="px-3 py-2.5 font-semibold">3ヶ月後</th>
                <th className="px-3 py-2.5 font-semibold">変化</th>
                <th className="px-4 py-2.5 font-semibold">適正範囲</th>
              </tr>
            </thead>
            <tbody>
              {LAB_ROWS.map((r) => (
                <RetestRow key={r.id} row={r} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
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

      {/* フッタ */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-[12px] leading-relaxed text-stone-500">{LABTEST_DISCLAIMER}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/accord"
            className="rounded-full border border-stone-300 px-4 py-2 text-[13px] font-bold text-stone-700 hover:border-brand-500"
          >
            ← 概要に戻る
          </Link>
          <Link
            href="/c/progress"
            className="rounded-full border border-stone-300 px-4 py-2 text-[13px] font-bold text-stone-700 hover:border-brand-500"
          >
            お客様側の画面を見る →
          </Link>
          <Link
            href="/accord/pricing"
            className="rounded-full bg-brand-700 px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-500"
          >
            料金を見る →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  lead,
  children,
}: {
  n: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-700 text-[13px] font-extrabold text-white">
          {n}
        </span>
        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      </div>
      <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-stone-600">
        {lead}
      </p>
      <div className="mt-4">{children}</div>
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

function RetestRow({ row }: { row: LabRow }) {
  const before = judgeLab(row, row.first);
  const after = judgeLab(row, row.retest);
  const change = labChange(row);
  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="px-4 py-2.5">
        <p className="font-semibold text-stone-900">{row.name}</p>
      </td>
      <td className="px-3 py-2.5">
        <span className="tabular-nums text-stone-500">{row.first}</span>
        <span
          className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${LAB_JUDGEMENT_META[before].chip}`}
        >
          {LAB_JUDGEMENT_META[before].label}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className="tabular-nums font-bold text-stone-900">{row.retest}</span>
        <span
          className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${LAB_JUDGEMENT_META[after].chip}`}
        >
          {LAB_JUDGEMENT_META[after].label}
        </span>
      </td>
      <td className="px-3 py-2.5 text-[12px]">
        {change.kind === "same" ? (
          <span className="text-stone-400">{change.label}</span>
        ) : (
          <span
            className={
              change.kind === "entered"
                ? "font-bold text-emerald-700"
                : change.kind === "farther"
                  ? "text-amber-700"
                  : "text-stone-600"
            }
          >
            {row.retest > row.first ? "↗" : "↘"} {change.label}
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 tabular-nums text-[12px] text-stone-500">
        {row.optMin}〜{row.optMax} {row.unit}
      </td>
    </tr>
  );
}
