/**
 * Accord トッピング・レジストリ — 唯一の情報源。
 *
 * docs/accord/topping-architecture.md §2.2 のカタログをコード化したもの。
 * ナビ・ゲート・料金表・エンタイトルメント写像はすべてここを読む。
 * 現行 `lib/accord/fixtures.ts` の ACCORD_MODULES を上位互換で置き換える資産。
 */

import type { ToppingDef } from "./types";

const INC = { included: true } as const;
const OUT = { included: false } as const;
const inc = (limit: number | "unlimited", note?: string) =>
  ({ included: true as const, limit, note });

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

  // ── チーズ（標準搭載） ────────────────────────────────
  dashboard: {
    name: "成約ダッシュボード",
    short: "ダッシュボード",
    description:
      "初回予約→成約のファネル、成約率の推移、スタッフ別成約率。感覚ではなく数字で振り返る。",
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
    addon: { jpy: 3, cycle: "per_unit", label: "通数超過 ¥3/通" },
  },

  // ── トッピング（足し引き自由） ─────────────────────────
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
    addon: { jpy: 5000, cycle: "once", label: "50回追加パック ¥5,000" },
  },
  "follow-loop": {
    name: "継続フォロー",
    short: "継続フォロー",
    description:
      "「今日のひとつ」・自己ログ・リマインドで、成約後もお客様に伴走し続ける仕組み。",
    emoji: "🌱",
    tier: "topping",
    dependsOn: ["core", "line-share"],
    status: "launch",
    plans: { starter: OUT, standard: INC, pro: INC },
    addon: { jpy: 5000, cycle: "monthly", label: "単品追加 ¥5,000/月" },
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
    addon: { jpy: 3000, cycle: "monthly", label: "単品追加 ¥3,000/月" },
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
    addon: { jpy: 3000, cycle: "monthly", label: "単品追加 ¥3,000/月" },
  },
  "case-library": {
    name: "症例ライブラリ",
    short: "症例ライブラリ",
    description:
      "自店の症例をタグ・年代で蓄積し、似た症例を類似検索。カウンセリングの説得材料に。",
    emoji: "🗂",
    tier: "topping",
    dependsOn: ["photos"],
    status: "launch",
    plans: { starter: OUT, standard: OUT, pro: INC },
    addon: { jpy: 8000, cycle: "monthly", label: "単品追加 ¥8,000/月" },
  },
  "ai-guide": {
    name: "AIパーソナルガイド",
    short: "AIガイド",
    description:
      "検査・悩みからお客様専用のガイドをAI生成。翻訳辞書ベースで医療をやさしく。",
    emoji: "✨",
    tier: "topping",
    dependsOn: ["core", "line-share"],
    status: "launch",
    plans: { starter: OUT, standard: OUT, pro: INC },
    addon: { jpy: 10000, cycle: "monthly", label: "単品追加 ¥10,000/月" },
  },
  lessons: {
    name: "学習コンテンツ配信",
    short: "レッスン",
    description:
      "章立てのレッスン・クイズ・種/バッジ。お客様が来店の間にも体の話を学べる。",
    emoji: "📘",
    tier: "topping",
    dependsOn: ["line-share"],
    status: "launch",
    plans: {
      starter: OUT,
      standard: inc(1, "1パック"),
      pro: inc("unlimited"),
    },
  },

  // ── コンテンツパック（買い切り具材） ──────────────────
  "theme-pack": {
    name: "テーマパック",
    short: "テーマパック",
    description:
      "腸・食事・スキンケア・運動（や業種別）のレッスン+図解+練習シナリオ+翻訳辞書の束。",
    emoji: "📦",
    tier: "content",
    dependsOn: ["lessons"],
    status: "launch",
    plans: { starter: OUT, standard: INC, pro: INC },
    addon: { jpy: 100000, cycle: "once", label: "1テーマ ¥100,000 買い切り" },
  },

  // ── 拡張 ───────────────────────────────────────────
  "multi-location": {
    name: "多店舗・FC横断",
    short: "多店舗",
    description: "店舗をまたいだ横断ダッシュボードと本部管理。FC・多店舗向け。",
    emoji: "🏢",
    tier: "topping",
    dependsOn: ["dashboard"],
    status: "launch",
    plans: { starter: OUT, standard: OUT, pro: INC },
    addon: { jpy: 10000, cycle: "monthly", label: "1店舗あたり ¥10,000/月" },
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
    addon: { jpy: 15000, cycle: "once", label: "スポット ¥15,000/回" },
  },

  // ── 後期（M10+・既定の料金表には出さない） ──────────────
  "meals-review": {
    name: "食事記録+専門家レビュー",
    short: "食事レビュー",
    description:
      "顧客の食事記録にAI下書き→専門家承認でコメント。監修者ネットワークが前提。",
    emoji: "🥗",
    tier: "topping",
    dependsOn: ["core"],
    status: "later",
    plans: { starter: OUT, standard: OUT, pro: OUT },
  },
  qa: {
    name: "店舗⇔顧客メッセージング",
    short: "Q&A",
    description: "店舗とお客様の相談メッセージ。初期は LINE で代替するため後期。",
    emoji: "💭",
    tier: "topping",
    dependsOn: ["core"],
    status: "later",
    plans: { starter: OUT, standard: OUT, pro: OUT },
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

/** ローンチ対象のトッピングだけ（後期 status:later を除外）。 */
export function launchToppings(): [ToppingId, ToppingDef][] {
  return (Object.entries(TOPPINGS) as [ToppingId, ToppingDef][]).filter(
    ([, t]) => t.status === "launch",
  );
}
