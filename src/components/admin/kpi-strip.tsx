import { cn } from "@/lib/utils/cn";

export type KpiStripItem = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "brand" | "warning";
};

const toneClasses: Record<NonNullable<KpiStripItem["tone"]>, string> = {
  neutral: "text-stone-900",
  brand: "text-brand-700",
  warning: "text-amber-700",
};

/**
 * Compact KPI strip for the salon admin home. 4 cards in a row on desktop,
 * 2x2 on mobile. Tighter than the older KpiCards: single-line value, no hint
 * by default unless explicitly provided.
 */
export function KpiStrip({ items }: { items: KpiStripItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {items.map((k) => (
        <div
          key={k.label}
          className="flex h-20 flex-col justify-between rounded-lg border border-stone-200 bg-white px-3 py-2"
        >
          <p className="text-[11px] font-medium text-stone-500">{k.label}</p>
          <div>
            <p
              className={cn(
                "text-2xl font-semibold leading-none tracking-tight",
                toneClasses[k.tone ?? "neutral"],
              )}
            >
              {k.value}
            </p>
            {k.hint ? (
              <p className="mt-1 text-[10px] text-stone-400">{k.hint}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
