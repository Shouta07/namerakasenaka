/**
 * can() — 全レイヤの唯一の判定入口（topping-architecture §3.1）。
 *
 * 判定は3層: 課金(entitlement) → org設定 → 依存。使用量つきなら上限も。
 * 純関数。DB からハイドレートした ToppingContext を渡して呼ぶ。
 *
 * API Route / Server Action は必ずこれを通すこと。UI 制御だけのガードは禁止
 * （LINE 同意の 403 と同じ思想）。
 */

import { getTopping } from "./registry";
import type { CanResult, ToppingContext } from "./types";

const OK: CanResult = { ok: true, reason: "ok" };

function isExpired(validUntil: string | null | undefined, now: Date): boolean {
  if (!validUntil) return false;
  return new Date(validUntil).getTime() < now.getTime();
}

/**
 * org が topping を（任意で amount ぶん）使えるか。
 *
 * @param usage 従量メーターのある機能で、今回 amount ぶん消費してよいか判定したい時に渡す。
 */
export function can(
  ctx: ToppingContext,
  toppingId: string,
  usage?: { amount: number },
): CanResult {
  const def = getTopping(toppingId);
  if (!def) return { ok: false, reason: "unknown_topping" };

  const now = ctx.now ?? new Date();

  // 生地は常に有効。
  if (def.tier === "base") {
    return checkLimit(ctx, toppingId, usage);
  }

  // 第1層: entitlement（課金）。
  const ent = ctx.entitlements[toppingId];
  if (!ent || !ent.enabled) return { ok: false, reason: "not_entitled" };
  if (isExpired(ent.validUntil, now)) return { ok: false, reason: "expired" };

  // 依存: dependsOn がすべて有効でなければ有効化できない。
  for (const dep of def.dependsOn) {
    const depResult = can(ctx, dep);
    if (!depResult.ok) {
      return { ok: false, reason: "dependency", detail: { missing: dep } };
    }
  }

  // 第2層: org 設定（契約内でも「使わない」を選べる）。
  if (ctx.orgSettings && ctx.orgSettings[toppingId] === false) {
    return { ok: false, reason: "disabled" };
  }

  // 上限（従量）。
  return checkLimit(ctx, toppingId, usage);
}

function checkLimit(
  ctx: ToppingContext,
  toppingId: string,
  usage?: { amount: number },
): CanResult {
  if (!usage) return OK;
  const def = getTopping(toppingId);
  const ent = ctx.entitlements[toppingId];
  const limit = ent?.limit;
  if (limit === undefined || limit === "unlimited") return OK;

  const used = ctx.usage?.[toppingId] ?? 0;
  if (used + usage.amount > limit) {
    return {
      ok: false,
      reason: "limit",
      detail: { metric: def?.meter?.metric, used, limit },
    };
  }
  return OK;
}

/** 有効なトッピングだけを返す（ナビ生成などの表示制御に使う）。 */
export function enabledToppings(ctx: ToppingContext, ids: string[]): string[] {
  return ids.filter((id) => can(ctx, id).ok);
}
