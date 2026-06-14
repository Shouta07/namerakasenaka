/**
 * 🚦 Lesson 2 — 菌の渋滞 SIBO。
 *
 * 右に大腸（菌でいっぱい）、左へ向かう逆流の矢印、上に小腸 (細い管)、
 * ガスの泡を上に。アンチ不安カラーで、ふっくら柔らかい曲線を意識。
 */
export function SiboTrafficIllustration({ className }: { className?: string }) {
  const colonBugs: Array<[number, number]> = [
    [240, 110], [256, 116], [272, 110], [288, 118], [302, 112],
    [248, 130], [266, 134], [284, 130], [300, 134],
    [240, 148], [258, 152], [276, 150], [294, 154], [310, 150],
    [248, 168], [266, 172], [284, 170], [302, 172],
  ];
  // 小腸に侵入した菌 — 3つだけ目立たせる
  const refluxBugs: Array<[number, number]> = [
    [180, 80], [148, 70], [118, 78],
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 360 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="大腸の菌が小腸へ逆流する図"
    >
      <rect width="360" height="200" fill="#fdf7f3" rx="14" />

      {/* 小腸 — 横向き細い管 */}
      <path
        d="M30 80 Q80 50 140 80 Q200 110 230 80"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text x="36" y="50" fontSize="11" fill="#7c5e3b">小腸（道路）</text>

      {/* 大腸 — 右側に大きい袋 */}
      <rect
        x="226"
        y="90"
        width="106"
        height="92"
        rx="14"
        fill="#eaf3ea"
        stroke="#7c5e3b"
        strokeWidth="1.8"
      />
      <text x="244" y="102" fontSize="10" fill="#3c6347">大腸</text>

      {/* 大腸の菌 — 密集 */}
      {colonBugs.map(([cx, cy], i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r="3" fill="#3c6347" />
      ))}

      {/* 逆流矢印 */}
      <path
        d="M226 110 Q170 60 110 70"
        fill="none"
        stroke="#7c5e3b"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <polygon points="110,70 122,64 120,76" fill="#7c5e3b" />
      <text x="138" y="60" fontSize="9" fill="#7c5e3b">逆流</text>

      {/* 逆流して小腸に入った菌 */}
      {refluxBugs.map(([cx, cy], i) => (
        <circle key={`r${i}`} cx={cx} cy={cy} r="3" fill="#5d8a6c" opacity="0.85" />
      ))}

      {/* ガスの泡 — 上にふんわり */}
      <circle cx="80" cy="36" r="6" fill="#fde68a" opacity="0.85" />
      <circle cx="100" cy="22" r="4.5" fill="#fde68a" opacity="0.7" />
      <circle cx="64" cy="22" r="3.5" fill="#fde68a" opacity="0.7" />
      <text x="50" y="20" fontSize="10">💨</text>
      <text x="90" y="14" fontSize="9">💨</text>

      {/* 信号 🚦 */}
      <text x="330" y="40" fontSize="16">🚦</text>
    </svg>
  );
}
