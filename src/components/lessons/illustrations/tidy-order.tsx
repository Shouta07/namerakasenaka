import { Caption, DiagramFrame, VConnector } from "./_atoms";

/**
 * Lesson 5: まず「整える」順序
 * ① 整える → ② エサ → ③ 菌
 */
export function TidyOrderIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="腸を整える 3 ステップ" className={className}>
      <Step
        number="①"
        emoji="🧹"
        title="整える"
        body="渋滞を解消するところからスタート"
        tone="brand"
      />
      <VConnector />
      <Step
        number="②"
        emoji="🌾"
        title="エサを入れる"
        body="今いる善玉菌をやさしくサポート"
        tone="amber"
      />
      <VConnector />
      <Step
        number="③"
        emoji="🦠"
        title="菌を入れる"
        body="自分に合う菌を、必要な分だけ"
        tone="emerald"
      />

      <p className="px-3 text-center text-[11px] leading-relaxed text-stone-500">
        順番を変えると、せっかくの努力がすれ違ってしまうことがあります。
      </p>
    </DiagramFrame>
  );
}

function Step({
  number,
  emoji,
  title,
  body,
  tone,
}: {
  number: string;
  emoji: string;
  title: string;
  body: string;
  tone: "brand" | "amber" | "emerald";
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
  const numberCls = {
    brand: "text-brand-700 bg-white border-brand-200",
    amber: "text-amber-800 bg-white border-amber-200",
    emerald: "text-emerald-700 bg-white border-emerald-200",
  }[tone];
  return (
    <div
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 ${cls}`}
    >
      <span
        className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border text-sm font-bold ${numberCls}`}
      >
        {number}
      </span>
      <div className="flex flex-1 items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <Caption tone={captionTone}>{title}</Caption>
          <p className="mt-0.5 text-[11px] leading-relaxed text-stone-700">{body}</p>
        </div>
      </div>
    </div>
  );
}
