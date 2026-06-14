import { Caption, DiagramFrame, VConnector } from "./_atoms";

/**
 * Lesson 7: なぜ背中に出るか — 腸 → 全身 → 背中
 */
export function InflammationFlowIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="腸と背中のつながり" className={className}>
      <FlowRow
        emoji="🌿"
        title="腸"
        body="炎症の火種が生まれる"
        tone="amber"
      />
      <VConnector />
      <FlowRow
        emoji="🫀"
        title="全身に広がる"
        body="血のめぐりにのって炎症が運ばれる"
        tone="amber"
      />
      <VConnector />
      <FlowRow
        emoji="🛡"
        title="命を守るところ優先"
        body="心臓・脳など、生きるために必要な場所へエネルギーが回る"
        tone="brand"
      />
      <VConnector />
      <FlowRow
        emoji="🌸"
        title="一番あとに肌"
        body="そのため、背中など肌に症状が出やすくなります"
        tone="emerald"
        emphasized
      />

      <p className="px-3 text-center text-[11px] leading-relaxed text-stone-500">
        だから、肌へのアプローチと同時に
        <span className="font-semibold text-brand-700">腸を整える</span>
        ことが、回り道のようでいて、一番の近道になります。
      </p>
    </DiagramFrame>
  );
}

function FlowRow({
  emoji,
  title,
  body,
  tone,
  emphasized,
}: {
  emoji: string;
  title: string;
  body: string;
  tone: "amber" | "brand" | "emerald";
  emphasized?: boolean;
}) {
  const cls = {
    amber: "border-amber-200 bg-amber-50",
    brand: "border-brand-200 bg-brand-50",
    emerald: "border-emerald-200 bg-emerald-50",
  }[tone];
  const captionTone = {
    amber: "muted",
    brand: "brand",
    emerald: "emerald",
  }[tone] as "muted" | "brand" | "emerald";
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 ${cls} ${emphasized ? "shadow-sm ring-1 ring-emerald-200" : ""}`}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="min-w-0 flex-1">
        <Caption tone={captionTone}>{title}</Caption>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-700">{body}</p>
      </div>
    </div>
  );
}
