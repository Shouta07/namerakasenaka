/**
 * 図解の共通アトム。
 * Tailwind + emoji ベースのインフォグラフィックを統一トーンで描く。
 */
import { cn } from "@/lib/utils/cn";

export function Caption({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "brand" | "emerald" }) {
  const toneCls = {
    muted: "text-stone-500",
    brand: "text-brand-700",
    emerald: "text-emerald-700",
  }[tone];
  return (
    <p className={cn("text-[10px] font-semibold uppercase tracking-wider", toneCls)}>
      {children}
    </p>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "emerald" | "amber" | "rose";
  className?: string;
}) {
  const toneCls = {
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        toneCls,
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * 菌のドット群。count に応じて行ボックスに均等配置。
 */
export function BacteriaCluster({
  count,
  tone = "emerald",
  size = "sm",
}: {
  count: number;
  tone?: "emerald" | "amber" | "rose" | "muted";
  size?: "xs" | "sm" | "md";
}) {
  const dotCls = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    muted: "bg-stone-400",
  }[tone];
  const sizeCls = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
  }[size];
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn("rounded-full", dotCls, sizeCls)}
        />
      ))}
    </div>
  );
}

/**
 * セクション間の縦コネクタ（矢印・線）。
 */
export function VConnector() {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <span className="h-3 w-px bg-stone-300" />
      <span className="text-[10px] leading-none text-stone-400">▼</span>
    </div>
  );
}

/**
 * セクション間の横コネクタ（矢印）。
 */
export function HConnector() {
  return (
    <span className="text-base text-stone-400" aria-hidden>
      →
    </span>
  );
}

/**
 * 1つの臓器・概念を表す角丸カード。
 */
export function OrganTile({
  emoji,
  label,
  sublabel,
  tone = "neutral",
  size = "md",
}: {
  emoji?: string;
  label: string;
  sublabel?: string;
  tone?: "neutral" | "brand" | "emerald" | "amber";
  size?: "sm" | "md" | "lg";
}) {
  const toneCls = {
    neutral: "bg-white border-stone-200",
    brand: "bg-brand-50 border-brand-200",
    emerald: "bg-emerald-50 border-emerald-200",
    amber: "bg-amber-50 border-amber-200",
  }[tone];
  const sizeCls = {
    sm: "px-2.5 py-1.5 min-w-[64px]",
    md: "px-3 py-2 min-w-[80px]",
    lg: "px-4 py-3 min-w-[96px]",
  }[size];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border text-center",
        toneCls,
        sizeCls,
      )}
    >
      {emoji ? <span className="text-xl leading-none">{emoji}</span> : null}
      <p className="mt-1 text-xs font-semibold text-stone-800">{label}</p>
      {sublabel ? (
        <p className="mt-0.5 text-[10px] leading-tight text-stone-500">{sublabel}</p>
      ) : null}
    </div>
  );
}

/**
 * 図解のフレーム（タイトル + 本体）。
 */
export function DiagramFrame({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("mx-auto flex w-full max-w-md flex-col items-stretch gap-3", className)}>
      {title ? (
        <figcaption className="text-center">
          <Caption tone="brand">{title}</Caption>
        </figcaption>
      ) : null}
      <div className="flex flex-col items-center gap-3">{children}</div>
    </figure>
  );
}
