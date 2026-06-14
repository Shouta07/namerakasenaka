import { BacteriaCluster, Caption, DiagramFrame } from "./_atoms";

/**
 * Lesson 2: 菌の渋滞 SIBO
 * 大腸の菌が逆流して小腸にも増え、ガスが発生する様子。
 */
export function SiboTrafficIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="ふだんの腸 と SIBO の腸" className={className}>
      {/* 正常 */}
      <section className="w-full rounded-2xl border border-stone-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <Caption tone="brand">ふだんの腸</Caption>
          <span className="text-[10px] text-stone-400">本来のバランス</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <GutBox label="小腸" tone="brand" count={2} sub="菌すくない" />
          <GutBox label="大腸" tone="emerald" count={20} sub="菌のおうち" />
        </div>
      </section>

      {/* SIBO */}
      <section className="w-full rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <Caption tone="muted">
            <span className="text-amber-700">SIBO の腸</span>
          </Caption>
          <span className="text-[10px] text-amber-700">菌があふれて逆流</span>
        </div>
        <div className="relative grid grid-cols-2 gap-2">
          <GutBox label="小腸" tone="amber" count={16} sub="菌がふえすぎ" gas />
          <GutBox label="大腸" tone="emerald" count={22} sub="" />
          {/* 逆流の矢印 */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
            <span className="rounded-full bg-white px-1 text-sm text-amber-600 shadow-sm">←</span>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-amber-800">
          発酵してできた <span className="font-semibold">ガス</span> でおなかが張ります
        </p>
      </section>
    </DiagramFrame>
  );
}

function GutBox({
  label,
  tone,
  count,
  sub,
  gas,
}: {
  label: string;
  tone: "brand" | "emerald" | "amber";
  count: number;
  sub: string;
  gas?: boolean;
}) {
  const cls = {
    brand: "border-brand-200 bg-brand-50",
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-300 bg-amber-100/60",
  }[tone];
  const labelTone = {
    brand: "text-brand-700",
    emerald: "text-emerald-700",
    amber: "text-amber-800",
  }[tone];
  const dotTone = {
    brand: "muted",
    emerald: "emerald",
    amber: "amber",
  }[tone] as "muted" | "emerald" | "amber";
  return (
    <div className={`relative flex flex-col items-center gap-2 rounded-xl border px-2 py-2 ${cls}`}>
      <p className={`text-xs font-semibold ${labelTone}`}>{label}</p>
      <BacteriaCluster count={count} tone={dotTone} size="xs" />
      {sub ? <p className="text-[10px] text-stone-500">{sub}</p> : null}
      {gas ? (
        <span className="absolute -right-1 -top-2 text-base" aria-label="ガス">
          💨
        </span>
      ) : null}
    </div>
  );
}
