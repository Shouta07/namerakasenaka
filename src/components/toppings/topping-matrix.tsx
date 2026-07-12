/**
 * プラン × トッピング 対応表。
 *
 * レジストリ（唯一の情報源）から描画する。営業資材と実装が乖離しないよう、
 * この表はコードのカタログをそのまま映す。
 */
import { Fragment } from "react";
import { launchToppings } from "@/lib/toppings/registry";
import { PLAN_META } from "@/lib/toppings/plans";
import {
  PLAN_ORDER,
  type PlanId,
  type PlanInclusion,
  type ToppingDef,
} from "@/lib/toppings/types";

const TIER_LABEL: Record<ToppingDef["tier"], string> = {
  base: "生地（全プラン共通）",
  cheese: "標準搭載",
  topping: "トッピング",
  content: "コンテンツパック",
  service: "サービス",
};

const TIER_ORDER: ToppingDef["tier"][] = [
  "base",
  "cheese",
  "topping",
  "content",
  "service",
];

function cell(inc: PlanInclusion) {
  if (!inc.included)
    return <span className="text-stone-300">—</span>;
  if (inc.note)
    return <span className="text-[12px] font-semibold text-stone-800">{inc.note}</span>;
  if (inc.limit === "unlimited")
    return <span className="font-bold text-brand-700">無制限</span>;
  if (typeof inc.limit === "number")
    return <span className="font-bold text-stone-900">{inc.limit}</span>;
  return <span className="font-bold text-brand-700">✓</span>;
}

export function ToppingMatrix() {
  const rows = launchToppings();
  const byTier = TIER_ORDER.map((tier) => ({
    tier,
    items: rows.filter(([, d]) => d.tier === tier),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[#faf8f4] px-3 py-3 text-[12px] font-semibold uppercase tracking-widest text-stone-400">
              機能トッピング
            </th>
            {PLAN_ORDER.map((p: PlanId) => (
              <th
                key={p}
                className="border-b border-stone-200 px-3 py-3 text-center"
              >
                <div className="text-[13px] font-extrabold text-stone-900">
                  {PLAN_META[p].name}
                </div>
                <div className="text-[12px] font-bold text-brand-700">
                  ¥{PLAN_META[p].priceJpy.toLocaleString()}
                  <span className="text-[10px] font-medium text-stone-400">
                    /月
                  </span>
                </div>
              </th>
            ))}
            <th className="border-b border-stone-200 px-3 py-3 text-center text-[11px] font-semibold text-stone-400">
              単品追加
            </th>
          </tr>
        </thead>
        <tbody>
          {byTier.map((group) => (
            <Fragment key={group.tier}>
              <tr>
                <td
                  colSpan={PLAN_ORDER.length + 2}
                  className="bg-stone-50 px-3 py-1.5 text-[11px] font-bold text-stone-500"
                >
                  {TIER_LABEL[group.tier]}
                </td>
              </tr>
              {group.items.map(([id, def]) => (
                <tr key={id} className="hover:bg-brand-50/40">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2.5 align-top">
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden>{def.emoji}</span>
                      <span className="text-[13px] font-bold text-stone-900">
                        {def.name}
                      </span>
                    </div>
                    <p className="mt-0.5 max-w-[280px] text-[11px] leading-snug text-stone-500">
                      {def.description}
                    </p>
                  </td>
                  {PLAN_ORDER.map((p) => (
                    <td
                      key={p}
                      className="border-b border-stone-100 px-3 py-2.5 text-center"
                    >
                      {cell(def.plans[p])}
                    </td>
                  ))}
                  <td className="border-b border-stone-100 px-3 py-2.5 text-center text-[11px] text-stone-500">
                    {def.addon ? def.addon.label : "—"}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
