import { cn } from "@/lib/utils/cn";
import {
  C,
  SoftBg,
  DiagramTitle,
  LabelChip,
  EpithelialCells,
  Vessel,
  Particle,
  DashedArrow,
  FlowArrow,
  Footnote,
} from "./_svg";

/**
 * Lesson 7 — 腸 → 全身 → 背中とのつながり（フラッグシップ）。
 *
 * 参考の「リーキーガット」図に最も近づける:
 *  - 上皮細胞の列に、損傷したタイトジャンクション（すき間）
 *  - すき間から落ちる4種の粒子（毒素 / アレルゲン / 異物 / 病原細胞）
 *  - 下のピンク血管バンドへ破線矢印で流入 →「全身へ ▶」
 *  - さらに肌（背中）へ届く流れと、肌は最後にケアが回るという穏やかな注記
 */
export function InflammationFlowIllustration({ className }: { className?: string }) {
  // すき間の中心 x（細胞列は x=22, w=210, count=6, gapIndex=2 想定）。
  const gapX = 22 + 210 * 0.42;

  return (
    <svg
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="腸の壁のすき間から毒素や異物が血管へ入り、全身そして肌へ届く図"
      className={cn("w-full h-auto", className)}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="腸の壁から全身、そして肌へ" />

      {/* 粒子のソース（上部に種類別チップ） */}
      <LabelChip x={48} y={36} text="毒素" connectTo={{ x: 48, y: 86 }} />
      <LabelChip x={120} y={36} text="アレルゲン" connectTo={{ x: 120, y: 86 }} />
      <LabelChip x={200} y={36} text="異物" connectTo={{ x: 200, y: 86 }} />
      <LabelChip x={272} y={36} text="病原細胞" connectTo={{ x: 272, y: 86 }} />

      {/* 粒子（壁の上） */}
      <Particle x={48} y={92} kind="toxin" />
      <Particle x={120} y={92} kind="allergen" />
      <Particle x={200} y={92} kind="foreign" />
      <Particle x={272} y={92} kind="pathogen" />

      {/* 健全なタイトジャンクションのチップ */}
      <LabelChip x={250} y={150} text="タイトジャンクション" anchor="middle" connectTo={{ x: 200, y: 168 }} />

      {/* 損傷したタイトジャンクションのチップ */}
      <LabelChip x={92} y={150} text="損傷したタイトジャンクション" anchor="middle" connectTo={{ x: gapX, y: 168 }} />

      {/* 上皮細胞の列（gapIndex=2 ですき間） */}
      <EpithelialCells x={22} y={166} w={210} h={44} count={6} gapIndex={2} />

      {/* すき間を通って血管へ落ちる破線矢印（毒素・異物が中心） */}
      <DashedArrow x1={48} y1={100} x2={gapX - 6} y2={232} />
      <DashedArrow x1={200} y1={100} x2={gapX + 6} y2={232} />
      <DashedArrow x1={120} y1={100} x2={gapX} y2={232} />

      {/* すき間を抜けた粒子（血管手前） */}
      <Particle x={gapX - 6} y={224} kind="toxin" scale={0.85} />
      <Particle x={gapX + 8} y={222} kind="foreign" scale={0.85} />

      {/* 血管バンド */}
      <Vessel x={22} y={236} w={258} h={28} label="血管" />
      {/* 血管内に入った粒子 */}
      <Particle x={70} y={250} kind="allergen" scale={0.7} />
      <Particle x={110} y={250} kind="pathogen" scale={0.75} />
      <Particle x={150} y={250} kind="toxin" scale={0.7} />

      {/* 全身へ ▶ */}
      <FlowArrow x={286} y={250} label="全身へ" w={42} />

      {/* 肌（背中）へ届く流れ */}
      <g>
        {/* 背中シルエット（簡略） */}
        <path
          d="M 312 110 q 14 -10 24 2 q 6 8 4 22 q -1 16 -3 30 q -2 10 -12 10 q -10 0 -12 -10 q -3 -16 -4 -30 q -2 -14 3 -24 Z"
          fill="#f3d9c6"
          stroke={C.cellStroke}
          strokeWidth={1.2}
        />
        {/* 肌トラブルの小さな点（赤を最小限に） */}
        <circle cx={322} cy={150} r={2} fill={C.pathogen} opacity={0.7} />
        <circle cx={328} cy={162} r={1.6} fill={C.pathogen} opacity={0.6} />
        <DashedArrow x1={300} y1={236} x2={318} y2={186} color={C.brand} />
      </g>
      <LabelChip x={324} y={92} text="肌・背中" anchor="middle" connectTo={{ x: 324, y: 110 }} />

      <Footnote x={18} y={288} text="肌は後まわしにされやすい器官。腸から順にやさしく届けます。" />
    </svg>
  );
}
