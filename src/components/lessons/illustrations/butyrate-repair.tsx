import type { ReactNode } from "react";

/**
 * 🌱 Lesson 6 — 酪酸菌（修理屋さん）。
 *
 * 腸壁のレンガに一箇所ひびがあり、目が描かれた菌キャラ（酪酸菌）が修理中。
 * Before/After を左右でやんわり分ける。
 */
export function ButyrateRepairIllustration({ className }: { className?: string }) {
  // レンガの並び（左の Before, 右の After）
  const brickRows = [108, 124, 140, 156];
  function bricks(xBase: number, withCrack = false) {
    const rects: ReactNode[] = [];
    let key = 0;
    brickRows.forEach((y, r) => {
      const offset = r % 2 === 0 ? 0 : 12;
      for (let i = 0; i < 5; i++) {
        const x = xBase + i * 24 - offset;
        rects.push(
          <rect
            key={key++}
            x={x}
            y={y}
            width={22}
            height={14}
            rx={2}
            fill="#fff8ef"
            stroke="#7c5e3b"
            strokeWidth={1.2}
          />,
        );
      }
    });
    if (withCrack) {
      rects.push(
        <path
          key="crack"
          d={`M${xBase + 40} 116 L${xBase + 46} 124 L${xBase + 42} 132 L${xBase + 50} 142 L${xBase + 46} 152`}
          stroke="#c97a4d"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />,
      );
    }
    return rects;
  }

  return (
    <svg
      className={className}
      viewBox="0 0 360 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="酪酸菌が腸のかべを修理する図"
    >
      <rect width="360" height="200" fill="#fdf7f3" rx="14" />

      {/* Before キャプション */}
      <text x="20" y="36" fontSize="11" fill="#7c5e3b">ちょっとひび</text>
      {/* After キャプション */}
      <text x="230" y="36" fontSize="11" fill="#3c6347">修理ちゅう 🌱</text>

      {/* Before 壁（左） */}
      {bricks(16, true)}

      {/* 中央の仕切り */}
      <path d="M170 80 L170 184" stroke="#e7d7c5" strokeWidth="1.4" strokeDasharray="3 3" />

      {/* After 壁（右） — ひびなし */}
      {bricks(208, false)}

      {/* 酪酸菌キャラ — 大きな円に目と腕 */}
      <g transform="translate(112,170)">
        <circle r="22" fill="#5d8a6c" />
        {/* 目 */}
        <circle cx={-6} cy={-4} r={2.4} fill="#ffffff" />
        <circle cx={6} cy={-4} r={2.4} fill="#ffffff" />
        <circle cx={-6} cy={-4} r={1.2} fill="#1d3a26" />
        <circle cx={6} cy={-4} r={1.2} fill="#1d3a26" />
        {/* 口 */}
        <path d="M-5 4 Q0 8 5 4" stroke="#1d3a26" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* ハンマー */}
        <rect x={14} y={-22} width={4} height={16} fill="#7c5e3b" />
        <rect x={10} y={-26} width={12} height={6} rx={1} fill="#a5896b" />
      </g>

      <text x="92" y="206" fontSize="10" fill="#3c6347">酪酸菌</text>
    </svg>
  );
}
