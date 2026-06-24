import { cn } from "@/lib/utils/cn";
import {
  C,
  SoftBg,
  DiagramTitle,
  LabelChip,
  GasBubble,
  SolidArrow,
  Footnote,
} from "./_svg";

/**
 * Lesson 4 — 乳酸菌が逆効果になることもある。
 * すでに菌でいっぱいの腸 + 「+乳酸菌」を上から足す矢印 → ガスが増える。
 * 穏やかに（責めない）。チップ「まず今の腸を知る」。
 */
export function OvercrowdingIllustration({ className }: { className?: string }) {
  // すでに密な菌。
  const packed: [number, number][] = [];
  for (let i = 0; i < 18; i++) {
    const x = 70 + (i % 9) * 24;
    const y = 178 + (i < 9 ? 0 : 18);
    packed.push([x, y]);
  }

  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="すでに菌でいっぱいの腸に乳酸菌を足すとガスが増えやすいことを示す図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="足せばよい、とは限らない" />

      {/* +乳酸菌（上から足す） */}
      <g>
        <rect x={130} y={48} width={100} height={30} rx={15} fill={C.paper} stroke="#e7b9b9" strokeWidth={1.6} />
        <circle cx={150} cy={63} r={8} fill="#fbe9d6" stroke={C.cellStroke} strokeWidth={1.2} />
        <text x={150} y={63} fontSize={9} dominantBaseline="central" textAnchor="middle">＋</text>
        <text x={194} y={63} fontSize={9.5} fontWeight={700} fill={C.ink} textAnchor="middle">乳酸菌</text>
      </g>
      <SolidArrow x1={180} y1={82} x2={180} y2={154} color="#cf8f8f" />

      {/* 腸の器（すでに満員） */}
      <path
        d="M 50 150 q 0 -8 8 -8 L 302 142 q 8 0 8 8 L 318 196 q 0 28 -28 28 L 70 224 q -28 0 -28 -28 Z"
        fill={C.cellFill}
        stroke={C.cellStroke}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <text x={180} y={140} fontSize={8.5} fontWeight={700} fill={C.ink} textAnchor="middle">
        いまの腸（すでに満員）
      </text>

      {/* 密な菌 */}
      {packed.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={1} />
      ))}

      {/* 増えたガス（穏やか） */}
      <GasBubble x={64} y={150} r={6} />
      <GasBubble x={300} y={156} r={7} />
      <GasBubble x={296} y={134} r={5} />

      {/* チップ */}
      <LabelChip x={88} y={244} text="まず今の腸を知る" anchor="start" connectTo={{ x: 120, y: 224 }} />
      <LabelChip x={300} y={244} text="順番が大切" anchor="end" connectTo={{ x: 270, y: 224 }} />

      <Footnote x={18} y={288} text="良い菌でも、合うタイミングは人それぞれ。まず今の状態から。" />
    </svg>
  );
}
