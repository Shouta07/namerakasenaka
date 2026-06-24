/**
 * 図解の共通 SVG プリミティブ。
 *
 * 参考にしたのは、実臨床サイトの「リーキーガット」解説図のビジュアル言語:
 *  - 茶色の角丸ラベルチップ（白太字）＋細い引き出し線
 *  - 上皮細胞（桃色の円柱、暗いオーバル核、微絨毛のさざ波）の列
 *  - ピンクの血管バンド
 *  - 種類ごとに色と形をもつ粒子（毒素 / アレルゲン / 異物 / 病原細胞）
 *  - 流れを示す破線矢印・「全身へ ▶」矢印
 *
 * すべて親 <svg> の中で使う <g>/フラグメントを返す。
 * クライアントフック無し（Server-renderable）。
 *
 * 座標系: 各イラストは viewBox="0 0 360 300" を基準にする。
 */

/** ブランドのあたたかいパレット ＋ 4種の粒子色。 */
export const C = {
  cellFill: "#f6cda9",
  cellStroke: "#e3a980",
  nucleus: "#d98a66",
  vessel: "#f6b3b3",
  vesselEdge: "#ef9a9a",
  toxin: "#7c5cb0",
  allergen: "#eec23a",
  foreign: "#6b7280",
  pathogen: "#d94f4f",
  chip: "#8c7a6a",
  chipText: "#ffffff",
  ink: "#5b4636",
  line: "#b8a594",
  bgCream: "#fdf7f3",
  bgGreen: "#eef6ee",
  // 補助色（ブランド連動）。
  brand: "#c89679",
  brandDeep: "#8c5a3c",
  bacteria: "#7bb88a",
  bacteriaEdge: "#5d9a6e",
  gas: "#dfeee6",
  gasEdge: "#bcd8c4",
  seed: "#caa15f",
  paper: "#ffffff",
} as const;

/** 全角＝1.0、半角＝0.55 でおおよその文字幅を見積もる（チップ自動幅）。 */
function approxTextWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    units += ch.charCodeAt(0) > 0x2e80 ? 1 : 0.56;
  }
  return units * fontSize;
}

/**
 * やわらかい角丸の背景レクト。ブランドのクリーム or グリーンで淡く敷く。
 */
export function SoftBg({
  tone = "cream",
  w = 360,
  h = 300,
}: {
  tone?: "cream" | "green";
  w?: number;
  h?: number;
}) {
  return (
    <rect
      x={2}
      y={2}
      width={w - 4}
      height={h - 4}
      rx={22}
      fill={tone === "green" ? C.bgGreen : C.bgCream}
      stroke="#efe2d6"
      strokeWidth={1.5}
    />
  );
}

/**
 * 茶色の角丸ラベルチップ。白太字・テキスト長で自動幅。
 * `connectTo` を渡すと、チップ端から対象点へ細い引き出し線＋小さな丸を描く。
 */
export function LabelChip({
  x,
  y,
  text,
  anchor = "middle",
  fontSize = 9,
  connectTo,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  fontSize?: number;
  connectTo?: { x: number; y: number };
}) {
  const padX = 7;
  const padY = 4.5;
  const w = approxTextWidth(text, fontSize) + padX * 2;
  const h = fontSize + padY * 2;
  // x,y はアンカーに応じてチップの基準点（中央上端 or 端上端）。
  const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const top = y;
  const cx = left + w / 2;

  // 引き出し線: チップ下端中央 → connectTo。
  const lineStartX = cx;
  const lineStartY = top + h;

  return (
    <g>
      {connectTo ? (
        <g>
          <line
            x1={lineStartX}
            y1={lineStartY}
            x2={connectTo.x}
            y2={connectTo.y}
            stroke={C.line}
            strokeWidth={1}
          />
          <circle cx={connectTo.x} cy={connectTo.y} r={1.8} fill={C.line} />
        </g>
      ) : null}
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={h / 2.4}
        fill={C.chip}
      />
      <text
        x={cx}
        y={top + h / 2}
        fontSize={fontSize}
        fontWeight={700}
        fill={C.chipText}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {text}
      </text>
    </g>
  );
}

/** 1 つの円柱状上皮細胞（桃色・暗い核・微絨毛のさざ波トップ）。 */
function Columnar({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  // 微絨毛: 細胞の上端に小さな半円のさざ波を並べる。
  const bumps = 4;
  const bw = w / bumps;
  let top = `M ${x} ${y}`;
  for (let i = 0; i < bumps; i++) {
    top += ` q ${bw / 2} ${-5} ${bw} 0`;
  }
  // 本体: さざ波トップ → 右辺 → 角丸下端 → 左辺。
  const body = `${top} L ${x + w} ${y + h - 6} q 0 6 -6 6 L ${x + 6} ${y + h} q -6 0 -6 -6 Z`;
  return (
    <g>
      <path d={body} fill={C.cellFill} stroke={C.cellStroke} strokeWidth={1.4} strokeLinejoin="round" />
      <ellipse cx={x + w / 2} cy={y + h * 0.58} rx={w * 0.26} ry={h * 0.16} fill={C.nucleus} opacity={0.92} />
    </g>
  );
}

/**
 * 円柱上皮細胞の列。`gapIndex` の位置で密着結合のすき間を広げる
 *（＝損傷したタイトジャンクション）。
 * 返り値の helper（gapX）は呼び出し側で粒子の落下位置に使える。
 */
export function EpithelialCells({
  x,
  y,
  count,
  w = 200,
  h = 46,
  gapIndex,
}: {
  x: number;
  y: number;
  count: number;
  w?: number;
  h?: number;
  gapIndex?: number;
}) {
  const normalGap = 3;
  const wideGap = 13;
  const hasGap = gapIndex != null && gapIndex >= 0 && gapIndex < count - 1;
  // すき間ぶんを差し引いて細胞幅を決める。
  const totalGaps = (count - 1) * normalGap + (hasGap ? wideGap - normalGap : 0);
  const cellW = (w - totalGaps) / count;

  const cells: { cx: number }[] = [];
  let cursor = x;
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(<Columnar key={i} x={cursor} y={y} w={cellW} h={h} />);
    cells.push({ cx: cursor + cellW / 2 });
    const gap = hasGap && i === gapIndex ? wideGap : normalGap;
    cursor += cellW + gap;
  }

  // タイトジャンクション: 隣接細胞の上端のあいだに小さなくさび。
  const junctions = [];
  for (let i = 0; i < count - 1; i++) {
    const a = cells[i].cx + cellW / 2;
    const isGap = hasGap && i === gapIndex;
    if (!isGap) {
      junctions.push(
        <rect
          key={`j${i}`}
          x={a + (normalGap - 2) / 2}
          y={y - 1}
          width={2}
          height={7}
          rx={1}
          fill={C.brandDeep}
          opacity={0.55}
        />,
      );
    }
  }

  return <g>{nodes}{junctions}</g>;
}

/** ピンクの血管バンド（横長）＋ラベル。 */
export function Vessel({
  x,
  y,
  w,
  h = 30,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.vessel} stroke={C.vesselEdge} strokeWidth={1.4} />
      {/* 中の血流ハイライト */}
      <rect x={x + 6} y={y + h * 0.28} width={w - 12} height={h * 0.18} rx={h * 0.09} fill="#ffffff" opacity={0.35} />
      {label ? (
        <text
          x={x + 10}
          y={y + h / 2}
          fontSize={9}
          fontWeight={700}
          fill="#b15b5b"
          dominantBaseline="central"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

export type ParticleKind = "toxin" | "allergen" | "foreign" | "pathogen";

/** 種類別の粒子。毒素＝紫トゲ / アレルゲン＝黄ドット群 / 異物＝灰ロッド / 病原細胞＝赤いびつ。 */
export function Particle({
  x,
  y,
  kind,
  scale = 1,
}: {
  x: number;
  y: number;
  kind: ParticleKind;
  scale?: number;
}) {
  if (kind === "toxin") {
    // 紫のトゲトゲ blob（星形）。
    const spikes = 9;
    const r1 = 7 * scale;
    const r2 = 3.4 * scale;
    let d = "";
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? r1 : r2;
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      d += `${i === 0 ? "M" : "L"} ${(x + Math.cos(a) * r).toFixed(2)} ${(y + Math.sin(a) * r).toFixed(2)} `;
    }
    d += "Z";
    return <path d={d} fill={C.toxin} stroke="#5e43a0" strokeWidth={0.8} />;
  }
  if (kind === "allergen") {
    // 黄ドットのクラスタ。
    const pts = [
      [0, -3],
      [-4, 1],
      [4, 1],
      [-1.5, 4.5],
      [2.5, 4],
    ];
    return (
      <g>
        {pts.map(([dx, dy], i) => (
          <circle key={i} cx={x + dx * scale} cy={y + dy * scale} r={2.6 * scale} fill={C.allergen} stroke="#caa01f" strokeWidth={0.6} />
        ))}
      </g>
    );
  }
  if (kind === "foreign") {
    // 灰色のロッド（棒）2 本。
    return (
      <g stroke="#4b5563" strokeWidth={0.7}>
        <rect x={x - 6 * scale} y={y - 2 * scale} width={10 * scale} height={4 * scale} rx={2 * scale} fill={C.foreign} transform={`rotate(-22 ${x} ${y})`} />
        <rect x={x - 1 * scale} y={y - 1 * scale} width={9 * scale} height={3.4 * scale} rx={1.7 * scale} fill={C.foreign} transform={`rotate(28 ${x} ${y})`} />
      </g>
    );
  }
  // pathogen: 赤いびつ blob。
  const d = `M ${x - 6 * scale} ${y} q -1 -6 5 -6.5 q 6 -0.5 7 5 q 1 6 -4 7 q -7 1.5 -8 -5.5 Z`;
  return <path d={d} fill={C.pathogen} stroke="#b73c3c" strokeWidth={0.8} />;
}

/** 破線の流れ矢印（矢じり付き）。 */
export function DashedArrow({
  x1,
  y1,
  x2,
  y2,
  color = C.line,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ah = 5;
  const a1x = x2 - ah * Math.cos(ang - Math.PI / 6);
  const a1y = y2 - ah * Math.sin(ang - Math.PI / 6);
  const a2x = x2 - ah * Math.cos(ang + Math.PI / 6);
  const a2y = y2 - ah * Math.sin(ang + Math.PI / 6);
  return (
    <g stroke={color}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.4} strokeDasharray="4 3" strokeLinecap="round" />
      <polyline points={`${a1x},${a1y} ${x2},${y2} ${a2x},${a2y}`} fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** 実線の流れ矢印（ステージ間など）。 */
export function SolidArrow({
  x1,
  y1,
  x2,
  y2,
  color = C.brand,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ah = 6;
  const a1x = x2 - ah * Math.cos(ang - Math.PI / 6);
  const a1y = y2 - ah * Math.sin(ang - Math.PI / 6);
  const a2x = x2 - ah * Math.cos(ang + Math.PI / 6);
  const a2y = y2 - ah * Math.sin(ang + Math.PI / 6);
  return (
    <g stroke={color}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} strokeLinecap="round" />
      <polyline points={`${a1x},${a1y} ${x2},${y2} ${a2x},${a2y}`} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** 「全身へ ▶」スタイルの太い流れ矢印（ラベル付き）。 */
export function FlowArrow({
  x,
  y,
  label = "全身へ",
  w = 46,
}: {
  x: number;
  y: number;
  label?: string;
  w?: number;
}) {
  const h = 18;
  const tip = 9;
  const d = `M ${x} ${y - h / 2} L ${x + w} ${y - h / 2} L ${x + w + tip} ${y} L ${x + w} ${y + h / 2} L ${x} ${y + h / 2} Z`;
  return (
    <g>
      <path d={d} fill={C.brand} opacity={0.92} />
      <text x={x + w / 2} y={y} fontSize={8.5} fontWeight={700} fill="#fff" textAnchor="middle" dominantBaseline="central">
        {label}
      </text>
    </g>
  );
}

/** 図のタイトル（太字・インク色）。 */
export function DiagramTitle({
  x,
  y,
  text,
  anchor = "start",
  fontSize = 13,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  fontSize?: number;
}) {
  return (
    <text x={x} y={y} fontSize={fontSize} fontWeight={800} fill={C.ink} textAnchor={anchor}>
      {text}
    </text>
  );
}

/** 小さな脚注テキスト。 */
export function Footnote({
  x,
  y,
  text,
  anchor = "start",
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} fontSize={8} fill="#9a8c7d" textAnchor={anchor}>
      {text}
    </text>
  );
}

/** 友好的な丸い細菌（任意でヘルメット＝修理屋さん）。 */
export function FriendlyBacterium({
  x,
  y,
  r = 11,
  fill = C.bacteria,
  edge = C.bacteriaEdge,
  helmet = false,
}: {
  x: number;
  y: number;
  r?: number;
  fill?: string;
  edge?: string;
  helmet?: boolean;
}) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.86} fill={fill} stroke={edge} strokeWidth={1.3} />
      {/* 線毛 */}
      <g stroke={edge} strokeWidth={1} strokeLinecap="round">
        <line x1={x - r} y1={y} x2={x - r - 4} y2={y - 2} />
        <line x1={x + r} y1={y} x2={x + r + 4} y2={y + 2} />
        <line x1={x} y1={y + r * 0.86} x2={x + 2} y2={y + r + 3} />
      </g>
      {/* 目 */}
      <circle cx={x - r * 0.32} cy={y - 1} r={1.5} fill="#3c4a3f" />
      <circle cx={x + r * 0.32} cy={y - 1} r={1.5} fill="#3c4a3f" />
      {/* 笑み */}
      <path d={`M ${x - r * 0.34} ${y + r * 0.3} q ${r * 0.34} ${r * 0.32} ${r * 0.68} 0`} fill="none" stroke="#3c4a3f" strokeWidth={1} strokeLinecap="round" />
      {helmet ? (
        <g>
          <path d={`M ${x - r - 1} ${y - r * 0.5} a ${r + 1} ${r + 1} 0 0 1 ${(r + 1) * 2} 0 Z`} fill="#f0b429" stroke="#cf9a18" strokeWidth={1} />
          <rect x={x - r - 3} y={y - r * 0.5 - 1.5} width={(r + 3) * 2} height={3} rx={1.5} fill="#f0b429" stroke="#cf9a18" strokeWidth={0.8} />
        </g>
      ) : null}
    </g>
  );
}

/** ガスの泡（やわらかい円）。 */
export function GasBubble({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.gas} stroke={C.gasEdge} strokeWidth={1} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill="#ffffff" opacity={0.7} />
    </g>
  );
}
