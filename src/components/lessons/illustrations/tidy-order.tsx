import { cn } from "@/lib/utils/cn";
import {
  C,
  SoftBg,
  DiagramTitle,
  FriendlyBacterium,
  SolidArrow,
  Footnote,
} from "./_svg";

/** ①②③ の番号バッジ。 */
function StageBadge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={C.brandDeep} />
      <text x={x} y={y} fontSize={11} fontWeight={800} fill="#fff" textAnchor="middle" dominantBaseline="central">
        {n}
      </text>
    </g>
  );
}

/** 腸のミニ器（ステージ共通の土台）。 */
function GutTray({ x, y, w = 88 }: { x: number; y: number; w?: number }) {
  return (
    <path
      d={`M ${x} ${y} q 0 -6 6 -6 L ${x + w - 6} ${y - 6} q 6 0 6 6 L ${x + w} ${y + 26} q 0 16 -16 16 L ${x + 16} ${y + 42} q -16 0 -16 -16 Z`}
      fill={C.cellFill}
      stroke={C.cellStroke}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  );
}

/**
 * Lesson 5 — まず「整える」順序（センターピース）。
 * ① ほうきで掃除 → ② エサ（種）を置く → ③ 菌を入れる。
 */
export function TidyOrderIllustration({ className }: { className?: string }) {
  const y = 150;
  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="腸を整える正しい順序：①掃除②エサ③菌の3段階の図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="green" />
      <DiagramTitle x={18} y={26} text="整える順序" />

      {/* ステージ① 掃除 */}
      <StageBadge x={28} y={64} n={1} />
      <text x={56} y={68} fontSize={9.5} fontWeight={700} fill={C.ink}>整える</text>
      <GutTray x={18} y={y} w={88} />
      {/* ほうき */}
      <g stroke="#9a6a3c" strokeWidth={2.4} strokeLinecap="round">
        <line x1={40} y1={120} x2={66} y2={150} />
      </g>
      <path d="M 60 148 q 12 4 18 14 q -14 4 -22 -4 Z" fill="#caa15f" stroke="#9a6a3c" strokeWidth={1} />
      {/* 掃いた跡 */}
      <path d="M 70 178 q 10 -4 20 0 M 74 184 q 8 -3 16 0" fill="none" stroke="#cbb79f" strokeWidth={1.2} strokeLinecap="round" />

      <SolidArrow x1={112} y1={y + 14} x2={132} y2={y + 14} />

      {/* ステージ② エサ */}
      <StageBadge x={144} y={64} n={2} />
      <text x={172} y={68} fontSize={9.5} fontWeight={700} fill={C.ink}>エサ</text>
      <GutTray x={134} y={y} w={88} />
      {/* 種をまく */}
      {[
        [150, 170],
        [164, 178],
        [180, 172],
        [196, 180],
        [206, 170],
        [172, 166],
      ].map(([sx, sy], i) => (
        <ellipse key={i} cx={sx} cy={sy} rx={3.4} ry={2.4} fill={C.seed} stroke="#a9823f" strokeWidth={0.7} transform={`rotate(28 ${sx} ${sy})`} />
      ))}
      <text x={178} y={206} fontSize={8} fill="#8a6a52" textAnchor="middle">菌のごはん</text>

      <SolidArrow x1={228} y1={y + 14} x2={248} y2={y + 14} />

      {/* ステージ③ 菌 */}
      <StageBadge x={260} y={64} n={3} />
      <text x={288} y={68} fontSize={9.5} fontWeight={700} fill={C.ink}>菌</text>
      <GutTray x={250} y={y} w={92} />
      <FriendlyBacterium x={272} y={172} r={11} />
      <FriendlyBacterium x={312} y={176} r={9} />
      <text x={296} y={206} fontSize={8} fill="#5d9a6e" textAnchor="middle">すこやかな菌</text>

      <Footnote x={18} y={288} text="掃除 → ごはん → 菌。この順番が、定着しやすい土台をつくります。" />
    </svg>
  );
}
