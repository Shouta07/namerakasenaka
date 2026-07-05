import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Hub ｜ すべての画面・資料の引き出し",
  description:
    "なめらかせなか × Accord — 提案資料・実機デモ・顧客向けページ、すべてへの入り口。",
};

type HubLink = {
  href: string;
  title: string;
  body: string;
  emoji: string;
  tag?: string;
};

type HubGroup = {
  key: string;
  eyebrow: string;
  title: string;
  note?: string;
  links: HubLink[];
};

const GROUPS: HubGroup[] = [
  {
    key: "proposal",
    eyebrow: "PROPOSAL — 提案・商談で使う",
    title: "田村さんに見せるページ",
    links: [
      {
        href: "/plans",
        title: "2つの関わり方",
        body: "プランA（翻訳・納品）/ B（伴走・体験設計）。氷山・4テーマパーツ・A→B成長。",
        emoji: "🤝",
        tag: "商談の主役",
      },
      {
        href: "/story",
        title: "使いみち絵巻",
        body: "サロンの一日にアプリがどう入るか。6場面の物語（プランBの世界）。",
        emoji: "📜",
      },
      {
        href: "/lessons-preview",
        title: "レッスン7章の図解",
        body: "真弓先生監修の学習コンテンツ。納品物の実物として見せる。",
        emoji: "📘",
      },
    ],
  },
  {
    key: "crm",
    eyebrow: "SENACARE — なめらかせなか CRM（実機デモ）",
    title: "1社目ケースの、動くプロダクト",
    note: "デモモードのため全画面そのまま閲覧できます。操作はブラウザにのみ保存されます。",
    links: [
      {
        href: "/",
        title: "サロン管理ダッシュボード",
        body: "オーナー視点のトップ。KPI・本日の予約・リスク顧客・売上。",
        emoji: "🤍",
        tag: "入口",
      },
      {
        href: "/t/today",
        title: "施術者の「今日」",
        body: "現場スタッフが開く画面。今日の顧客と施術記録。",
        emoji: "✋",
      },
      {
        href: "/c/guide",
        title: "顧客アプリ（回復ガイド）",
        body: "お客様のスマホに届く体験。今日のひとつ・レッスン・経過。",
        emoji: "🌱",
      },
      {
        href: "/share/tamura-demo-2026",
        title: "LINE共有ページ（実URL）",
        body: "お客様がLINEから開く限定公開ページ。田村様デモデータ。",
        emoji: "💬",
      },
      {
        href: "/counseling/case-0001",
        title: "カウンセリング共有ビュー",
        body: "iPadでお客様と一緒に見る症例・説明画面。",
        emoji: "📋",
      },
      {
        href: "/admin/cases",
        title: "症例ライブラリ",
        body: "タグ・年代で検索できる自社症例データベース。",
        emoji: "🗂",
      },
      {
        href: "/n/queue",
        title: "栄養士レビュー",
        body: "AI下書き→専門家承認のワークフロー。",
        emoji: "🥗",
      },
      {
        href: "/admin/evidence",
        title: "エビデンスエンジン",
        body: "効果の見える化。継続率・変化の根拠データ。",
        emoji: "📈",
      },
    ],
  },
  {
    key: "accord",
    eyebrow: "ACCORD — 汎用サービス（横展開の看板）",
    title: "初回カウンセリング支援 Accord",
    note: "なめらかせなかの設計思想から抽出した、機能を増減できるモジュール式サービス。",
    links: [
      {
        href: "/accord",
        title: "Accord 概要",
        body: "3本柱と機能モジュールの増減パネル。",
        emoji: "🎛",
        tag: "入口",
      },
      {
        href: "/accord/roleplay",
        title: "AI相手の接客練習",
        body: "不安型・比較検討型・不信型。採点フィードバック付き。",
        emoji: "🎭",
      },
      {
        href: "/accord/dashboard",
        title: "成約の見える化",
        body: "ファネル・成約率トレンド・スタッフ別・月1伴走レポート。",
        emoji: "📊",
      },
      {
        href: "/accord/customers",
        title: "顧客別の継続フォロー",
        body: "タイムライン・LINE経過共有（同意ファースト）・メモ。",
        emoji: "🌱",
      },
    ],
  },
];

const OFFLINE_DOCS = [
  "お見積り資料（なめらかせなか_2プラン提案_2026.pptx）— 金額・費用ロジック・体制・スケジュール",
  "営業プレイブック（make_playbook 10枚）— 商談の進め方（自分用）",
  "業務委託 基本契約書 v2 / 個別契約書 SOW v2（Word）— デザイナー発注用",
  "デザイン業務委託契約 汎用ひな形（Word）— 甲=バイタリティデザイン固定",
];

export default function HubPage() {
  return (
    <main className="min-h-[100dvh] bg-[#faf8f4]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            HUB — すべての画面・資料の引き出し
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
            作ってきたもの、ぜんぶここから。
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">
            提案資料・実機デモ・顧客向けページ・Accord。
            商談前にこのページを開けば、どの画面にも2クリックで届きます。
            このURLをブックマークしておいてください。
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-10 sm:px-8">
        {GROUPS.map((g) => (
          <section key={g.key}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
              {g.eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-bold text-stone-900">{g.title}</h2>
            {g.note ? (
              <p className="mt-1 text-[12.5px] text-stone-500">{g.note}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-[#8c5a3c] hover:shadow-sm"
                >
                  {l.tag ? (
                    <span className="absolute right-3 top-3 rounded-full bg-[#8c5a3c] px-2 py-0.5 text-[9.5px] font-bold text-white">
                      {l.tag}
                    </span>
                  ) : null}
                  <p className="text-xl" aria-hidden>
                    {l.emoji}
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-bold text-stone-900 group-hover:text-[#8c5a3c]">
                    {l.title} →
                  </p>
                  <p className="mt-1 flex-1 text-[12px] leading-relaxed text-stone-600">
                    {l.body}
                  </p>
                  <p className="mt-2 truncate text-[10.5px] tabular-nums text-stone-400">
                    {l.href}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* 手元資料（web外） */}
        <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            OFFLINE — 手元の資料（webには置いていません）
          </p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">
            PowerPoint / Word で納品済みのもの
          </h2>
          <ul className="mt-3 space-y-1.5">
            {OFFLINE_DOCS.map((d) => (
              <li key={d} className="flex gap-2 text-[13px] leading-relaxed text-stone-600">
                <span className="text-[#8c5a3c]">・</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] text-stone-400">
            ※ 金額・契約を含むため web には公開せず、ファイルでのみ管理しています。
          </p>
        </section>
      </div>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6 text-[11px] text-stone-400 sm:px-8">
          © バイタリティデザイン合同会社 — なめらかせなか × Accord Hub
        </div>
      </footer>
    </main>
  );
}
