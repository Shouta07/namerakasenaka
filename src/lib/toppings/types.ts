/**
 * Field CX トッピング機構 — 型定義。
 *
 * 「機能をトッピングできる SaaS」の唯一の情報源。
 * 詳細設計: docs/field-cx/topping-architecture.md §3。
 *
 * ここには課金情報（誰が使えるか）は入れない。それは entitlement（DB）の
 * 役割。ここはトッピングの「定義」— 型安全・レビュー可能なコードとして持つ。
 */

/**
 * 階層。base=生地 / copilot=AI頭脳(v2) / cheese=標準搭載 /
 * topping=足し引き / content=買い切り具材 / service=人が乗る。
 */
export type ToppingTier =
  | "base"
  | "copilot"
  | "cheese"
  | "topping"
  | "content"
  | "service";

export type PlanId = "starter" | "standard" | "pro";

export const PLAN_ORDER: PlanId[] = ["starter", "standard", "pro"];

/**
 * あるプランでそのトッピングがどう含まれるか。
 * - included:false … そのプランには含まれない（addon があれば追加購入は可能）
 * - included:true  … 含まれる。limit があれば従量上限、"unlimited" なら無制限、
 *                    note は「基本」「30分」など定性表現
 */
export type PlanInclusion =
  | { included: false }
  | { included: true; limit?: number | "unlimited"; note?: string };

export type ToppingDef = {
  name: string;
  short: string;
  description: string;
  emoji: string;
  tier: ToppingTier;
  /** 依存するトッピング（これらが有効でないと有効化できない）。 */
  dependsOn: string[];
  /**
   * launch = ローンチ対象（料金表に出る）／
   * backlog = ロードマップに保持するが今は作らない・売らない（料金表から除外）。
   * ※単品アドオン価格はローンチでは持たない（プラン束のみ販売。expansion は後日）。
   */
  status: "launch" | "backlog";
  /** 有効時にナビへ出す（無ければナビ非表示のバックグラウンド機能）。 */
  nav?: { href: string; label: string; order: number };
  /** プラン別の含まれ方。 */
  plans: Record<PlanId, PlanInclusion>;
  /** 従量メーター（残回数・残通数の判定に使う）。 */
  meter?: { metric: string; unit: string };
};

// ---- ランタイム判定（can）で使う型 --------------------------------

/** DB の entitlements 行に相当。誰が・何を・どこまで使えるか。 */
export type Entitlement = {
  toppingId: string;
  enabled: boolean;
  source: "plan" | "addon" | "trial" | "manual";
  /** 従量上限。数値 or 無制限。 */
  limit?: number | "unlimited";
  /** トライアル・期間限定の失効。null/undefined は無期限。 */
  validUntil?: string | null;
};

/** can() に渡す1テナントぶんの文脈。DB からハイドレートして渡す（can 自体は純関数）。 */
export type ToppingContext = {
  now?: Date;
  /** toppingId -> entitlement。 */
  entitlements: Record<string, Entitlement>;
  /** 第2層: 契約内でもオーナーが「使わない」を選べる。toppingId -> enabled。 */
  orgSettings?: Record<string, boolean>;
  /** toppingId -> 今期の使用量（メーターのある機能のみ）。 */
  usage?: Record<string, number>;
};

export type CanReason =
  | "ok"
  | "not_entitled"
  | "disabled"
  | "dependency"
  | "limit"
  | "expired"
  | "unknown_topping";

export type CanResult = {
  ok: boolean;
  reason: CanReason;
  /** limit 判定時の詳細（アップセル導線の文言に使う）。 */
  detail?: { metric?: string; used?: number; limit?: number; missing?: string };
};
