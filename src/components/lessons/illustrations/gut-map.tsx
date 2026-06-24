import { cn } from "@/lib/utils/cn";
import { C, SoftBg, DiagramTitle, LabelChip, Footnote } from "./_svg";

/**
 * Lesson 1 — おなかの地図。
 * 口 → 食道 → 胃 → 小腸 → 大腸 を連結した丸みのあるセグメントで描く。
 * 小腸は菌がまばら、大腸は密。茶色チップで「菌すくない」「菌のおうち」。
 */
export function GutMapIllustration({ className }: { className?: string }) {
  // 小腸（まばら）と大腸（密）の菌ドット。
  const sparse = [
    [150, 150],
    [180, 162],
    [210, 150],
  ];
  const dense: [number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    dense.push([
      250 + Math.cos(a * 3 + i) * (18 + (i % 3) * 8),
      210 + Math.sin(a * 2 + i) * (12 + (i % 4) * 6),
    ]);
  }

  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="口から大腸までの消化管と、小腸は菌が少なく大腸は菌が多い様子の図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="green" />
      <DiagramTitle x={18} y={26} text="おなかの地図" />

      {/* 口 */}
      <ellipse cx={42} cy={62} rx={16} ry={11} fill="#f6d9c2" stroke={C.cellStroke} strokeWidth={1.4} />
      <path d="M 34 62 q 8 7 16 0" fill="none" stroke="#c47d5a" strokeWidth={1.4} strokeLinecap="round" />
      <text x={42} y={42} fontSize={8.5} fontWeight={700} fill={C.ink} textAnchor="middle">口</text>

      {/* 食道 */}
      <path d="M 42 73 L 42 104" stroke={C.cellStroke} strokeWidth={10} strokeLinecap="round" />
      <text x={64} y={94} fontSize={8} fill={C.ink}>食道</text>

      {/* 胃 */}
      <path d="M 42 104 q -2 26 22 34 q 30 8 30 -16 q 0 -16 -16 -18 q -14 -2 -16 -8 Z" fill="#f8c9a3" stroke={C.cellStroke} strokeWidth={1.6} strokeLinejoin="round" />
      <text x={70} y={120} fontSize={8.5} fontWeight={700} fill={C.ink} textAnchor="middle">胃</text>

      {/* 小腸（くねった管） */}
      <path
        d="M 86 140 q 50 -6 70 18 q 18 22 -6 28 q -28 6 -2 24 q 28 18 64 4"
        fill="none"
        stroke={C.cellFill}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <path
        d="M 86 140 q 50 -6 70 18 q 18 22 -6 28 q -28 6 -2 24 q 28 18 64 4"
        fill="none"
        stroke={C.cellStroke}
        strokeWidth={16.5}
        strokeLinecap="round"
        opacity={0.18}
      />
      {sparse.map(([x, y], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r={2.6} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={0.7} />
      ))}

      {/* 大腸（太い額縁状） */}
      <path
        d="M 214 214 q -2 -34 36 -34 q 40 0 40 30 q 0 30 -36 30 q -26 0 -28 -8"
        fill="none"
        stroke={C.vessel}
        strokeWidth={24}
        strokeLinecap="round"
      />
      {dense.map(([x, y], i) => (
        <circle key={`d${i}`} cx={x} cy={y} r={2.4} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={0.6} />
      ))}

      {/* チップ */}
      <LabelChip x={150} y={108} text="小腸：菌すくない" anchor="middle" connectTo={{ x: 150, y: 150 }} />
      <LabelChip x={284} y={256} text="大腸：菌のおうち" anchor="end" connectTo={{ x: 256, y: 232 }} />

      <Footnote x={18} y={288} text="食べたものは口から大腸へ。菌の多くは大腸に暮らしています。" />
    </svg>
  );
}
