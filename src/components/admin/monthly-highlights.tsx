"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { Share2, Sparkles } from "lucide-react";
import { CustomerAvatar } from "@/components/ui/customer-avatar";
import {
  BackPhotoPlaceholder,
  severityFromSelfRating,
} from "@/components/progress/back-photo-placeholder";

export type HighlightItem = {
  clientId: string;
  clientName: string;
  weeksTracked: number;
  selfRatingDelta: number;
  earliestRating: number | null;
  latestRating: number | null;
};

/**
 * "今月のハイライト" — top 3 clients with the biggest delta in self-rating
 * during the current period. Each card links to the customer detail.
 */
export function MonthlyHighlights({ items }: { items: HighlightItem[] }) {
  const top = useMemo(
    () =>
      items
        .filter((i) => typeof i.selfRatingDelta === "number" && i.selfRatingDelta > 0)
        .sort((a, b) => b.selfRatingDelta - a.selfRatingDelta)
        .slice(0, 3),
    [items],
  );

  if (top.length === 0) return null;

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <header className="flex items-center gap-1.5 border-b border-stone-200 px-4 py-2.5">
        <Sparkles className="h-3.5 w-3.5 text-brand-700" />
        <h3 className="text-sm font-semibold text-stone-900">今月のハイライト</h3>
        <span className="ml-1 text-[10px] text-stone-400">改善の上位3名</span>
      </header>
      <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        {top.map((h) => {
          const beforeSeverity = severityFromSelfRating(h.earliestRating);
          const afterSeverity = severityFromSelfRating(h.latestRating);
          return (
            <li
              key={h.clientId}
              className="overflow-hidden rounded-lg border border-stone-200"
            >
              <div className="grid grid-cols-2">
                <div className="aspect-square">
                  <BackPhotoPlaceholder
                    severity={beforeSeverity}
                    lighting="cool"
                    caption="Before"
                  />
                </div>
                <div className="aspect-square">
                  <BackPhotoPlaceholder
                    severity={afterSeverity}
                    lighting="warm"
                    caption="After"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5">
                <CustomerAvatar name={h.clientName} size="xs" role="customer" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-stone-900">
                    {h.clientName} 様
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {h.weeksTracked} 週で自覚改善度 +{h.selfRatingDelta.toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="flex border-t border-stone-100">
                <Link
                  href={`/admin/clients/${h.clientId}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center px-3 text-center text-[11px] font-medium text-brand-700 hover:bg-stone-50"
                >
                  詳細
                </Link>
                <button
                  type="button"
                  onClick={() => toast.success("ハイライトをシェアしました")}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 border-l border-stone-100 px-3 text-[11px] font-medium text-stone-600 hover:bg-stone-50"
                >
                  <Share2 className="h-3 w-3" />
                  シェア
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
