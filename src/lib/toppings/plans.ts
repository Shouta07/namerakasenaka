/**
 * プラン定義とプラン→エンタイトルメント写像。
 *
 * プラン = トッピングのプリセット束（topping-architecture §2.1）。
 * DB の entitlements を初期生成する唯一のロジック。単品追加(addon)や
 * トライアルは、この束に上書きで足していく（source を分ける）。
 */

import { TOPPINGS } from "./registry";
import type { Entitlement, PlanId } from "./types";

export const PLAN_META: Record<
  PlanId,
  { name: string; priceJpy: number; tagline: string; target: string }
> = {
  starter: {
    name: "Starter",
    priceJpy: 14800,
    tagline: "まず小さく、成約の記録から",
    target: "1〜2名の小規模店",
  },
  standard: {
    name: "Standard",
    priceJpy: 29800,
    tagline: "練習・数字・伴走がそろう主力プラン",
    target: "スタッフ3名〜",
  },
  pro: {
    name: "Pro",
    priceJpy: 49800,
    tagline: "多店舗・クリニック向けフル装備",
    target: "多店舗・FC・自由診療",
  },
};

/** 年払いの割引率（キャッシュ先取り + 解約抑止）。 */
export const ANNUAL_DISCOUNT = 0.1;

export function annualJpy(plan: PlanId): number {
  const monthly = PLAN_META[plan].priceJpy;
  return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT));
}

/**
 * プランから、そのテナントの初期エンタイトルメントを導出する。
 * registry.plans[plan] が included:true のものだけを source:"plan" で有効化。
 */
export function deriveEntitlements(plan: PlanId): Record<string, Entitlement> {
  const out: Record<string, Entitlement> = {};
  for (const [id, def] of Object.entries(TOPPINGS)) {
    const inc = def.plans[plan];
    if (!inc.included) continue;
    out[id] = {
      toppingId: id,
      enabled: true,
      source: "plan",
      limit: "limit" in inc ? inc.limit : undefined,
    };
  }
  return out;
}
