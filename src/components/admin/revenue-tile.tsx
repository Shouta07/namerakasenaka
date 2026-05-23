import { TrendingUp } from "lucide-react";
import { formatJpy } from "@/lib/demo/fixtures";

export type RevenueBreakdown = {
  b2bPlatform: number;
  b2cUpper: number;
  revenueShare: number;
};

/**
 * Monthly revenue projection tile with breakdown by source.
 */
export function RevenueTile({
  monthlyTotalJpy,
  breakdown,
  vsLastMonthPct,
}: {
  monthlyTotalJpy: number;
  breakdown: RevenueBreakdown;
  vsLastMonthPct?: number;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium text-stone-500">今月の売上見込</p>
        {vsLastMonthPct != null ? (
          <p className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            前月比 {vsLastMonthPct >= 0 ? "+" : ""}
            {vsLastMonthPct}%
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-brand-700">
        {formatJpy(monthlyTotalJpy)}
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">B2B プラットフォーム</dt>
          <dd className="mt-0.5 text-sm font-semibold text-stone-700">
            {formatJpy(breakdown.b2bPlatform)}
          </dd>
        </div>
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">B2C 上位プラン</dt>
          <dd className="mt-0.5 text-sm font-semibold text-stone-700">
            {formatJpy(breakdown.b2cUpper)}
          </dd>
        </div>
        <div className="rounded-md bg-stone-50 p-2">
          <dt className="text-stone-500">レベニューシェア</dt>
          <dd className="mt-0.5 text-sm font-semibold text-stone-700">
            {formatJpy(breakdown.revenueShare)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
