import { cn } from "@/lib/utils/cn";
import {
  C,
  SoftBg,
  DiagramTitle,
  LabelChip,
  EpithelialCells,
  FriendlyBacterium,
  SolidArrow,
  Footnote,
} from "./_svg";

/**
 * Lesson 6 — 酪酸菌 = 腸の修理屋さん。
 * 左: 損傷したタイトジャンクション。酪酸菌（ヘルメット）が修理 →
 * 右: ふさがった壁。before / after を1図で。
 */
export function ButyrateRepairIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="酪酸菌が腸の壁のすき間を修理してふさぐ図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="green" />
      <DiagramTitle x={18} y={26} text="酪酸菌は腸の壁の修理屋さん" />

      <text x={86} y={48} fontSize={9} fontWeight={700} fill={C.ink} textAnchor="middle">
        BEFORE
      </text>
      <text x={274} y={48} fontSize={9} fontWeight={700} fill="#5d9a6e" textAnchor="middle">
        AFTER
      </text>

      <LabelChip x={86} y={56} text="腸の壁（すき間）" anchor="middle" connectTo={{ x: 86, y: 96 }} />

      {/* BEFORE: すき間のある壁 */}
      <EpithelialCells x={18} y={94} w={138} h={44} count={4} gapIndex={1} />
      <circle cx={70} cy={88} r={2.4} fill={C.toxin} opacity={0.7} />
      <circle cx={66} cy={150} r={2} fill={C.toxin} opacity={0.5} />

      {/* 矢印（修理へ） */}
      <SolidArrow x1={166} y1={118} x2={196} y2={118} color={C.bacteriaEdge} />

      <LabelChip x={274} y={56} text="酪酸菌が修理" anchor="middle" connectTo={{ x: 274, y: 96 }} />

      {/* AFTER: ふさがった壁 */}
      <EpithelialCells x={204} y={94} w={138} h={44} count={4} />

      {/* 修理屋さん酪酸菌（壁の上で作業） */}
      <FriendlyBacterium x={236} y={172} r={13} helmet />
      <FriendlyBacterium x={290} y={178} r={10} helmet />
      <text x={264} y={202} fontSize={9} fontWeight={700} fill="#5d9a6e" textAnchor="middle">
        酪酸菌
      </text>

      {/* 細胞のごはん（酪酸）＝説明シール */}
      <rect x={36} y={196} width={120} height={58} rx={12} fill={C.paper} stroke="#cfe3d3" strokeWidth={1.4} />
      <text x={96} y={216} fontSize={9.5} fontWeight={700} fill={C.ink} textAnchor="middle">
        酪酸 = 細胞のごはん
      </text>
      <text x={96} y={234} fontSize={8} fill="#7a8a7e" textAnchor="middle">
        壁の細胞を内側から
      </text>
      <text x={96} y={246} fontSize={8} fill="#7a8a7e" textAnchor="middle">
        すこやかに保つ
      </text>

      <Footnote x={18} y={286} text="炎症をしずめ、腸の壁をやさしく守る働きが知られています。" />
    </svg>
  );
}
