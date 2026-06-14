/**
 * 🗺 Lesson 1 — おなかの地図。
 *
 * 縦に並んだ消化管：口 → 食道 → 胃 → 十二指腸 → 小腸 → 大腸。
 * 大腸エリアに菌のドットを密に、小腸エリアに sparse に置く。
 *
 * Server-renderable pure SVG. ViewBox 200x320, max-w-full h-auto.
 */
export function GutMapIllustration({ className }: { className?: string }) {
  // 大腸の菌（密に）
  const colonBugs: Array<[number, number]> = [
    [78, 218], [92, 224], [108, 220], [122, 226], [136, 220],
    [86, 234], [100, 238], [116, 234], [130, 240],
    [78, 250], [94, 254], [112, 250], [128, 256], [140, 252],
    [88, 268], [106, 270], [122, 268], [136, 270],
    [82, 282], [98, 286], [114, 282], [130, 286],
  ];
  // 小腸の菌（疎に）
  const sibBugs: Array<[number, number]> = [
    [110, 160], [85, 178], [128, 190],
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 200 320"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="口から大腸までの消化管の図"
    >
      {/* 背景 */}
      <rect width="200" height="320" fill="#fdf7f3" rx="14" />

      {/* 体のシルエット（胴体だけ） */}
      <path
        d="M60 40 Q60 30 100 30 Q140 30 140 40 L142 280 Q142 300 100 300 Q58 300 58 280 Z"
        fill="#ffffff"
        stroke="#7c5e3b"
        strokeWidth="1.4"
        opacity="0.55"
      />

      {/* 口 */}
      <ellipse cx="100" cy="40" rx="14" ry="5" fill="#fdf7f3" stroke="#7c5e3b" strokeWidth="1.5" />
      <text x="124" y="44" fontSize="10" fill="#7c5e3b">口</text>

      {/* 食道 */}
      <line x1="100" y1="46" x2="100" y2="78" stroke="#7c5e3b" strokeWidth="2" strokeLinecap="round" />
      <text x="120" y="68" fontSize="9" fill="#7c5e3b">食道</text>

      {/* 胃 */}
      <path
        d="M100 80 Q72 86 76 110 Q78 126 100 124 Q116 122 116 108 Q116 96 110 86 Z"
        fill="#fdf7f3"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />
      <text x="124" y="106" fontSize="10" fill="#7c5e3b">胃</text>

      {/* 十二指腸 */}
      <path
        d="M104 124 Q120 132 118 142 Q114 150 104 148"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="126" y="142" fontSize="8" fill="#7c5e3b">十二指腸</text>

      {/* 小腸 — くねくね */}
      <path
        d="M104 150 Q80 160 110 170 Q138 180 96 190 Q72 196 122 200 Q140 202 100 210"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text x="18" y="184" fontSize="10" fill="#7c5e3b">小腸</text>
      <text x="18" y="196" fontSize="7" fill="#a5896b">（菌すくない）</text>

      {/* 小腸の菌 — まばら */}
      {sibBugs.map(([cx, cy], i) => (
        <circle key={`s${i}`} cx={cx} cy={cy} r="2.2" fill="#5d8a6c" opacity="0.6" />
      ))}

      {/* 大腸 — 外枠 */}
      <path
        d="M70 214 L70 290 Q70 296 78 296 L138 296 Q146 296 146 290 L146 214 Q146 208 138 208 L78 208 Q70 208 70 214 Z"
        fill="#eaf3ea"
        stroke="#7c5e3b"
        strokeWidth="1.6"
      />
      <text x="20" y="252" fontSize="10" fill="#7c5e3b">大腸</text>
      <text x="20" y="264" fontSize="7" fill="#a5896b">（菌のおうち）</text>

      {/* 大腸の菌 — 密 */}
      {colonBugs.map(([cx, cy], i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r="2.6" fill="#3c6347" />
      ))}

      {/* 装飾の小さな葉 */}
      <text x="172" y="26" fontSize="14">🌱</text>
    </svg>
  );
}
