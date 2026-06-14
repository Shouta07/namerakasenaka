/**
 * 🛠 Lesson 5 — まず「整える」順序。
 *
 * 3 つのナンバー付きステージカード： ① 整える(ほうき) → ② エサ(タネ) → ③ 菌(ドット)。
 */
export function TidyOrderIllustration({ className }: { className?: string }) {
  const stage = (x: number, n: number, label: string, glyph: string) => (
    <g key={n}>
      <rect
        x={x}
        y={48}
        width={92}
        height={112}
        rx={16}
        fill="#ffffff"
        stroke="#7c5e3b"
        strokeWidth={1.6}
      />
      <circle cx={x + 18} cy={64} r={11} fill="#5d8a6c" />
      <text
        x={x + 18}
        y={68}
        fontSize="11"
        fill="#ffffff"
        textAnchor="middle"
        fontWeight={700}
      >
        {n}
      </text>
      <text x={x + 46} y={110} fontSize="32" textAnchor="middle">
        {glyph}
      </text>
      <text x={x + 46} y={144} fontSize="11" fill="#7c5e3b" textAnchor="middle">
        {label}
      </text>
    </g>
  );

  return (
    <svg
      className={className}
      viewBox="0 0 360 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="腸を整える3つのステップ"
    >
      <rect width="360" height="200" fill="#fdf7f3" rx="14" />

      {stage(14, 1, "整える", "🧹")}

      <path d="M114 104 L132 104" stroke="#7c5e3b" strokeWidth="2" strokeLinecap="round" />
      <polygon points="132,104 124,99 124,109" fill="#7c5e3b" />

      {stage(134, 2, "エサ", "🌱")}

      <path d="M234 104 L252 104" stroke="#7c5e3b" strokeWidth="2" strokeLinecap="round" />
      <polygon points="252,104 244,99 244,109" fill="#7c5e3b" />

      {stage(254, 3, "菌", "🦠")}

      <text x="12" y="36" fontSize="11" fill="#7c5e3b">順番が大切。①→②→③ で安全に。</text>
    </svg>
  );
}
