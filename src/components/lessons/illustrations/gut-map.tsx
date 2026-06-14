import { cn } from "@/lib/utils/cn";
import {
  BacteriaCluster,
  Caption,
  DiagramFrame,
  OrganTile,
  VConnector,
} from "./_atoms";

/**
 * Lesson 1: おなかの地図
 * 口 → 食道 → 胃 → 十二指腸 → 小腸（菌すくない）→ 大腸（菌のおうち）
 */
export function GutMapIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="食べものの通り道" className={className}>
      <div className="flex flex-col items-center gap-1">
        <OrganTile emoji="👄" label="口" size="sm" />
        <VConnector />
        <OrganTile emoji="🍽️" label="食道" size="sm" />
        <VConnector />
        <OrganTile emoji="🫃" label="胃" size="sm" />
        <VConnector />
        <OrganTile emoji="🌀" label="十二指腸" size="sm" />
        <VConnector />

        {/* 小腸 — 菌すくない */}
        <GutSegment
          label="小腸"
          sublabel="本来は菌すくない"
          tone="brand"
          bacteriaCount={3}
        />
        <VConnector />

        {/* 大腸 — 菌のおうち */}
        <GutSegment
          label="大腸"
          sublabel="菌のおうち"
          tone="emerald"
          bacteriaCount={24}
          emphasized
        />
      </div>

      <p className="px-4 text-center text-[11px] leading-relaxed text-stone-500">
        ふだん菌がたくさん住んでいるのは <span className="font-semibold text-emerald-700">大腸</span>。
        その手前の <span className="font-semibold text-brand-700">小腸</span> は、本来とても少ない場所です。
      </p>
    </DiagramFrame>
  );
}

function GutSegment({
  label,
  sublabel,
  tone,
  bacteriaCount,
  emphasized,
}: {
  label: string;
  sublabel: string;
  tone: "brand" | "emerald";
  bacteriaCount: number;
  emphasized?: boolean;
}) {
  const cls = {
    brand: "border-brand-200 bg-brand-50",
    emerald: "border-emerald-200 bg-emerald-50",
  }[tone];
  const labelCls = {
    brand: "text-brand-700",
    emerald: "text-emerald-700",
  }[tone];
  return (
    <div
      className={cn(
        "flex w-full max-w-[280px] flex-col items-center gap-2 rounded-2xl border px-4 py-3",
        cls,
        emphasized && "shadow-sm",
      )}
    >
      <div className="flex items-center justify-between gap-3 self-stretch">
        <p className={cn("text-sm font-semibold", labelCls)}>{label}</p>
        <Caption tone={tone === "brand" ? "brand" : "emerald"}>{sublabel}</Caption>
      </div>
      <BacteriaCluster count={bacteriaCount} tone={tone === "brand" ? "muted" : "emerald"} />
    </div>
  );
}
