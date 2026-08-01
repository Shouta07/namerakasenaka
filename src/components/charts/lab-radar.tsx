"use client";

/**
 * 検査の到達率レーダー。サロン側とお客様側で同じ図形を使う。
 *
 * 配色は1色2段（前回=薄い破線・塗りなし / いま=濃い実線）。
 * before→after は識別ではなく同じ指標の推移なので、色相を変えず明度で分ける。
 * 線種と直接ラベルを併用し、色だけに頼らせない。値は必ず表かリストにも出す。
 */

export type LabRadarProps = {
  /** 軸のラベル（お客様に見せる言葉）。 */
  labels: string[];
  /** いまの到達率（0〜100）。labels と同じ順・同じ長さ。 */
  values: number[];
  /** 前回の到達率。渡すと破線で重ねる。 */
  compare?: number[];
  /** 直接ラベルを出す軸。押せるようにする場合は onSelect も渡す。 */
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  /** 濃い方（いま）と薄い方（前回）の色。 */
  color?: string;
  compareColor?: string;
  /** 軸ラベルの文字サイズ。スマホでは小さくする。 */
  labelSize?: number;
};

const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 100;
const LABEL_RATIO = 1.26;
// 斜めの軸ラベルは左右に長く出るため、viewBox を横に広げて逃がす。
const VB_X = -34;
const VB_W = SIZE + 68;

function point(i: number, total: number, ratio: number) {
  const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
  return {
    x: CX + Math.cos(angle) * R * ratio,
    y: CY + Math.sin(angle) * R * ratio,
  };
}

function polygon(values: number[]): string {
  return values
    .map((v, i) => {
      const p = point(i, values.length, Math.max(0, Math.min(100, v)) / 100);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

export function LabRadar({
  labels,
  values,
  compare,
  selectedIndex,
  onSelect,
  color = "#8c5a3c",
  compareColor = "#c89679",
  labelSize = 11,
}: LabRadarProps) {
  const n = labels.length;

  return (
    <svg
      viewBox={`${VB_X} 0 ${VB_W} ${SIZE}`}
      className="mx-auto block w-full max-w-[340px]"
      role="img"
      aria-label={labels.map((l, i) => `${l} ${values[i]}%`).join("、")}
    >
      {/* グリッド — 1px・ソリッド・控えめ */}
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={polygon(labels.map(() => g * 100))}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={1}
        />
      ))}
      {labels.map((l, i) => {
        const p = point(i, n, 1);
        return (
          <line
            key={l}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="#e7e5e4"
            strokeWidth={1}
          />
        );
      })}

      {/* 前回（薄い・破線）— 塗りは重ねない。2枚重ねると濁って読めなくなる */}
      {compare ? (
        <polygon
          points={polygon(compare)}
          fill="none"
          stroke={compareColor}
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />
      ) : null}

      {/* いま（濃い・実線） */}
      <polygon
        points={polygon(values)}
        fill={color}
        fillOpacity={0.1}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* 頂点 — 8px以上・サーフェス色の2pxリング */}
      {labels.map((l, i) => {
        const p = point(i, n, values[i] / 100);
        const on = i === selectedIndex;
        return (
          <g key={`v-${l}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={on ? 6 : 4.5}
              fill={color}
              stroke="#ffffff"
              strokeWidth={2}
            />
            {onSelect ? (
              // 当たり判定はマークより大きく
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onSelect(i)}
              >
                <title>{`${l}：${values[i]}%`}</title>
              </circle>
            ) : null}
            {on ? (
              <text
                // 頂点が外周に近いと軸ラベルと重なる。高い値は内側へ逃がす。
                x={p.x + (CX - p.x) * (values[i] >= 85 ? 0.14 : -0.14)}
                y={p.y + (CY - p.y) * (values[i] >= 85 ? 0.14 : -0.14)}
                textAnchor="middle"
                fontSize={11}
                fontWeight={800}
                fill="#1c1917"
                stroke="#ffffff"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {values[i]}%
              </text>
            ) : null}
          </g>
        );
      })}

      {/* 軸ラベル — テキストはテキスト色のまま */}
      {labels.map((l, i) => {
        const p = point(i, n, LABEL_RATIO);
        const on = i === selectedIndex;
        const dx = p.x - CX;
        const anchor = Math.abs(dx) < 8 ? "middle" : dx > 0 ? "start" : "end";
        return (
          <text
            key={`l-${l}`}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className={onSelect ? "cursor-pointer" : undefined}
            fontSize={on ? labelSize + 1 : labelSize}
            fontWeight={on ? 800 : 600}
            fill={on ? "#1c1917" : "#78716c"}
            onClick={onSelect ? () => onSelect(i) : undefined}
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}
