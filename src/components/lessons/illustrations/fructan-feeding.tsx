import { cn } from "@/lib/utils/cn";
import {
  C,
  SoftBg,
  DiagramTitle,
  LabelChip,
  GasBubble,
  DashedArrow,
  Footnote,
} from "./_svg";

/**
 * Lesson 3 — フルクタン。
 * 3段階の横フロー: 玉ねぎ/小麦 → 小腸「吸収されにくい」 → 大腸で菌が食べる + ガス。
 * ステージ間は破線矢印。食材は SVG で描く（絵文字なし）。
 */
export function FructanFeedingIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="フルクタンは小腸で吸収されにくく大腸で発酵してガスになる3段階の図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="フルクタンの旅" />

      {/* ステージ① 食材 */}
      <g>
        {/* 玉ねぎ */}
        <ellipse cx={52} cy={118} rx={20} ry={24} fill="#f2e3c8" stroke="#d8b97e" strokeWidth={1.4} />
        <path d="M 52 94 q -7 12 0 48 M 52 94 q 7 12 0 48 M 40 100 q 4 16 0 36 M 64 100 q -4 16 0 36" fill="none" stroke="#cfa75f" strokeWidth={1} />
        <path d="M 47 92 q 5 -8 10 0" fill="none" stroke="#9aa86a" strokeWidth={2} strokeLinecap="round" />
        {/* 小麦 */}
        <g stroke="#caa15f" strokeWidth={1.4} fill="#e7c885">
          <line x1={90} y1={94} x2={90} y2={142} stroke="#b88a3f" strokeWidth={1.6} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <ellipse cx={84} cy={102 + i * 11} rx={4.5} ry={3} transform={`rotate(-30 84 ${102 + i * 11})`} />
              <ellipse cx={96} cy={102 + i * 11} rx={4.5} ry={3} transform={`rotate(30 96 ${102 + i * 11})`} />
            </g>
          ))}
        </g>
        <text x={70} y={158} fontSize={8.5} fontWeight={700} fill={C.ink} textAnchor="middle">
          玉ねぎ・小麦
        </text>
      </g>

      <DashedArrow x1={114} y1={118} x2={138} y2={118} color={C.brand} />

      {/* ステージ② 小腸の箱 */}
      <g>
        <rect x={140} y={92} width={78} height={56} rx={14} fill={C.cellFill} stroke={C.cellStroke} strokeWidth={1.6} />
        <text x={179} y={114} fontSize={9} fontWeight={700} fill={C.ink} textAnchor="middle">
          小腸
        </text>
        <text x={179} y={130} fontSize={8} fill="#8a6a52" textAnchor="middle">
          吸収されにくい
        </text>
        {/* 素通りする粒 */}
        <circle cx={156} cy={140} r={2.4} fill={C.seed} />
        <circle cx={179} cy={142} r={2.4} fill={C.seed} />
        <circle cx={202} cy={140} r={2.4} fill={C.seed} />
        <text x={179} y={162} fontSize={8.5} fontWeight={700} fill={C.ink} textAnchor="middle">
          そのまま通過
        </text>
      </g>

      <DashedArrow x1={222} y1={118} x2={246} y2={118} color={C.brand} />

      {/* ステージ③ 大腸で菌が食べる + ガス */}
      <g>
        <rect x={248} y={92} width={92} height={56} rx={14} fill={C.vessel} stroke={C.vesselEdge} strokeWidth={1.6} />
        <text x={294} y={110} fontSize={9} fontWeight={700} fill="#b15b5b" textAnchor="middle">
          大腸
        </text>
        {/* 菌が食べる */}
        <circle cx={272} cy={130} r={5.4} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={1} />
        <circle cx={288} cy={134} r={5} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={1} />
        <circle cx={306} cy={130} r={5.4} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={1} />
        <circle cx={322} cy={134} r={4.6} fill={C.bacteria} stroke={C.bacteriaEdge} strokeWidth={1} />
        {/* 発酵ガス */}
        <GasBubble x={266} y={76} r={6} />
        <GasBubble x={296} y={66} r={8} />
        <GasBubble x={324} y={78} r={5} />
        <text x={294} y={166} fontSize={8.5} fontWeight={700} fill="#b15b5b" textAnchor="middle">
          菌のエサ → 発酵
        </text>
      </g>

      {/* チップ */}
      <LabelChip x={179} y={200} text="吸収されにくい" anchor="middle" connectTo={{ x: 179, y: 148 }} />
      <LabelChip x={294} y={228} text="発酵 → ガス" anchor="middle" connectTo={{ x: 296, y: 72 }} />

      <Footnote x={18} y={288} text="合う・合うかは人それぞれ。量や体調を見ながらやさしく試します。" />
    </svg>
  );
}
