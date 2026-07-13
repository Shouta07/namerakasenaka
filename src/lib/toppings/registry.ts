/**
 * Accord トッピング・レジストリ — 唯一の情報源。
 *
 * docs/accord/topping-architecture.md §2 のカタログをコード化したもの。
 * ナビ・ゲート・料金表・エンタイトルメント写像はすべてここを読む。
 *
 * 【スコープ方針（v2.2 cull）】ローンチは物語を1周させる最小構成に絞る:
 *   院が入れる → 患者に必要なものだけ出る → 反応が戻る → 数字が見える →
 *   練習で上手くなる → コパイロットが次の一手。
 * それ以外は status:"backlog"（ロードマップ保持・料金表から除外）。
 * 単品アドオン価格はローンチでは持たない（3プラン束のみ販売）。
 */

import type { ToppingDef } from "./types";

const INC = { included: true } as const;
const OUT = { included: false } as const;
const inc = (limit: number | "unlimited", note?: string) =>
  ({ included: true as const, limit, note });
/** backlog 共通: どのプランにも含めない（実体が無いものを付与しない）。 */
const NONE = { starter: OUT, standard: OUT, pro: OUT };

export const TOPPINGS = {
  // ── 生地（base・全プラン共通・外せない） ──────────────────
  core: {
    name: "顧客台帳・カウンセリング記録",
    short: "コア",
    description:
      "顧客台帳、初回カウンセリング記録、関わりのタイムライン、メンバー・権限。Accord の生地。",
    emoji: "📋",
    tier: "base",
    dependsOn: [],
    status: "launch",
    nav: { href: "/accord/customers", label: "顧客", order: 10 },
    plans: { starter: INC, standard: INC, pro: INC },
  },

  // ── AI頭脳（接客と継続のコパイロット） ─────────────────
  copilot: {
    name: "接客と継続のコパイロット",
    short: "コパイロット",
    description:
      "成約・継続・練習のデータから「再診率が低下・フォロー対象42名」のような気づきと次の一手を提案し、その場で実行できる。在庫・会計などの経営分析はお使いの業務システムの領域（Accordは上に乗る）。",
    emoji: "🧠",
    tier: "copilot",
    dependsOn: ["core", "dashboard"],
    status: "launch",
    nav: { href: "/accord/copilot", label: "コパイロット", order: 15 },
    plans: {
      starter: OUT,
      standard: inc("unlimited", "週次ブリーフ"),
      pro: inc("unlimited", "日次 + 提案実行"),
    },
  },

  // ── チーズ（標準搭載） ────────────────────────────────
  dashboard: {
    name: "成約ダッシュボード",
    short: "ダッシュボード",
    description:
      "初回予約→成約のファネル、成約率の推移、そしてスタッフ別の成約率・ヒアリング傾向まで。感覚ではなく数字で振り返る（責めるためではなく、練習テーマを決める材料として）。",
    emoji: "📊",
    tier: "cheese",
    dependsOn: ["core"],
    status: "launch",
    nav: { href: "/accord/dashboard", label: "ダッシュボード", order: 30 },
    plans: {
      starter: inc("unlimited", "基本"),
      standard: INC,
      pro: INC,
    },
  },
  "line-share": {
    name: "LINE経過共有",
    short: "LINE共有",
    description:
      "記録・写真の経過を、ご本人の同意のもと LINE でお客様の手元へ。同意管理込み。",
    emoji: "💬",
    tier: "cheese",
    dependsOn: ["core"],
    status: "launch",
    meter: { metric: "messages", unit: "通/月" },
    plans: {
      starter: inc(100),
      standard: inc(1000),
      pro: inc("unlimited"),
    },
  },

  // ── トッピング（ローンチ） ─────────────────────────────
  roleplay: {
    name: "AI接客練習",
    short: "接客練習",
    description:
      "AIがお客様役。不安型・比較検討型・不信型を何度でも練習し、5観点でフィードバック。",
    emoji: "🎭",
    tier: "topping",
    dependsOn: ["core"],
    status: "launch",
    nav: { href: "/accord/roleplay", label: "接客練習", order: 20 },
    meter: { metric: "sessions", unit: "回/月" },
    plans: {
      starter: inc(20),
      standard: inc(100),
      pro: inc(300, "無制限（フェアユース300回）"),
    },
  },
  photos: {
    name: "経過写真",
    short: "経過写真",
    description:
      "before/after の経過を記録・比較。同意管理つきで LINE 共有と連動する。",
    emoji: "📷",
    tier: "topping",
    dependsOn: ["core"],
    status: "launch",
    plans: { starter: INC, standard: INC, pro: INC },
  },
  "follow-loop": {
    name: "継続フォロー",
    short: "継続フォロー",
    description:
      "「今日のひとつ」・自己ログ・リマインドで、成約後もお客様に伴走し続ける仕組み。効果集計と離脱の先回り検知を含む。",
    emoji: "🌱",
    tier: "topping",
    dependsOn: ["core", "line-share"],
    status: "launch",
    plans: { starter: OUT, standard: INC, pro: INC },
  },
  // 継続フォローに内包される部品（単独SKUにはしないが実装済みの資産）。
  evidence: {
    name: "効果の見える化",
    short: "エビデンス",
    description:
      "経過データからトレンドを集計し、印刷できる効果レポートに。因果は断定しない設計。",
    emoji: "📈",
    tier: "topping",
    dependsOn: ["photos"],
    status: "launch",
    plans: { starter: OUT, standard: INC, pro: INC },
  },
  "at-risk": {
    name: "離脱アラート",
    short: "離脱アラート",
    description:
      "来店間隔・自己ログの途絶・未回答から、離れそうな顧客を先回りで検知する。",
    emoji: "⚠️",
    tier: "topping",
    dependsOn: ["core", "follow-loop"],
    status: "launch",
    plans: { starter: OUT, standard: INC, pro: INC },
  },

  // ── サービストッピング（人が乗る） ────────────────────
  mentoring: {
    name: "月1回の伴走",
    short: "月1伴走",
    description:
      "月に一度、数字と練習ログを一緒に振り返り、翌月の接客テーマを決める。",
    emoji: "🤝",
    tier: "service",
    dependsOn: ["dashboard"],
    status: "launch",
    plans: {
      starter: OUT,
      standard: inc("unlimited", "30分/月"),
      pro: inc("unlimited", "60分/月 + 四半期レビュー"),
    },
  },

  // ── バックログ（ロードマップに保持・今は作らない/売らない） ──
  // 料金表から除外。3院ルール（moat §4-B）で需要が確認できたら launch に昇格。
  "data-import": {
    name: "外部データ連携",
    short: "データ連携",
    description:
      "予約・POS・広告データを取り込み（CSV→将来API）、コパイロットの精度を上げる。moat条件A（継ぎ目の所有）の最優先バックログ。",
    emoji: "🔌",
    tier: "topping",
    dependsOn: ["core"],
    status: "backlog",
    plans: NONE,
  },
  lessons: {
    name: "学習コンテンツ配信",
    short: "レッスン",
    description:
      "章立てのレッスン・クイズ・種/バッジ。ローンチは recovery-guide とコメントで代替し、コンテンツ事業は後日。",
    emoji: "📘",
    tier: "topping",
    dependsOn: ["line-share"],
    status: "backlog",
    plans: NONE,
  },
  "theme-pack": {
    name: "テーマパック",
    short: "テーマパック",
    description:
      "腸・食事・スキンケア・運動（業種別）のコンテンツ束。縦ニッチ制圧の武器だが後日の収益化。",
    emoji: "📦",
    tier: "content",
    dependsOn: ["lessons"],
    status: "backlog",
    plans: NONE,
  },
  "ai-guide": {
    name: "AIパーソナルガイド",
    short: "AIガイド",
    description: "検査・悩みからお客様専用ガイドをAI生成。二面配信の自動生成経路。",
    emoji: "✨",
    tier: "topping",
    dependsOn: ["core", "line-share"],
    status: "backlog",
    plans: NONE,
  },
  "case-library": {
    name: "症例ライブラリ",
    short: "症例ライブラリ",
    description: "自店症例をタグ・年代で蓄積し類似検索。重く・ニッチなため後日。",
    emoji: "🗂",
    tier: "topping",
    dependsOn: ["photos"],
    status: "backlog",
    plans: NONE,
  },
  "multi-location": {
    name: "多店舗・FC横断",
    short: "多店舗",
    description: "店舗横断ダッシュボードと本部管理。FC顧客が出てから。",
    emoji: "🏢",
    tier: "topping",
    dependsOn: ["dashboard"],
    status: "backlog",
    plans: NONE,
  },
  qa: {
    name: "店舗⇔顧客メッセージング",
    short: "Q&A",
    description: "初期は LINE で代替するため後日。",
    emoji: "💭",
    tier: "topping",
    dependsOn: ["core"],
    status: "backlog",
    plans: NONE,
  },
} as const satisfies Record<string, ToppingDef>;

export type ToppingId = keyof typeof TOPPINGS;

export const ALL_TOPPING_IDS = Object.keys(TOPPINGS) as ToppingId[];

export function getTopping(id: string): ToppingDef | undefined {
  return (TOPPINGS as Record<string, ToppingDef>)[id];
}

export function isTopping(id: string): id is ToppingId {
  return id in TOPPINGS;
}

/** ローンチ対象のトッピングだけ（backlog を除外）。料金表・ナビが使う。 */
export function launchToppings(): [ToppingId, ToppingDef][] {
  return (Object.entries(TOPPINGS) as [ToppingId, ToppingDef][]).filter(
    ([, t]) => t.status === "launch",
  );
}
