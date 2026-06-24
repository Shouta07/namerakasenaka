import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "ご提案 | なめらかせなか × 体のほんとうの話",
};

/** 共通: セクション枠 */
function Section({
  eyebrow,
  title,
  children,
  tone = "plain",
}: {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  tone?: "plain" | "tint";
}) {
  return (
    <section
      className={
        "rounded-3xl border px-5 py-7 sm:px-8 sm:py-9 " +
        (tone === "tint"
          ? "border-brand-100 bg-brand-50/60"
          : "border-stone-200 bg-white")
      }
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-2 text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
          {title}
        </h2>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const STAKEHOLDERS = [
  {
    who: "顧客（背中で悩む女性）",
    emoji: "🌸",
    problem:
      "皮膚科の薬で一時的に治る → 繰り返す。なぜ自分がなるのか分からない。",
    solve:
      "自分の検査結果から「あなたの原因はこれかも」を、小学6年生でも分かる言葉と比喩で。今日やることはひとつだけ。",
  },
  {
    who: "なめらかせなか",
    emoji: "🤍",
    problem:
      "施術中しか伝えられない。「内面から」の理念が来店の“間”に消える。他サロンと差別化しづらい。",
    solve:
      "来店の“間”に理念が届くアプリと接客台本。「医師監修の根本ケア」という、他が真似できない武器。",
  },
  {
    who: "監修ドクター",
    emoji: "🩺",
    problem:
      "薬機法で発信が難しい。資料づくりが苦手。知見が目の前の患者にしか届かない。",
    solve:
      "先生は話す・承認するだけ。AI と制作が顧客の言葉へ翻訳し、可視化する。",
  },
  {
    who: "制作（バイタリティデザイン）",
    emoji: "🛠",
    problem: "医療とサロンの間にある価値を、形と仕組みにする。",
    solve:
      "「知見 → 商品」へ変える翻訳パイプラインを納品物にする。",
  },
];

const DICTIONARY = [
  {
    term: "リーキーガット",
    plain: "腸が少し漏れて、栄養を吸えていないかも",
    metaphor: "ザルで水をすくっても、こぼれてしまう状態",
  },
  {
    term: "SIBO（菌の渋滞）",
    plain: "小腸で菌が増えすぎて、おなかが張る",
    metaphor: "道路が渋滞して、車が前に進めない",
  },
  {
    term: "ホルモンの材料",
    plain: "コレステロールや栄養が足りないと、整いにくい",
    metaphor: "材料がそろわないと、料理が作れない",
  },
  {
    term: "コルチゾール・スチール",
    plain: "ストレスが続くと、必要な材料が横取りされる",
    metaphor: "火事の消火が最優先で、他に手が回らない",
  },
  {
    term: "ミトコンドリア",
    plain: "体のエネルギー工場。元気と肌の余力のもと",
    metaphor: "スマホのバッテリー。残量が少ないと省エネモードに",
  },
  {
    term: "皮膚は内臓の鏡",
    plain: "背中の状態は、体の中からのサイン",
    metaphor: "鏡をふいても、映っているもの自体は変わらない",
  },
  {
    term: "生物学的年齢",
    plain: "実年齢ではなく、体の本当の年齢を知る",
    metaphor: "走った距離が分かる、体の走行メーター",
  },
];

const PIPELINE = [
  { step: "①", label: "先生が話す", body: "30 分のヒアリング・音声を記録", emoji: "🎙" },
  { step: "②", label: "AI が翻訳", body: "医療語 → 顧客語 + 比喩を複数案で生成", emoji: "🤖" },
  { step: "③", label: "展開", body: "レッスン・接客台本・配布物へ同時展開", emoji: "🧩" },
  { step: "④", label: "先生が承認", body: "禁止語フィルタ通過 → タップで承認（実装済）", emoji: "✅" },
];

const BUILD = [
  {
    title: "翻訳辞書",
    body: "7 概念 × 5 列の A4 1 枚。すべての発信物がここから派生する北極星。",
    href: null,
  },
  {
    title: "回復ガイド（アプリ）",
    body: "顧客が自分の体を理解し、今日やることが分かり、伴走される。",
    href: "/share/tamura-demo-2026?presenter=1",
    linkLabel: "実物を見る →",
  },
  {
    title: "学びのコンテンツ",
    body: "腸・ホルモン・栄養の話を、やさしい図解で。順番に読める。",
    href: "/lessons-preview",
    linkLabel: "図解一覧を見る →",
  },
  {
    title: "サロン運用画面",
    body: "顧客一覧・症例検索・カウンセリング支援・離脱予兆まで一元化。",
    href: "/admin/dashboard",
    linkLabel: "管理画面を見る →",
  },
];

const PHASES = [
  {
    n: "01",
    title: "医療インプット",
    body: "ドクターから学び、自身も検査を受け、当事者として理解する。",
    weeks: "4–6 週",
  },
  {
    n: "02",
    title: "翻訳",
    body: "知見を翻訳辞書に固め、AI 翻訳パイプラインを組む。",
    weeks: "2–4 週",
  },
  {
    n: "03",
    title: "開発・制作",
    body: "アプリへ反映、レッスン本文、図解ディレクション、配布物。",
    weeks: "8–12 週",
  },
  {
    n: "04",
    title: "すり合わせ",
    body: "なめらかせなかと検証し、顧客への提供を整える。",
    weeks: "4–6 週",
  },
];

export default function ProposalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      {/* 0. 表紙 */}
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          ご提案
        </p>
        <h1 className="mt-4 text-[28px] font-bold leading-tight text-stone-900 sm:text-4xl">
          体のほんとうの話を、
          <br />
          背中ケアの体験に。
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
          専門的な医療の知見を、悩んで来てくださった方が「自分ごと」として
          受け取れる言葉へ翻訳し、なめらかせなかの体験に落とし込みます。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-500">
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1">
            プロデュース: なめらかせなか
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1">
            監修: 提携クリニック ドクター
          </span>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1">
            制作: バイタリティデザイン
          </span>
        </div>
      </header>

      <div className="mt-10 space-y-5">
        {/* 1. 北極星 */}
        <Section eyebrow="このプロジェクトの北極星" tone="tint">
          <p className="text-lg font-semibold leading-relaxed text-stone-800 sm:text-xl">
            背中ニキビは、肌だけの問題ではありません。
            <br />
            内臓・栄養・ストレス・遺伝の“総合点”が、
            <br className="hidden sm:block" />
            肌という鏡にあらわれたサインです。
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            なめらかせなかは、その総合点を一緒に上げていく場所。
            このプロジェクトは、その思想を顧客が「腑に落ちる」形にするためのものです。
          </p>
        </Section>

        {/* 2. 誰の何をどう */}
        <Section eyebrow="誰の・何を・どう解決するか" title="4 者それぞれの課題に効く">
          <div className="grid gap-3 sm:grid-cols-2">
            {STAKEHOLDERS.map((s) => (
              <div
                key={s.who}
                className="rounded-2xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.emoji}</span>
                  <p className="text-sm font-semibold text-stone-900">{s.who}</p>
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  課題
                </p>
                <p className="text-xs leading-relaxed text-stone-600">
                  {s.problem}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                  解決
                </p>
                <p className="text-xs leading-relaxed text-stone-700">
                  {s.solve}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. 体験の変化 */}
        <Section eyebrow="体験はこう変わる" title="施術の“あと”が、続く理由になる">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Before
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                施術は気持ちいい。でも家に帰ると「なんで私だけ繰り返すんだろう」が
                解けないまま、いつのまにか足が遠のく。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                After
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                施術後にリンクを受け取る。帰りの電車で開くと「あなたの背中、腸が
                関係しているかも」。今週やることはひとつ。記録すると、サロンから
                やさしい一言。“自分の体が分かってきた”——通い続ける理由ができる。
              </p>
            </div>
          </div>
        </Section>

        {/* 4. 翻訳辞書 */}
        <Section
          eyebrow="すべての中心 — 翻訳辞書"
          title="医療の言葉を、わたしの言葉へ"
        >
          <p className="mb-4 text-sm leading-relaxed text-stone-600">
            ドクターの専門用語を、顧客が腑に落ちる「一言」と「比喩」に変換します。
            アプリ・接客・配布物・SNS——すべての発信がこの 1 枚から生まれます。
          </p>
          <div className="overflow-hidden rounded-2xl border border-stone-200">
            {DICTIONARY.map((d, i) => (
              <div
                key={d.term}
                className={
                  "grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[140px_1fr] sm:gap-3 " +
                  (i % 2 === 0 ? "bg-white" : "bg-stone-50/60")
                }
              >
                <p className="text-sm font-semibold text-brand-700">{d.term}</p>
                <div>
                  <p className="text-sm text-stone-800">{d.plain}</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    たとえば — {d.metaphor}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-stone-400">
            ※ 表現は監修ドクターの確認を経て確定します。「治る」等の断定表現は使いません。
          </p>
        </Section>

        {/* 5. AIパイプライン */}
        <Section
          eyebrow="どうやって量産するか"
          title="知見を、勝手にコンテンツへ変える仕組み"
          tone="tint"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PIPELINE.map((p) => (
              <div
                key={p.step}
                className="flex flex-col items-center rounded-2xl border border-white/70 bg-white px-3 py-4 text-center shadow-sm"
              >
                <span className="text-2xl">{p.emoji}</span>
                <p className="mt-2 text-[11px] font-semibold text-brand-700">
                  {p.step} {p.label}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">
            この「医師が承認するだけ」の仕組みは、
            <span className="font-semibold">すでにアプリに実装済み</span>です。
            AI が下書き、医師が必ず承認、誰がいつ承認したかの記録も残る——
            これが薬機法への配慮と、信頼の根拠になります。
          </p>
        </Section>

        {/* 6. つくるもの */}
        <Section eyebrow="つくるもの" title="この体験を成立させる 4 つ">
          <div className="grid gap-3 sm:grid-cols-2">
            {BUILD.map((b) => (
              <div
                key={b.title}
                className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-stone-900">{b.title}</p>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-stone-600">
                  {b.body}
                </p>
                {b.href ? (
                  <Link
                    href={b.href}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:gap-2"
                  >
                    {b.linkLabel}
                  </Link>
                ) : (
                  <span className="mt-3 text-[11px] text-stone-400">
                    すべての土台
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-500">
            動画コンテンツは今回つくりません。静止画の図解と、読んで届く言葉に集中します。
          </p>
        </Section>

        {/* 7. 進め方 */}
        <Section eyebrow="進め方" title="小さく始め、確かめながら広げる">
          <div className="space-y-2">
            {PHASES.map((p) => (
              <div
                key={p.n}
                className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-bold text-brand-500">{p.n}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {p.title}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-600">
                    {p.body}
                  </p>
                </div>
                <span className="flex-none text-[11px] font-medium text-stone-400">
                  {p.weeks}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
              <p className="text-sm font-semibold text-brand-700">
                まずは — 翻訳基盤づくり
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                翻訳辞書 + 学びの骨格 + AI 翻訳パイプラインの雛形。
                4〜6 週で「すべての土台」が手に入ります。
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-sm font-semibold text-stone-900">
                その先 — 仕組みの納品と運用
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                アプリへの実装、コンテンツ拡張、月次の運用と改善。
                土台の手応えを見てからご判断いただけます。
              </p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-stone-400">
            ※ 具体的な金額・スケジュールは別紙お見積もりにてご提示します。
            IT 導入補助金などの活用も検討可能です。
          </p>
        </Section>
      </div>

      <footer className="mt-10 border-t border-stone-200 pt-8 text-center">
        <p className="text-sm leading-relaxed text-stone-600">
          「自分を大切にすること」を、続けられる体験に。
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/share/tamura-demo-2026?presenter=1"
            className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            顧客の体験を見る
          </Link>
          <Link
            href="/lessons-preview"
            className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            学びの図解を見る
          </Link>
        </div>
        <p className="mt-6 text-[11px] text-stone-400">
          プロデュース: なめらかせなか ／ 監修: 提携クリニック ／ 制作: バイタリティデザイン
        </p>
      </footer>
    </main>
  );
}
