/**
 * プランの「選べる4テーマ（パーツ）」アイコン図。
 *
 * 医療連携（腸）を軸に、食事 / スキンケア / 運動 へ広がる。
 * lessons/illustrations と同じあたたかい臨床パレットで、
 * カード内に置けるアイコン規模の SVG（タイトル文字は持たない）。
 *
 * すべて Server-renderable。viewBox は 220x150 共通。
 */
import { C } from "../lessons/illustrations/_svg";

const STROKE = C.cellStroke;
const DEEP = C.brandDeep;
const GREEN = C.bacteria;
const GREEN_EDGE = C.bacteriaEdge;

function Card({
  tone,
  children,
  label,
}: {
  tone: "cream" | "green" | "pink" | "sky";
  children: React.ReactNode;
  label: string;
}) {
  const bg = {
    cream: "#fdf7f3",
    green: "#eef6ee",
    pink: "#fdeef0",
    sky: "#eef3f8",
  }[tone];
  return (
    <svg viewBox="0 0 220 150" className="w-full h-auto" role="img" aria-label={label}>
      <rect x={2} y={2} width={216} height={146} rx={18} fill={bg} stroke="#efe2d6" strokeWidth={1.4} />
      {children}
    </svg>
  );
}

/* ── 医療連携（腸）— 軸 ───────────────────────────────── */
export function PillarGut() {
  return (
    <Card tone="green" label="医療連携（腸）のテーマを表すアイコン図">
      {/* 腸のコイル */}
      <path
        d="M 60 96 q -22 0 -22 -18 q 0 -18 22 -18 l 50 0 q 18 0 18 16 q 0 16 -18 16 l -34 0 q -12 0 -12 10 q 0 10 12 10 l 56 0"
        fill="none"
        stroke={C.cellFill}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 60 96 q -22 0 -22 -18 q 0 -18 22 -18 l 50 0 q 18 0 18 16 q 0 16 -18 16 l -34 0 q -12 0 -12 10 q 0 10 12 10 l 56 0"
        fill="none"
        stroke={STROKE}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
      {/* なかの善玉菌 */}
      <ellipse cx={72} cy={78} rx={6} ry={5} fill={GREEN} stroke={GREEN_EDGE} strokeWidth={1} />
      <ellipse cx={96} cy={78} rx={5} ry={4} fill={GREEN} stroke={GREEN_EDGE} strokeWidth={1} />
      {/* 医療連携: クリニックの十字バッジ + 破線リンク */}
      <line x1={150} y1={56} x2={132} y2={84} stroke={DEEP} strokeWidth={1.4} strokeDasharray="4 3" />
      <circle cx={160} cy={48} r={20} fill="#fff" stroke={DEEP} strokeWidth={2} />
      <g fill={DEEP}>
        <rect x={156} y={40} width={8} height={16} rx={2} />
        <rect x={152} y={44} width={16} height={8} rx={2} />
      </g>
      <text x={110} y={128} fontSize={11} fontWeight={800} fill={DEEP} textAnchor="middle">
        腸 × クリニック監修
      </text>
    </Card>
  );
}

/* ── 食事 ─────────────────────────────────────────────── */
export function PillarDiet() {
  return (
    <Card tone="cream" label="食事のテーマを表すアイコン図">
      {/* お皿 */}
      <ellipse cx={92} cy={86} rx={58} ry={15} fill="#e9d8c0" />
      <ellipse cx={92} cy={82} rx={50} ry={13} fill="#fff7eb" stroke={STROKE} strokeWidth={1.2} />
      {/* 発酵食品・繊維 */}
      <ellipse cx={74} cy={78} rx={12} ry={8} fill="#e7c089" stroke="#c79658" strokeWidth={0.9} />
      <ellipse cx={104} cy={78} rx={9} ry={7} fill="#fff" stroke="#cbb79f" strokeWidth={0.9} />
      <circle cx={104} cy={77} r={3.4} fill="#f1c34a" />
      {/* 葉物（食物繊維） */}
      <path d="M 120 74 q 10 -10 18 -4 q -4 12 -18 8 Z" fill={GREEN} stroke={GREEN_EDGE} strokeWidth={1} />
      <path d="M 120 74 q 0 -6 6 -10" fill="none" stroke={GREEN_EDGE} strokeWidth={0.8} />
      {/* 湯気 */}
      <path d="M 80 60 q -4 -6 0 -12 M 92 58 q -4 -6 0 -12" fill="none" stroke="#cbb79f" strokeWidth={1.4} strokeLinecap="round" />
      <text x={110} y={128} fontSize={11} fontWeight={800} fill={DEEP} textAnchor="middle">
        腸を整える食事
      </text>
    </Card>
  );
}

/* ── スキンケア ───────────────────────────────────────── */
export function PillarSkincare() {
  return (
    <Card tone="pink" label="スキンケアのテーマを表すアイコン図">
      {/* 背中シルエット（肩 + 背骨） */}
      <path
        d="M 72 108 q 6 -46 38 -46 q 32 0 38 46 Z"
        fill={C.cellFill}
        stroke={STROKE}
        strokeWidth={1.4}
        strokeLinejoin="round"
        opacity={0.92}
      />
      {/* 背骨 */}
      <g fill={C.nucleus} opacity={0.8}>
        {[74, 84, 94, 104].map((y, i) => (
          <ellipse key={i} cx={110} cy={y} rx={3} ry={2.4} />
        ))}
      </g>
      {/* ケアのしずく */}
      <path d="M 150 64 q 8 10 0 18 q -8 -8 0 -18 Z" fill={C.vessel} stroke={C.vesselEdge} strokeWidth={1.2} />
      {/* きらめき（清潔） */}
      <g fill="#f0b429">
        <path d="M 70 56 l 1.6 4 l 4 1.6 l -4 1.6 l -1.6 4 l -1.6 -4 l -4 -1.6 l 4 -1.6 Z" />
        <path d="M 150 96 l 1.2 3 l 3 1.2 l -3 1.2 l -1.2 3 l -1.2 -3 l -3 -1.2 l 3 -1.2 Z" />
      </g>
      <text x={110} y={128} fontSize={11} fontWeight={800} fill={DEEP} textAnchor="middle">
        背中のスキンケア
      </text>
    </Card>
  );
}

/* ── 運動 ─────────────────────────────────────────────── */
export function PillarExercise() {
  return (
    <Card tone="sky" label="運動のテーマを表すアイコン図">
      {/* ストレッチする人 */}
      <g stroke={DEEP} strokeWidth={5} strokeLinecap="round" fill="none">
        {/* 胴 */}
        <line x1={108} y1={62} x2={106} y2={92} />
        {/* 腕（上に伸ばす） */}
        <path d="M 107 70 q -16 -8 -22 -22" />
        <path d="M 107 70 q 16 -8 22 -22" />
        {/* 脚 */}
        <path d="M 106 92 q -2 16 -14 24" />
        <path d="M 106 92 q 2 16 14 24" />
      </g>
      {/* 頭 */}
      <circle cx={108} cy={52} r={9} fill={C.cellFill} stroke={STROKE} strokeWidth={1.4} />
      {/* 動きのアーク */}
      <path d="M 64 60 q -8 30 10 52" fill="none" stroke={GREEN_EDGE} strokeWidth={2} strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M 156 60 q 8 30 -10 52" fill="none" stroke={GREEN_EDGE} strokeWidth={2} strokeDasharray="3 4" strokeLinecap="round" />
      <text x={110} y={130} fontSize={11} fontWeight={800} fill={DEEP} textAnchor="middle">
        めぐりを促す運動
      </text>
    </Card>
  );
}
