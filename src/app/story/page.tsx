import Link from "next/link";
import {
  SceneCounseling,
  SceneTranslate,
  SceneShare,
  SceneDoOne,
  SceneLesson,
  SceneRevisit,
} from "@/components/story/scene-illustrations";

export const dynamic = "force-static";

export const metadata = {
  title: "使いみち絵巻 ｜ なめらかせなか × 体のほんとうの話",
  description:
    "サロンの一日に、このアプリがどう入っていくか。6つの場面で、なめらかせなかの新しい体験を絵巻にしました。",
};

type Phase = "P0" | "POC" | "FULL";

const PHASE_META: Record<
  Phase,
  { label: string; sub: string; bg: string; fg: string; ring: string }
> = {
  P0: {
    label: "Phase 0",
    sub: "ヒアリング + 動く画面モック",
    bg: "bg-amber-50",
    fg: "text-amber-900",
    ring: "ring-amber-200",
  },
  POC: {
    label: "Phase 0 + PoC",
    sub: "1コースが本実装",
    bg: "bg-[#8c5a3c]",
    fg: "text-white",
    ring: "ring-[#8c5a3c]",
  },
  FULL: {
    label: "本格展開（参考）",
    sub: "Phase 0 / PoC のあと",
    bg: "bg-stone-100",
    fg: "text-stone-600",
    ring: "ring-stone-200",
  },
};

function PhaseChip({ phase, size = "md" }: { phase: Phase; size?: "sm" | "md" }) {
  const m = PHASE_META[phase];
  const cls =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] rounded-full"
      : "px-2.5 py-1 text-[11px] rounded-full";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ring-1 ${cls} ${m.bg} ${m.fg} ${m.ring}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  );
}

type Scene = {
  n: string;
  title: string;
  pull: string;
  illustration: React.ReactNode;
  whatHappens: string;
  tamuraDoes: string;
  customerKeeps: string;
  builtIn: Phase[];
  detail: { heading: string; body: string }[];
};

const SCENES: Scene[] = [
  {
    n: "01",
    title: "悩みを、ただ聴く",
    pull: "施術前のカウンセリング。検査値も食生活も、まずはお客様の言葉で。",
    illustration: <SceneCounseling />,
    whatHappens:
      "iPad のカウンセリングシートを一緒に見ながら、お客様の悩みと体の情報を集めます。",
    tamuraDoes: "話を聴く。チェック項目を一緒に埋める。録音は任意。",
    customerKeeps: "「ちゃんと聴いてもらえた」という記憶と、自分用のシート。",
    builtIn: ["P0", "POC"],
    detail: [
      {
        heading: "アプリで何が変わるか",
        body: "紙の問診票が iPad のフォームに。後で AI が要約・翻訳しやすい形で残ります。",
      },
      {
        heading: "ここで作るもの",
        body: "カウンセリング画面の動くモック（Phase 0）／実際に保存・閲覧できる画面（PoC）。",
      },
    ],
  },
  {
    n: "02",
    title: "その場で『翻訳』して見せる",
    pull: "「DAO 活性が低い」が、「ヒスタミンが残りやすい体」になる。",
    illustration: <SceneTranslate />,
    whatHappens:
      "検査結果のページを開くと、医療の言葉が「あなたの体ではこれが起きやすい」という言葉に変換され、図解と「今日のひとつ」がセットで表示されます。",
    tamuraDoes:
      "iPad を一緒に覗き込んで、図解を指差しながら3分で説明する。",
    customerKeeps:
      "「自分の体が初めて理解できた」という納得感。退店時のページ URL。",
    builtIn: ["P0", "POC"],
    detail: [
      {
        heading: "翻訳辞書（v0.1）",
        body: "監修クリニックの先生に「医療の言葉 → お客様にわかる言葉」の対応表をヒアリングで作ります。Phase 0 で 7 概念ぶん。",
      },
      {
        heading: "図解",
        body: "1 場面につき 1 図。文章ではなく、絵で『あなたの体の中で何が起きているか』を伝えます。",
      },
    ],
  },
  {
    n: "03",
    title: "帰り道、お客様の手元へ",
    pull: "送信ボタンひとつで、LINE に『あなたのページ』が届く。",
    illustration: <SceneShare />,
    whatHappens:
      "退店時、田村さんが「送信」を押すと、お客様の LINE に『今日のあなたのページ』のリンクが届きます。タップで限定公開の専用ページへ。",
    tamuraDoes: "送信ボタンを押す。それだけ。",
    customerKeeps:
      "自分専用の URL（限定公開）。今日の話 / 今日のひとつ / 読み物 / 次回予約。",
    builtIn: ["POC"],
    detail: [
      {
        heading: "なぜ LINE か",
        body: "ほぼ全員が毎日見ている場所だから。アプリのインストール不要、忘れられない、開く回数が桁違い。",
      },
      {
        heading: "ここで作るもの",
        body: "/share/[トークン] という限定公開ページ。お客様にはトークン付き URL でしか開けない。PoC で本番稼働まで。",
      },
    ],
  },
  {
    n: "04",
    title: "翌朝、『今日のひとつ』だけ",
    pull: "難しいプランは続かない。だから、一つだけ。",
    illustration: <SceneDoOne />,
    whatHappens:
      "翌朝、お客様がスマホで自分のページを開くと、『今日のひとつ』が大きく表示されています。実行して「できた！」をタップすると、小さな種が育ちます。",
    tamuraDoes: "何もしない。仕組みが勝手に伴走する。",
    customerKeeps: "達成の記録。続ければ続けるほど、種が増えていく実感。",
    builtIn: ["POC"],
    detail: [
      {
        heading: "なぜ『ひとつ』か",
        body: "5 個出すと選べなくて結局やらない。1 個だけだから「とりあえずやってみるか」になる。続く秘訣。",
      },
      {
        heading: "ここで作るもの",
        body: "今日のひとつ表示・完了タップ・種の獲得演出。サロン側にも実行ログが届きます（PoC）。",
      },
    ],
  },
  {
    n: "05",
    title: "1週間後、すこしずつ詳しくなる",
    pull: "全 7 章のレッスンを、自分のペースで一章ずつ。",
    illustration: <SceneLesson />,
    whatHappens:
      "週末や夜、お客様が時間のあるときに、レッスンを 1 章ずつ読み進めます。最後にひとくちクイズ。当たっても外れても、種は受け取れます。",
    tamuraDoes: "進捗を見るだけ。声かけは管理画面が候補を出してくれる。",
    customerKeeps:
      "「自分は今、体のことが分かりかけている」という静かな自信。バッジ。",
    builtIn: ["POC", "FULL"],
    detail: [
      {
        heading: "1 章 = 5 分",
        body: "通勤・就寝前に読み切れる長さ。図解 → 物語 → ひとくちクイズ。責めない、急かさない。",
      },
      {
        heading: "PoC で作るもの",
        body: "リーキーガット 1 コース ぶんを実装（Phase 0+PoC）。残り 6 コースは本格展開フェーズで順次。",
      },
    ],
  },
  {
    n: "06",
    title: "次回来店、変化を持って戻る",
    pull: "施術中に話す材料が、もう積み上がっている。",
    illustration: <SceneRevisit />,
    whatHappens:
      "次回来店時、田村さんの iPad には、そのお客様のこの 2 週間が一目で見える経過サマリが出ます。種の数、レッスン進捗、実行ログ、変化のメモ。",
    tamuraDoes:
      "サマリを見ながら 30 秒で「前回からの変化」を確認、施術と次のテーマを決める。",
    customerKeeps:
      "「変わってきている」という感覚。次回もまた来たい理由。",
    builtIn: ["POC", "FULL"],
    detail: [
      {
        heading: "PoC で作るもの",
        body: "1 人ぶんの経過サマリ画面。サンプル顧客 1 名で実データを通して動かします。",
      },
      {
        heading: "本格展開で広がるもの",
        body: "複数顧客の一覧 / アラート（離脱しそう）/ 月次レポート など、サロン経営に効く広がりへ。",
      },
    ],
  },
];

function PhaseLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <span className="text-stone-500">凡例:</span>
      <PhaseChip phase="P0" />
      <PhaseChip phase="POC" />
      <PhaseChip phase="FULL" />
    </div>
  );
}

function SceneCard({ s, idx }: { s: Scene; idx: number }) {
  const reverse = idx % 2 === 1;
  return (
    <section
      id={`scene-${s.n}`}
      className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden"
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${reverse ? "lg:[direction:rtl]" : ""}`}
      >
        {/* イラスト面 */}
        <div className="lg:col-span-7 bg-[#fdf7f3] flex items-center justify-center p-4 sm:p-6 lg:[direction:ltr]">
          <div className="w-full max-w-[640px]">{s.illustration}</div>
        </div>

        {/* ナラティブ面 */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:[direction:ltr] flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              SCENE
            </span>
            <span className="text-2xl font-extrabold text-[#8c5a3c]">
              {s.n}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold leading-snug text-stone-900">
            {s.title}
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-[#8c5a3c]">
            {s.pull}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                この瞬間に起きること
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-stone-700">
                {s.whatHappens}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-3.5">
                <p className="text-[11px] font-semibold text-stone-500">
                  田村さんがやること
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-800">
                  {s.tamuraDoes}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5">
                <p className="text-[11px] font-semibold text-amber-700">
                  お客様の手元に残るもの
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-800">
                  {s.customerKeeps}
                </p>
              </div>
            </div>

            <details className="rounded-2xl border border-stone-100 bg-white p-3.5 group open:border-stone-200">
              <summary className="cursor-pointer list-none text-[12px] font-semibold text-stone-500 hover:text-stone-700 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-stone-100 text-stone-500 group-open:rotate-45 transition-transform">
                  +
                </span>
                もう少し詳しく
              </summary>
              <div className="mt-3 space-y-3">
                {s.detail.map((d) => (
                  <div key={d.heading}>
                    <p className="text-[12px] font-semibold text-[#8c5a3c]">
                      {d.heading}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-700">
                      {d.body}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="mt-6 flex items-center gap-2 pt-4 border-t border-stone-100">
            <span className="text-[11px] text-stone-500">この場面で作るのは:</span>
            {s.builtIn.map((p) => (
              <PhaseChip key={p} phase={p} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StoryPage() {
  return (
    <main className="min-h-[100dvh] bg-[#faf8f4]">
      {/* ヘッダ */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            USE-CASE STORYBOARD — 使いみち絵巻
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight text-stone-900">
            なめらかせなかの一日に、
            <br className="hidden sm:block" />
            このアプリがどう入っていくか。
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] sm:text-base leading-relaxed text-stone-600">
            お見せしている{" "}
            <Link
              href="/"
              className="text-[#8c5a3c] underline underline-offset-2"
            >
              namerakasenaka.vercel.app
            </Link>{" "}
            は「何ができるか」の倉庫です。
            <br className="hidden sm:block" />
            この絵巻は、それが「どのように使われるか」を
            <strong className="font-bold text-stone-800">
              サロンの一日の物語
            </strong>
            として並べたものです。
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PhaseLegend />
          </div>
        </div>
      </header>

      {/* 登場人物 */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          CAST — 登場人物
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              who: "田村さん",
              role: "なめらかせなか / 施術担当",
              what:
                "iPad と送信ボタンで「内面からの理念」をお客様に届ける。",
              emoji: "🤍",
            },
            {
              who: "鈴木 さやか様（仮）",
              role: "30 代女性 / 背中の悩み歴 5 年",
              what:
                "皮膚科で薬→治る→繰り返す。理由がずっと分からなかった。",
              emoji: "🌸",
            },
            {
              who: "提携クリニック",
              role: "監修ドクター",
              what:
                "話す・承認するだけ。AI と制作が「お客様の言葉」へ翻訳する。",
              emoji: "🩺",
            },
          ].map((c) => (
            <div
              key={c.who}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {c.emoji}
                </span>
                <div>
                  <p className="text-sm font-bold text-stone-900">{c.who}</p>
                  <p className="text-[11px] text-stone-500">{c.role}</p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-stone-700">
                {c.what}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 物語の地図 */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          MAP — 物語の地図
        </p>
        <div className="mt-3 overflow-x-auto">
          <ol className="flex items-stretch gap-2 min-w-[640px]">
            {SCENES.map((s) => (
              <li key={s.n} className="flex-1">
                <a
                  href={`#scene-${s.n}`}
                  className="block h-full rounded-xl border border-stone-200 bg-white px-3 py-3 hover:border-[#8c5a3c] hover:shadow-sm transition"
                >
                  <p className="text-[10px] font-semibold text-stone-400">
                    SCENE {s.n}
                  </p>
                  <p className="mt-0.5 text-[12.5px] font-bold leading-tight text-stone-900">
                    {s.title}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.builtIn.map((p) => (
                      <PhaseChip key={p} phase={p} size="sm" />
                    ))}
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 各シーン */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-6 space-y-6">
        {SCENES.map((s, i) => (
          <SceneCard key={s.n} s={s} idx={i} />
        ))}
      </section>

      {/* まとめ */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            SUMMARY — この絵巻のどこを今ご相談しているか
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-stone-900">
            お見積りの 2 案を、絵巻の上で読み解く
          </h2>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-center gap-2">
                <PhaseChip phase="P0" />
                <span className="text-sm font-bold text-stone-900">
                  ¥250,000
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-stone-700">
                絵巻の{" "}
                <strong className="text-stone-900">場面 1 と場面 2</strong> を、
                Vercel にデプロイされた{" "}
                <strong className="text-stone-900">動く画面モック</strong>{" "}
                として手元に残します。 iPad で実際に触って、田村さんとクリニックで「ここはこう
                でしょ」と決められる状態に。
              </p>
              <ul className="mt-3 text-[12.5px] text-stone-600 list-disc pl-5 space-y-1">
                <li>カウンセリング画面 / 翻訳画面 の動くモック</li>
                <li>要件定義書（A4 5〜10ページ）</li>
                <li>翻訳辞書 v0.1（7 概念）</li>
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-[#8c5a3c] bg-white p-5">
              <div className="flex items-center gap-2">
                <PhaseChip phase="POC" />
                <span className="text-sm font-bold text-stone-900">
                  ¥650,000
                </span>
                <span className="ml-auto text-[10px] font-bold text-[#8c5a3c]">
                  おすすめ
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-stone-700">
                絵巻の{" "}
                <strong className="text-stone-900">場面 1 〜 6 のすべて</strong>{" "}
                を、リーキーガット 1 コースぶんで{" "}
                <strong className="text-stone-900">
                  本当に動くアプリ
                </strong>{" "}
                に。 田村さんのお客様 1 名で、退店 → LINE → 翌日 → 1 週間 → 次回来店 を実機で通せます。
              </p>
              <ul className="mt-3 text-[12.5px] text-stone-600 list-disc pl-5 space-y-1">
                <li>/share 本番 URL が稼働（LINE で配布できる）</li>
                <li>「今日のひとつ」「種」「クイズ」の実装版</li>
                <li>サロン側の経過サマリ画面（1 名ぶん）</li>
                <li>iPad 配布 / PWA 対応</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-[12px] text-stone-500">
            ※ 場面 5 / 6 の「7 コース全部」「複数顧客の一覧」などは、本格展開フェーズで広げていく想定です（{" "}
            <PhaseChip phase="FULL" size="sm" /> ）。
          </p>
        </div>
      </section>

      {/* 関連リンク */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-16">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
          MORE — もっと触ってみる
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/"
            className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-[#8c5a3c] hover:shadow-sm transition"
          >
            <p className="text-sm font-bold text-stone-900">
              トップに戻る →
            </p>
            <p className="mt-1.5 text-[12.5px] text-stone-600">
              「何ができるか」の倉庫を、もう一度見て回る。
            </p>
          </Link>
          <Link
            href="/lessons-preview"
            className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-[#8c5a3c] hover:shadow-sm transition"
          >
            <p className="text-sm font-bold text-stone-900">
              レッスン 7 章をすべて見る →
            </p>
            <p className="mt-1.5 text-[12.5px] text-stone-600">
              場面 5 で読んでいる「あれ」を、すべての章で。
            </p>
          </Link>
          <Link
            href="/proposal"
            className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-[#8c5a3c] hover:shadow-sm transition"
          >
            <p className="text-sm font-bold text-stone-900">
              ご提案ページ →
            </p>
            <p className="mt-1.5 text-[12.5px] text-stone-600">
              三者の役割と、翻訳パイプラインの考え方。
            </p>
          </Link>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 text-[11px] text-stone-400">
          © なめらかせなか × バイタリティデザイン合同会社 — 使いみち絵巻 v1
        </div>
      </footer>
    </main>
  );
}
