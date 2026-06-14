import { BacteriaCluster, Caption, DiagramFrame, VConnector } from "./_atoms";

/**
 * Lesson 3: 玉ねぎ・小麦のフルクタン
 * 食べもの → 小腸（吸収✕）→ 大腸で発酵 → ガス
 */
export function FructanFeedingIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="フルクタンの旅" className={className}>
      <div className="flex w-full flex-col items-stretch gap-2">
        {/* 1. 食べもの */}
        <Stage
          step="①"
          tone="brand"
          title="フルクタンを含む食べもの"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl">
            <FoodChip label="玉ねぎ" emoji="🧅" />
            <FoodChip label="小麦" emoji="🌾" />
            <FoodChip label="にんにく" emoji="🧄" />
          </div>
        </Stage>

        <VConnector />

        {/* 2. 小腸 */}
        <Stage
          step="②"
          tone="amber"
          title="小腸"
          subtitle="吸収されにくい"
        >
          <p className="text-center text-base">
            <span className="text-2xl">🌿</span>
            <span className="ml-1 font-semibold text-amber-700">吸収 ✕</span>
          </p>
        </Stage>

        <VConnector />

        {/* 3. 大腸 */}
        <Stage
          step="③"
          tone="emerald"
          title="大腸"
          subtitle="菌が発酵させる"
        >
          <div className="flex flex-col items-center gap-1">
            <BacteriaCluster count={14} tone="emerald" size="sm" />
            <p className="text-[11px] text-emerald-700">↓ 発酵</p>
            <p className="text-lg">💨 💨 💨</p>
            <p className="text-[11px] text-stone-500">おなかが張る</p>
          </div>
        </Stage>
      </div>
    </DiagramFrame>
  );
}

function Stage({
  step,
  tone,
  title,
  subtitle,
  children,
}: {
  step: string;
  tone: "brand" | "amber" | "emerald";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const cls = {
    brand: "border-brand-200 bg-brand-50",
    amber: "border-amber-200 bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50",
  }[tone];
  const captionTone = {
    brand: "brand",
    amber: "muted",
    emerald: "emerald",
  }[tone] as "brand" | "muted" | "emerald";
  return (
    <section className={`rounded-2xl border px-3 py-3 ${cls}`}>
      <div className="mb-1.5 flex items-center justify-between">
        <Caption tone={captionTone}>
          {step} {title}
        </Caption>
        {subtitle ? (
          <span className="text-[10px] text-stone-500">{subtitle}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FoodChip({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div className="inline-flex flex-col items-center rounded-xl border border-brand-200 bg-white px-2.5 py-1.5">
      <span className="text-xl leading-none">{emoji}</span>
      <span className="mt-0.5 text-[10px] font-medium text-stone-600">{label}</span>
    </div>
  );
}
