/**
 * 💖 Lesson 7 — つながりの話（腸 → 全身 → 背中）。
 *
 * 上に腸 (やわらかく 🔥)、矢印が体シルエットを通って下まで広がり、
 * 最後に背中 (シルエット背面) が淡くハイライト。
 */
export function InflammationFlowIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="腸の炎症が全身を巡って背中に届く流れ"
    >
      <rect width="360" height="220" fill="#fdf7f3" rx="14" />

      {/* 体のシルエット（前面） */}
      <path
        d="M120 30 Q120 18 140 18 Q160 18 160 30 L162 196 Q162 208 140 208 Q118 208 118 196 Z"
        fill="#ffffff"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />

      {/* 腸の場所（おなか） */}
      <ellipse cx="140" cy="100" rx="22" ry="16" fill="#eaf3ea" stroke="#7c5e3b" strokeWidth="1.4" />
      <text x="172" y="92" fontSize="10" fill="#7c5e3b">腸</text>
      {/* 🔥 やさしく */}
      <text x="128" y="106" fontSize="16">🔥</text>

      {/* 矢印が広がる */}
      <path
        d="M140 116 Q150 140 154 170"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="1.6"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <path
        d="M140 116 Q132 142 124 170"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="1.6"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />

      {/* 背中シルエット — 右側 */}
      <path
        d="M240 30 Q240 18 260 18 Q280 18 280 30 L282 196 Q282 208 260 208 Q238 208 238 196 Z"
        fill="#fef3ed"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />
      {/* 背中の淡いハイライト */}
      <rect x="244" y="78" width="36" height="84" rx="14" fill="#fcd34d" opacity="0.35" />
      <text x="232" y="14" fontSize="10" fill="#7c5e3b">背中（うしろ姿）</text>

      {/* 体と体を繋ぐ伝達矢印（前→後） */}
      <path
        d="M164 120 Q200 100 238 120"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <polygon points="238,120 230,114 230,126" fill="#7c5e3b" />
      <text x="180" y="92" fontSize="10" fill="#7c5e3b">最後に背中へ</text>

      {/* 装飾の💖 */}
      <text x="328" y="34" fontSize="14">💖</text>
    </svg>
  );
}
