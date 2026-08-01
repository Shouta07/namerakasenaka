import type { LabRow } from "@/lib/accord/labtest-fixtures";

/**
 * 検査値そのものの位置を見せる帯。
 *
 * 「85%」だけでは何の話か分からない。実測値が、基準範囲のどこにいて、
 * 目安（適正範囲）に対してどちら側なのかを、1本の帯で示す。
 * 前回の位置も小さく残し、動いた向きが分かるようにする。
 */
export function LabValueBar({
  row,
  value,
  previous,
  accent = "#3c6347",
  band = "#cfe3cf",
}: {
  row: LabRow;
  value: number;
  previous?: number;
  accent?: string;
  band?: string;
}) {
  // 帯の左右は基準範囲。値がそこを外れることもあるので少し余白を足す。
  const pad = (row.refMax - row.refMin) * 0.08;
  const lo = Math.min(row.refMin - pad, value, previous ?? value);
  const hi = Math.max(row.refMax + pad, value, previous ?? value);
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;

  const optLeft = pos(Math.max(row.optMin, lo));
  const optWidth = Math.max(2, pos(Math.min(row.optMax, hi)) - optLeft);

  return (
    <div>
      <div className="relative h-9">
        {/* 基準範囲の帯 */}
        <div className="absolute inset-x-0 top-3 h-3 rounded-full bg-stone-100" />
        {/* 目安（適正範囲） */}
        <div
          className="absolute top-3 h-3 rounded-full"
          style={{ left: `${optLeft}%`, width: `${optWidth}%`, background: band }}
        />
        {/* 前回の位置 */}
        {previous != null && previous !== value ? (
          <div
            className="absolute top-2 h-5 w-0.5 -translate-x-1/2 rounded-full bg-stone-300"
            style={{ left: `${pos(previous)}%` }}
            aria-hidden
          />
        ) : null}
        {/* いまの位置 */}
        <div
          className="absolute top-1.5 h-6 w-1.5 -translate-x-1/2 rounded-full ring-2 ring-white"
          style={{ left: `${pos(value)}%`, background: accent }}
          aria-hidden
        />
      </div>
      {/* 目盛りは実際の位置に置く。帯が基準範囲より広がることがあるため、
          両端に並べるとラベルと位置がずれて誤読になる。 */}
      <div className="relative h-4 text-[10.5px] tabular-nums text-stone-400">
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${Math.min(92, Math.max(8, pos(row.refMin)))}%` }}
        >
          {row.refMin}
        </span>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap"
          style={{ left: `${Math.min(96, Math.max(4, pos(row.refMax)))}%` }}
        >
          {row.refMax}
        </span>
      </div>
      <p className="text-[10.5px] leading-relaxed text-stone-500">
        基準 {row.refMin}〜{row.refMax}
        {row.unit} ／{" "}
        <span className="font-semibold">
          目安 {row.optMin}〜{row.optMax}
          {row.unit}
        </span>
        （帯の濃い部分）
      </p>
    </div>
  );
}
