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
 * Lesson 2 — 菌の渋滞 (SIBO)。
 * 小腸の管に菌が多すぎて詰まり、ガスの泡が立ちのぼる。
 * 大腸 → 小腸への逆流矢印で「逆流」を表す。
 */
export function SiboTrafficIllustration({ className }: { className?: string }) {
  // 小腸の管の中心線に沿って菌を密に詰める。
  const tubeY = 150;
  const crowd: [number, number][] = [];
  for (let i = 0; i < 22; i++) {
    const x = 60 + (i % 11) * 22;
    const y = tubeY - 8 + (i < 11 ? -4 : 8) + (i % 3) * 3;
    crowd.push([x, y]);
  }

  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="小腸に菌が増えすぎて渋滞し、ガスが発生し大腸から逆流する図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="菌の渋滞（SIBO）" />

      {/* 小腸の管 */}
      <rect x={48} y={tubeY - 22} width={222} height={44} rx={22} fill={C.cellFill} stroke={C.cellStroke} strokeWidth={1.6} />
      <rect x={54} y={tubeY - 16} width={210} height={10} rx={5} fill="#ffffff" opacity={0.3} />
      <text x={159} y={tubeY + 38} fontSize={9} fontWeight={700} fill={C.ink} textAnchor="middle">
        小腸
      </text>

      {/* 詰まった菌 */}
      {crowd.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5.4} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={1} />
      ))}

      {/* ガスの泡（立ちのぼる） */}
      <GasBubble x={90} y={108} r={7} />
      <GasBubble x={150} y={96} r={9} />
      <GasBubble x={206} y={104} r={6} />
      <GasBubble x={130} y={78} r={5} />
      <GasBubble x={178} y={80} r={6} />

      {/* 大腸（右の塊） */}
      <path
        d="M 286 150 q 22 -2 22 -30 q 0 -22 -24 -22"
        fill="none"
        stroke={C.vessel}
        strokeWidth={22}
        strokeLinecap="round"
      />
      <text x={308} y={150} fontSize={8.5} fontWeight={700} fill="#b15b5b" textAnchor="middle">
        大腸
      </text>

      {/* 逆流矢印（大腸 → 小腸） */}
      <SolidArrow x1={282} y1={172} x2={222} y2={186} color={C.brandDeep} />
      <text x={250} y={204} fontSize={8} fontWeight={700} fill={C.brandDeep} textAnchor="middle">
        逆流
      </text>

      {/* チップ */}
      <LabelChip x={150} y={48} text="菌が増えすぎ" anchor="middle" connectTo={{ x: 150, y: 130 }} />
      <LabelChip x={64} y={222} text="ガス発生" anchor="start" connectTo={{ x: 90, y: 116 }} />

      <Footnote x={18} y={288} text="本来は菌の少ない小腸で菌が増えると、ガスや張りにつながります。" />
    </svg>
  );
}
