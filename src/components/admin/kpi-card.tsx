import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type KpiTrendDirection = "up" | "down" | "flat";

export type KpiCardItem = {
  label: string;
  value: string | number;
  /** Delta string e.g. "+1", "+3 名", "+6pt", "-2". */
  deltaLabel?: string;
  /** Vs label e.g. "昨日", "先月". */
  vsLabel?: string;
  /** Direction (used for arrow icon + colour). */
  direction?: KpiTrendDirection;
  /**
   * Indicates whether `up` means good (default for new clients) or bad
   * (e.g. high at-risk count). Flips the colour mapping but keeps arrow
   * direction.
   */
  goodWhen?: "up" | "down";
  tone?: "neutral" | "brand" | "warning";
  /** Small sparkline series — auto-normalised, optional. */
  spark?: number[];
};

const TONE_VALUE: Record<NonNullable<KpiCardItem["tone"]>, string> = {
  neutral: "text-stone-900",
  brand: "text-brand-700",
  warning: "text-amber-700",
};

function arrowIcon(direction: KpiTrendDirection) {
  if (direction === "up") return ArrowUp;
  if (direction === "down") return ArrowDown;
  return Minus;
}

function deltaColor(
  direction: KpiTrendDirection,
  goodWhen: "up" | "down",
): string {
  if (direction === "flat") return "text-stone-500";
  const isGood = direction === goodWhen;
  return isGood ? "text-emerald-700" : "text-rose-700";
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const w = 56;
  const h = 16;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const pts = values
    .map((v, i) => {
      const y = h - ((v - min) / range) * h;
      return `${i * step},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="text-brand-500"
      aria-hidden="true"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Compact KPI card with trend arrow + delta + optional sparkline.
 * Replacement / superset of KpiStrip and KpiCards.
 */
export function KpiCards({ items }: { items: KpiCardItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {items.map((k) => {
        const dir = k.direction ?? "flat";
        const good = k.goodWhen ?? "up";
        const Arrow = arrowIcon(dir);
        const dcolor = deltaColor(dir, good);
        return (
          <div
            key={k.label}
            className="flex flex-col gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2.5"
          >
            <p className="text-[11px] font-medium text-stone-500">{k.label}</p>
            <div className="flex items-end justify-between gap-1">
              <p
                className={cn(
                  "text-2xl font-semibold leading-none tracking-tight",
                  TONE_VALUE[k.tone ?? "neutral"],
                )}
              >
                {k.value}
              </p>
              {k.spark && k.spark.length > 0 ? (
                <Sparkline values={k.spark} />
              ) : null}
            </div>
            {k.deltaLabel ? (
              <p
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-medium",
                  dcolor,
                )}
              >
                <Arrow className="h-3 w-3" />
                <span>{k.deltaLabel}</span>
                {k.vsLabel ? (
                  <span className="text-stone-400">vs {k.vsLabel}</span>
                ) : null}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
