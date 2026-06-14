import { BacteriaCluster, Caption, DiagramFrame } from "./_atoms";

/**
 * Lesson 4: 乳酸菌が逆効果になることもある
 * すでに過密な腸 + 乳酸菌追加 → さらにあふれる
 */
export function OvercrowdingIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="今のおなかに、もっと菌を入れると…" className={className}>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* いまの大腸（すでにあふれてる） */}
        <Slot
          tone="amber"
          label="いまの大腸"
          sublabel="すでに渋滞"
        >
          <BacteriaCluster count={32} tone="amber" size="xs" />
        </Slot>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-2xl">＋</span>
          <Caption tone="brand">乳酸菌</Caption>
        </div>

        {/* 追加で入れる乳酸菌 */}
        <Slot tone="brand" label="新しい菌" sublabel="善玉でも…">
          <BacteriaCluster count={9} tone="emerald" size="xs" />
        </Slot>
      </div>

      <div className="flex w-full items-center justify-center gap-1">
        <span className="h-px flex-1 bg-stone-300" />
        <span className="text-xs text-stone-500">となると</span>
        <span className="h-px flex-1 bg-stone-300" />
      </div>

      {/* 結果 */}
      <section className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Caption tone="muted">
            <span className="text-rose-700">結果</span>
          </Caption>
          <span className="text-base">💨 💨 💨</span>
        </div>
        <p className="mt-1 text-center text-sm leading-relaxed text-rose-800">
          菌どうしの大戦争で<br className="sm:hidden" />
          <span className="font-semibold">おなかがさらに張る</span>ことがあります
        </p>
      </section>

      <p className="px-3 text-center text-[11px] leading-relaxed text-stone-500">
        「腸にいいから」だけで足すのではなく、
        <span className="font-semibold text-brand-700">今の状態を知ってから</span>
        が安心です
      </p>
    </DiagramFrame>
  );
}

function Slot({
  tone,
  label,
  sublabel,
  children,
}: {
  tone: "amber" | "brand";
  label: string;
  sublabel: string;
  children: React.ReactNode;
}) {
  const cls = {
    amber: "border-amber-300 bg-amber-50",
    brand: "border-brand-200 bg-brand-50",
  }[tone];
  const labelCls = {
    amber: "text-amber-800",
    brand: "text-brand-700",
  }[tone];
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-2 ${cls}`}>
      <p className={`text-xs font-semibold ${labelCls}`}>{label}</p>
      {children}
      <p className="text-[10px] text-stone-500">{sublabel}</p>
    </div>
  );
}
