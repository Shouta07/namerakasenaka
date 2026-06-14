/**
 * 🌾 Lesson 3 — フルクタン。
 *
 * 玉ねぎ・小麦 → 小腸 (吸収✕) → 大腸（菌が食べる） → ガス。
 * 3段階の横フローを chevron で繋ぐ。
 */
export function FructanFeedingIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="フルクタンを菌が食べてガスができる流れの図"
    >
      <rect width="360" height="200" fill="#fdf7f3" rx="14" />

      {/* ステージ① 食材 */}
      <rect
        x="14"
        y="56"
        width="92"
        height="92"
        rx="14"
        fill="#ffffff"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />
      <text x="36" y="46" fontSize="9" fill="#7c5e3b">食べもの</text>
      <text x="32" y="100" fontSize="22">🧅</text>
      <text x="64" y="100" fontSize="22">🌾</text>
      <text x="32" y="132" fontSize="11" fill="#7c5e3b">玉ねぎ・小麦</text>

      {/* chevron 1 */}
      <path d="M112 100 L132 100" stroke="#7c5e3b" strokeWidth="2" strokeLinecap="round" />
      <polygon points="132,100 124,95 124,105" fill="#7c5e3b" />

      {/* ステージ② 小腸 — 吸収✕ */}
      <rect
        x="138"
        y="56"
        width="84"
        height="92"
        rx="14"
        fill="#ffffff"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />
      <text x="156" y="46" fontSize="9" fill="#7c5e3b">小腸</text>
      <text x="156" y="98" fontSize="18" fill="#7c5e3b">吸収</text>
      <text x="190" y="98" fontSize="20" fill="#c97a4d">✕</text>
      <text x="154" y="132" fontSize="9" fill="#a5896b">通り過ぎる</text>

      {/* chevron 2 */}
      <path d="M226 100 L246 100" stroke="#7c5e3b" strokeWidth="2" strokeLinecap="round" />
      <polygon points="246,100 238,95 238,105" fill="#7c5e3b" />

      {/* ステージ③ 大腸 — 菌が食べてガス */}
      <rect
        x="252"
        y="56"
        width="94"
        height="92"
        rx="14"
        fill="#eaf3ea"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />
      <text x="278" y="46" fontSize="9" fill="#3c6347">大腸</text>
      {/* 菌のドット */}
      {[
        [266, 84], [282, 92], [298, 84], [314, 92], [330, 86],
        [274, 108], [292, 116], [308, 108], [324, 116],
        [266, 130], [282, 138], [302, 132], [320, 138],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.8" fill="#3c6347" />
      ))}
      {/* ガスの泡 */}
      <circle cx="300" cy="28" r="5" fill="#fde68a" opacity="0.85" />
      <circle cx="316" cy="20" r="4" fill="#fde68a" opacity="0.7" />
      <text x="280" y="22" fontSize="10">💨</text>
      <text x="324" y="14" fontSize="9">💨</text>
    </svg>
  );
}
