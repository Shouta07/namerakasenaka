import Link from "next/link";
import {
  PillarGut,
  PillarDiet,
  PillarSkincare,
  PillarExercise,
} from "@/components/plans/pillar-illustrations";

export const dynamic = "force-static";

export const metadata = {
  title: "2つの関わり方 ｜ 体のほんとうの話",
  description:
    "つくって渡す（翻訳・納品）か、一緒に走る（伴走・体験設計）か。御社と描く、背中ケアの未来。",
};

const BRAND = "#8c5a3c";

/* ── 小物 ───────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
      {children}
    </p>
  );
}

function PlanBadge({ plan }: { plan: "A" | "B" }) {
  const isA = plan === "A";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        isA
          ? "bg-amber-50 text-amber-900 ring-amber-200"
          : "bg-[#8c5a3c] text-white ring-[#8c5a3c]"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
          isA ? "bg-amber-200 text-amber-900" : "bg-white/20 text-white"
        }`}
      >
        {plan}
      </span>
      {isA ? "翻訳・納品" : "伴走・体験設計"}
    </span>
  );
}

/* ── B の伴走ループ図 ──────────────────────────────────── */

function AccompanyLoop() {
  const nodes = [
    { a: -90, label: "来店前", sub: "そっと思い出す" },
    { a: -18, label: "施術中", sub: "その場で翻訳して見せる" },
    { a: 54, label: "退店後", sub: "手元にページが届く" },
    { a: 126, label: "毎日", sub: "今日のひとつだけ" },
    { a: 198, label: "次回まで", sub: "すこしずつ詳しくなる" },
  ];
  const cx = 180;
  const cy = 170;
  const r = 110;
  const rad = (d: number) => (d * Math.PI) / 180;
  return (
    <svg viewBox="0 0 360 320" className="w-full h-auto" role="img" aria-label="お客様に伴走するループの図">
      <rect x={2} y={2} width={356} height={316} rx={22} fill="#fdf7f3" stroke="#efe2d6" strokeWidth={1.5} />
      <text x={180} y={32} fontSize={13} fontWeight={800} fill="#5b4636" textAnchor="middle">
        御社の「伴走ループ」
      </text>
      {/* リング */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e3cdb6" strokeWidth={2} strokeDasharray="3 5" />
      {/* 中心 */}
      <circle cx={cx} cy={cy} r={42} fill="#fff" stroke="#e7d3bd" strokeWidth={1.4} />
      <text x={cx} y={cy - 6} fontSize={11} fontWeight={800} fill={BRAND} textAnchor="middle">
        繰り返さない
      </text>
      <text x={cx} y={cy + 10} fontSize={11} fontWeight={800} fill={BRAND} textAnchor="middle">
        体験
      </text>
      <text x={cx} y={cy + 26} fontSize={7.5} fill="#9a8c7d" textAnchor="middle">
        ＝ 再来店の理由
      </text>
      {nodes.map((n, i) => {
        const x = cx + Math.cos(rad(n.a)) * r;
        const y = cy + Math.sin(rad(n.a)) * r;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={6} fill={BRAND} />
            <text x={x} y={y - 14} fontSize={10} fontWeight={800} fill="#5b4636" textAnchor="middle">
              {n.label}
            </text>
            <text x={x} y={y + 22} fontSize={7.5} fill="#7a6657" textAnchor="middle">
              {n.sub}
            </text>
          </g>
        );
      })}
      <text x={180} y={306} fontSize={8} fill="#9a8c7d" textAnchor="middle">
        この輪が回り続ける状態を、運用ごと設計するのが プランB です。
      </text>
    </svg>
  );
}

/* ── 氷山図（デモ ≠ 完成品） ──────────────────────────── */

function Iceberg() {
  return (
    <svg viewBox="0 0 360 320" className="w-full h-auto" role="img" aria-label="氷山の図。水面上の小さなデモと、水面下の大きな本質的作業">
      {/* 空 */}
      <rect x={0} y={0} width={360} height={150} rx={0} fill="#eaf1f6" />
      {/* 海 */}
      <rect x={0} y={150} width={360} height={170} fill="#cfe0ec" />
      <rect x={0} y={150} width={360} height={170} fill="#bcd3e3" opacity={0.5} />
      {/* 水面ライン */}
      <line x1={0} y1={150} x2={360} y2={150} stroke="#8fb4cf" strokeWidth={2} />
      <text x={344} y={144} fontSize={9} fill="#5b7e96" textAnchor="end">水面</text>

      {/* 氷山 上（小さい） */}
      <path d="M 150 150 L 178 96 L 200 150 Z" fill="#ffffff" stroke="#d4e2ec" strokeWidth={1.4} />
      <path d="M 178 96 L 200 150 L 186 150 Z" fill="#eef5fa" />

      {/* 氷山 下（大きい） */}
      <path
        d="M 150 150 L 200 150 L 232 196 L 250 250 L 214 300 L 150 312 L 96 286 L 86 226 L 116 178 Z"
        fill="#dceaf3"
        stroke="#b7cfe0"
        strokeWidth={1.4}
        opacity={0.95}
      />
      <path d="M 150 150 L 200 150 L 214 178 L 150 188 L 120 170 Z" fill="#eef5fa" opacity={0.8} />

      {/* ラベル 上 */}
      <text x={262} y={104} fontSize={11} fontWeight={800} fill="#3f6c8a" textAnchor="start">
        動くデモ
      </text>
      <text x={262} y={120} fontSize={9} fill="#5b7e96" textAnchor="start">
        ＝ 見えている 約10%
      </text>
      <line x1={205} y1={112} x2={258} y2={108} stroke="#8fb4cf" strokeWidth={1} />

      {/* ラベル 下 */}
      <text x={178} y={228} fontSize={11} fontWeight={800} fill="#2f5673" textAnchor="middle">
        本質的な作業
      </text>
      <text x={178} y={246} fontSize={9} fill="#3f6c8a" textAnchor="middle">
        監修・すり合わせ・体験設計・運用
      </text>
      <text x={178} y={262} fontSize={9} fontWeight={700} fill="#2f5673" textAnchor="middle">
        ＝ ここに価値と費用
      </text>
    </svg>
  );
}

/* ── 本体 ───────────────────────────────────────────── */

const PLAN_A_STEPS = [
  {
    n: "01",
    title: "訪問して、想いを傾聴する",
    body: "ご担当者と監修医のもとへ伺い、「本当は何を届けたいのか」をそのまま聴きます。表面の要望ではなく、奥にある想いから。",
  },
  {
    n: "02",
    title: "要求を、定義する",
    body: "「やりたいこと」を、つくれる形へ翻訳します。曖昧な願いを、誰が見ても同じ絵になる『要求定義』に落とします。",
  },
  {
    n: "03",
    title: "要件に落とし、両社ですり合わせる",
    body: "現場の実感と、監修医の医学的な正しさ。ふたつの目線を要件書の上で突き合わせ、ズレを残さず合意します。",
  },
  {
    n: "04",
    title: "メカニズムを、わかりやすく納品する",
    body: "「なぜ背中にニキビができるのか」を、お客様の言葉と図解で解き明かす仕組みとして納品。手元に残る、御社だけの解説資産に。",
  },
];

const PLAN_B_LAYERS = [
  {
    title: "顧客ジャーニーを設計する",
    body: "来店前・施術中・退店後・次回まで。お客様が背中の悩みから抜け出すまでの道筋を、ひとつながりの体験としてデザインします。",
  },
  {
    title: "続けられる仕掛けを組み込む",
    body: "「今日のひとつ」だけ、責めないクイズ、そっと届くリマインド。意志に頼らず、自然と続いてしまう仕組みを運用ルールごと設計。",
  },
  {
    title: "新しい接客の型をつくる",
    body: "iPad と送信ボタンを、スタッフの一日の動線に溶け込ませる台本。誰がやっても『御社らしい』接客になる再現性を。",
  },
  {
    title: "知見とデータで、磨き続ける",
    body: "監修医の新しい学びを翻訳に反映し、お客様の反応を見てチューニングできる仕組みに。時間とともに賢くなっていく土台をつくります。",
  },
];

const PILLARS = [
  {
    key: "gut",
    no: "1",
    title: "医療連携（腸）",
    body: "背中ニキビの根っこにある「腸」を、医師監修でわかりやすく。すべてのテーマの土台になります。",
    tag: "軸 — まずはここから",
    axis: true,
    illustration: <PillarGut />,
  },
  {
    key: "diet",
    no: "2",
    title: "食事",
    body: "腸を整える食べ方を、毎日の「今日のひとつ」に。発酵・食物繊維など、無理なく続く一歩に翻訳します。",
    tag: "腸の次に効きやすい",
    axis: false,
    illustration: <PillarDiet />,
  },
  {
    key: "skincare",
    no: "3",
    title: "スキンケア",
    body: "背中の肌を、刺激せずいたわる手順へ。内側（腸・食事）と外側のケアを、ちぐはぐにしない設計に。",
    tag: "外側からのケア",
    axis: false,
    illustration: <PillarSkincare />,
  },
  {
    key: "exercise",
    no: "4",
    title: "運動",
    body: "血流・めぐりを促す、軽い運動の習慣。背中の環境を整える“もう一押し”として加えられます。",
    tag: "めぐりを後押し",
    axis: false,
    illustration: <PillarExercise />,
  },
];

export default function PlansPage() {
  return (
    <main className="min-h-[100dvh] bg-[#faf8f4]">
      {/* Hero — 夢から始める */}
      <header className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-[#fdf7f3] to-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24">
          <Eyebrow>VISION — 私たちが一緒に描く未来</Eyebrow>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-[1.15] text-stone-900">
            背中の悩みを、
            <br />
            <span className="text-[#8c5a3c]">「繰り返す」</span>から
            <span className="text-[#8c5a3c]">「抜け出せる」</span>へ。
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-stone-600">
            皮膚科の薬で治して、また繰り返す。その無限ループを、
            <strong className="font-bold text-stone-800">
              「自分の体がわかった」という納得
            </strong>
            で断ち切る。
            <br className="hidden sm:block" />
            御社が、医療の知恵を
            <strong className="font-bold text-stone-800">
              『あなたの体の物語』
            </strong>
            に変えて手渡すサロンになる——
            <br className="hidden sm:block" />
            その未来へ、私たちは2つの関わり方でご一緒します。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#plan-a"
              className="rounded-full bg-[#8c5a3c] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#754827]"
            >
              2つの関わり方を見る ↓
            </a>
            <Link
              href="/story"
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-[#8c5a3c]"
            >
              先に「使われ方」を見る →
            </Link>
          </div>
        </div>
      </header>

      {/* 2つの関わり方 — 概観 */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
        <Eyebrow>TWO WAYS — 2つの関わり方</Eyebrow>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
          つくって渡すか、一緒に走るか。
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">
          どちらも出発点は同じ「わかりやすい仕組み」。
          違うのは、それを<strong className="text-stone-800">渡して終わりにするか</strong>、
          <strong className="text-stone-800">回り続けるところまで一緒に育てるか</strong>です。
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* A card */}
          <a
            href="#plan-a"
            className="group rounded-3xl border border-amber-200 bg-amber-50/40 p-7 transition hover:shadow-md"
          >
            <PlanBadge plan="A" />
            <h3 className="mt-4 text-xl font-bold text-stone-900">
              つくって、渡す
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-stone-700">
              監修医と現場の間に立ち、想いを傾聴し、要件に落とし、
              <strong className="text-stone-900">
                「背中ニキビのメカニズムをわかりやすく解説する仕組み」
              </strong>
              を成果物として納品します。
            </p>
            <p className="mt-4 text-sm font-semibold text-amber-800 group-hover:underline">
              プランAを詳しく →
            </p>
          </a>

          {/* B card */}
          <a
            href="#plan-b"
            className="group rounded-3xl border-2 border-[#8c5a3c] bg-white p-7 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <PlanBadge plan="B" />
              <span className="text-[11px] font-bold text-[#8c5a3c]">本命</span>
            </div>
            <h3 className="mt-4 text-xl font-bold text-stone-900">
              一緒に、走る
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-stone-700">
              納品した仕組みを、
              <strong className="text-stone-900">
                御社としてどうお客様に伴走していくか
              </strong>
              ——その<strong className="text-stone-900">体験設計</strong>まで行い、
              回り続ける状態を一緒に育てます。
            </p>
            <p className="mt-4 text-sm font-semibold text-[#8c5a3c] group-hover:underline">
              プランBを詳しく →
            </p>
          </a>
        </div>
      </section>

      {/* プランA 詳細 */}
      <section
        id="plan-a"
        className="scroll-mt-6 border-y border-amber-100 bg-amber-50/30"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
          <PlanBadge plan="A" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-stone-900">
            想いを、仕組みに翻訳する。
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">
            私たちは黒子です。監修医と現場の間に立ち、
            お二人の想いを聴き、医学を現場の言葉に翻訳し、
            <strong className="text-stone-800">手に取れる成果物</strong>として置いていきます。
          </p>

          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAN_A_STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-amber-200 bg-white p-6"
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-[#8c5a3c]">
                    {s.n}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900">{s.title}</h3>
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-stone-700">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* 成果物 */}
          <div className="mt-6 rounded-2xl border border-amber-300 bg-white p-6 sm:p-7">
            <Eyebrow>DELIVERABLE — 納品物</Eyebrow>
            <p className="mt-2 text-lg font-bold text-stone-900">
              「なぜ背中にニキビができるのか」を、お客様がわかる言葉と図解で解き明かす仕組み。
            </p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-stone-600">
              実際の図解・画面は{" "}
              <Link href="/lessons-preview" className="text-[#8c5a3c] underline underline-offset-2">
                レッスン7章
              </Link>{" "}
              や{" "}
              <Link href="/story" className="text-[#8c5a3c] underline underline-offset-2">
                使いみち絵巻
              </Link>{" "}
              でご覧いただけます。
            </p>
            <p className="mt-4 text-[13px] text-stone-500">
              ▶ 金額・費用の内訳は、お渡しするお見積り資料（PowerPoint）でご説明します。
            </p>
          </div>
        </div>
      </section>

      {/* プランB 詳細 */}
      <section id="plan-b" className="scroll-mt-6">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
          <PlanBadge plan="B" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-stone-900">
            渡して終わり、にしない。
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">
            どんなに良い仕組みも、使われ続けなければ意味がありません。
            プランBでは、成果物を
            <strong className="text-stone-800">
              御社としてどうお客様に伴走していくか
            </strong>
            ——その体験そのものを設計し、回り続ける状態まで一緒に育てます。
          </p>

          <div className="mt-9 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* 左: 4レイヤー */}
            <div className="space-y-3">
              {PLAN_B_LAYERS.map((l, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#8c5a3c] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="text-[15.5px] font-bold text-stone-900">
                      {l.title}
                    </h3>
                  </div>
                  <p className="mt-2 pl-10 text-[14px] leading-relaxed text-stone-700">
                    {l.body}
                  </p>
                </div>
              ))}
            </div>

            {/* 右: ループ図 */}
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <AccompanyLoop />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-[#8c5a3c] bg-[#fdf7f3] p-6 sm:p-7">
            <Eyebrow>OUTCOME — 生まれるもの</Eyebrow>
            <p className="mt-2 text-lg font-bold text-stone-900">
              「医師監修の根本ケア」を、御社だけが提供できる
              <span className="text-[#8c5a3c]">指名される体験</span>に。
            </p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-stone-600">
              仕組みは競合に真似されても、
              <strong className="text-stone-800">回し方と積み上がった顧客の物語</strong>
              は真似できません。それが、長く効く資産になります。
            </p>
            <p className="mt-4 text-[13px] text-stone-500">
              ▶ システム実装・体験設計費の内訳は、お見積り資料（PowerPoint）でご説明します。
            </p>
            <Link
              href="/vitality-design"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#8c5a3c] px-5 text-sm font-bold text-white transition hover:bg-[#754827]"
            >
              実装イメージを触ってみる — Vitality Design デモ →
            </Link>
          </div>
        </div>
      </section>

      {/* 選べる4テーマ（パーツ） */}
      <section id="pillars" className="scroll-mt-6 border-t border-stone-200 bg-[#fbf8f3]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
          <Eyebrow>MODULES — 選べる4つのテーマ</Eyebrow>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
            どこから始めても、いい。テーマごとに、少しずつ。
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">
            背中ケアは
            <strong className="text-stone-800">「腸（医療連携）」を軸</strong>に、
            <strong className="text-stone-800">食事・スキンケア・運動</strong>へと広がります。
            ぜんぶを一度に作る必要はありません。
            <strong className="text-stone-800">
              御社が「ここから」と決めたテーマを1つずつ
            </strong>
            、効果を確かめながら組み込めます（＝パーツでのご提供）。
          </p>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => (
              <div
                key={p.key}
                className={`rounded-3xl border bg-white p-4 ${
                  p.axis ? "border-2 border-[#8c5a3c]" : "border-stone-200"
                }`}
              >
                <div className="relative">
                  {p.axis ? (
                    <span className="absolute right-1 top-1 z-10 rounded-full bg-[#8c5a3c] px-2.5 py-1 text-[10px] font-bold text-white">
                      軸 / おすすめの起点
                    </span>
                  ) : null}
                  {p.illustration}
                </div>
                <div className="mt-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#8c5a3c] text-[11px] font-bold text-white">
                      {p.no}
                    </span>
                    <h3 className="text-base font-bold text-stone-900">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-stone-700">
                    {p.body}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold text-[#8c5a3c]">
                    {p.tag}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* パーツの買い方 */}
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 sm:p-7">
            <Eyebrow>HOW TO BUY — パーツでの進め方</Eyebrow>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  t: "① 軸から始める",
                  b: "まず「腸（医療連携）」を1テーマ。背中ケアの土台になる、いちばん効くところから。",
                },
                {
                  t: "② 手応えを見て足す",
                  b: "お客様の反応を見ながら、食事・スキンケア・運動を1つずつ追加。",
                },
                {
                  t: "③ 必要なぶんだけ",
                  b: "全部そろえなくてもいい。御社のペースで、テーマを増やせます。",
                },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl bg-[#fbf8f3] p-4">
                  <p className="text-sm font-bold text-stone-900">{s.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">
                    {s.b}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] text-stone-500">
              ▶ プランA は「軸のテーマ」を1つ作る前提。テーマ追加ぶんの費用は、お見積り資料（PowerPoint）でご説明します。
            </p>
          </div>
        </div>
      </section>

      {/* デモ ≠ 完成品（価格の土台を守る） */}
      <section className="border-y border-stone-200 bg-[#f4efe8]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
          <Eyebrow>REALITY — 見えているのは、氷山の一角</Eyebrow>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
            「動くデモ」と「完成品」は、違います。
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">
            すでにご覧いただいている画面は、
            <strong className="text-stone-800">方向性を確かめるためのデモ</strong>です。
            きれいに動いて見える部分は、実は全体のほんの一角。
            <strong className="text-stone-800">本当に価値があり、費用をいただく部分は、水面の下</strong>
            にあります。
          </p>

          <div className="mt-9 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <Iceberg />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-[13px] font-bold text-stone-500">
                  水面の上（見えている・つくりやすい）
                </p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-stone-700">
                  画面が動く・雰囲気が伝わる。ここは
                  <strong className="text-stone-900">最新のAIとプロトタイピング</strong>
                  で素早く形にできます。だから「もうできそう」に見えます。
                </p>
              </div>
              <div className="rounded-2xl border-2 border-[#8c5a3c] bg-[#fdf7f3] p-5">
                <p className="text-[13px] font-bold text-[#8c5a3c]">
                  水面の下（見えない・ここに価値と費用）
                </p>
                <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-stone-800">
                  {[
                    "医学的な正確さの担保（監修医との往復・監修）",
                    "両社の知見のすり合わせと、翻訳の精度",
                    "お客様一人ひとりに合わせた出し分けの設計",
                    "現場の運用に乗せ、続く体験にする設計",
                    "知見の更新を反映し続ける仕組み",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-[#8c5a3c]">▾</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[13.5px] leading-relaxed text-stone-600">
                デモの完成度は、製品の完成度ではありません。
                <strong className="text-stone-800">
                  御社が「これだ」と感じる体験は、これからの作り込みで生まれます。
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* A→B 成長ストーリー */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
          <Eyebrow>GROWTH — 焦らず、育てる</Eyebrow>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
            入口は A。そのまま、B へ。
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">
            いきなり伴走契約を結ぶ必要はありません。
            まず<strong className="text-stone-800">プランAで「動くもの」をつくり</strong>、
            そこで終わらせず
            <strong className="text-stone-800">プランBの伴走設計へ</strong>。
            ひと続きで、御社だけの体験に育てていきます。
          </p>

          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                step: "STEP 1",
                title: "A で、つくる",
                body: "傾聴 → 要件 → メカニズム解説の仕組みを納品。まず確かな土台を形にする。",
                tone: "amber",
              },
              {
                step: "STEP 2",
                title: "B で、走り出す",
                body: "成果物をシステムに実装し、現場で伴走できる形に。回り続ける状態を一緒に育て、指名される体験にする。",
                tone: "brand",
              },
            ].map((s) => (
              <div
                key={s.step}
                className={`rounded-2xl border p-6 ${
                  s.tone === "brand"
                    ? "border-2 border-[#8c5a3c] bg-[#fdf7f3]"
                    : s.tone === "amber"
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-stone-200 bg-white"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  {s.step}
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-stone-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-stone-700">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3年後の夢 */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <Eyebrow>DREAM — 3年後の、ある一日</Eyebrow>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
          この仕組みが、根づいたら。
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              who: "お客様",
              emoji: "🌸",
              quote:
                "「もう背中で悩まなくなった。理由がわかって、自分でケアできるようになったから」",
            },
            {
              who: "御社",
              emoji: "🤍",
              quote:
                "「『医師監修で、根本から』。そう言える唯一のサロンとして、紹介で予約が埋まる」",
            },
            {
              who: "御社のご担当",
              emoji: "✨",
              quote:
                "「施術の手だけじゃなく、想いそのものが仕組みになって、一人ひとりに届いている」",
            },
          ].map((d) => (
            <div
              key={d.who}
              className="rounded-3xl border border-stone-200 bg-white p-7"
            >
              <span className="text-3xl" aria-hidden>
                {d.emoji}
              </span>
              <p className="mt-4 text-[15px] font-medium leading-relaxed text-stone-800">
                {d.quote}
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                — {d.who}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
          <div className="rounded-3xl bg-[#8c5a3c] p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">
              まずは、夢の続きをお話しさせてください。
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/85">
              ここにある体験を、御社の現実にするための
              金額・費用ロジック・進め方は、お渡しするお見積り資料で
              ひとつずつご説明します。
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/story"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#8c5a3c] transition hover:bg-stone-100"
              >
                使いみち絵巻を見る →
              </Link>
              <Link
                href="/lessons-preview"
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                納品物の実物を見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#faf8f4]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 flex flex-wrap items-center gap-x-3 text-[11px] text-stone-400">
          <span>© バイタリティデザイン合同会社 — 2つの関わり方 v1</span>
          <Link
            href="/hub"
            className="inline-flex min-h-11 items-center font-semibold text-[#8c5a3c] hover:underline"
          >
            すべての画面・資料 → /hub
          </Link>
        </div>
      </footer>
    </main>
  );
}
