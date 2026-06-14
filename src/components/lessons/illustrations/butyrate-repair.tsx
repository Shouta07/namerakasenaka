import { Caption, DiagramFrame } from "./_atoms";

/**
 * Lesson 6: 酪酸菌＝腸の修理屋さん
 * Before（ボロボロ）と After（修理済み）を並べる。
 */
export function ButyrateRepairIllustration({ className }: { className?: string }) {
  return (
    <DiagramFrame title="酪酸菌のおしごと" className={className}>
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Before */}
        <WallBox label="Before" tone="amber" wall="broken" />

        {/* 矢印 + 酪酸菌 */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">👷</span>
          <Caption tone="emerald">酪酸菌</Caption>
          <span className="text-xl">→</span>
        </div>

        {/* After */}
        <WallBox label="After" tone="emerald" wall="repaired" />
      </div>

      <section className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <Caption tone="emerald">酪酸菌がしてくれること</Caption>
        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-stone-700">
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span> 腸の炎症をしずめる
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span> 腸の壁を守る
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span> 腸の細胞のごはんになる
          </li>
        </ul>
      </section>

      <p className="px-3 text-center text-[11px] leading-relaxed text-stone-500">
        ただし、渋滞中の腸では酪酸菌も働きにくくなります。
        まず<span className="font-semibold text-brand-700">整える</span>のがやはり大切です。
      </p>
    </DiagramFrame>
  );
}

function WallBox({
  label,
  tone,
  wall,
}: {
  label: string;
  tone: "amber" | "emerald";
  wall: "broken" | "repaired";
}) {
  const cls = {
    amber: "border-amber-200 bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50",
  }[tone];
  const labelCls = {
    amber: "text-amber-800",
    emerald: "text-emerald-700",
  }[tone];

  // 5x4 ブリック
  const bricks = Array.from({ length: 20 });
  const broken = new Set([7, 8, 12]); // 一部欠ける位置
  return (
    <div className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-2 ${cls}`}>
      <p className={`text-xs font-semibold ${labelCls}`}>{label}</p>
      <div className="grid grid-cols-5 gap-0.5">
        {bricks.map((_, i) => {
          const isBroken = wall === "broken" && broken.has(i);
          return (
            <span
              key={i}
              className={
                "block h-2 w-3 rounded-sm " +
                (isBroken ? "bg-amber-200/50" : tone === "emerald" ? "bg-emerald-400" : "bg-amber-400")
              }
              aria-hidden
            />
          );
        })}
      </div>
      <p className="text-[10px] text-stone-500">
        {wall === "broken" ? "壁がボロボロ" : "整った壁"}
      </p>
    </div>
  );
}
