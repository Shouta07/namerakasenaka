/**
 * 🥛 Lesson 4 — 乳酸菌が逆効果になることも（混みあい）。
 *
 * 既に菌でいっぱいのおなかに、"+ 新しい菌" を加える図。
 * ⚡ アイコン + やわらかい😲。怖くない、ふんわりタッチ。
 */
export function OvercrowdingIllustration({ className }: { className?: string }) {
  // たくさんの菌
  const bugs: Array<[number, number]> = [
    [70, 110], [90, 116], [108, 110], [126, 118], [144, 110], [162, 116], [180, 110],
    [78, 130], [96, 136], [114, 130], [132, 138], [150, 130], [168, 136], [186, 130],
    [70, 150], [90, 156], [108, 150], [126, 158], [144, 150], [162, 156], [180, 150],
    [78, 170], [96, 176], [114, 170], [132, 178], [150, 170], [168, 176], [186, 170],
  ];
  // 追加で入る菌（少しサイズ違いで色味も違える）
  const extraBugs: Array<[number, number]> = [
    [250, 110], [270, 116], [290, 110], [310, 118],
    [258, 130], [280, 136], [300, 130], [320, 138],
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 360 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="既に菌がたくさんいる腸に、さらに菌を足してしまう図"
    >
      <rect width="360" height="200" fill="#fdf7f3" rx="14" />

      {/* 大腸 — 大きな袋 */}
      <rect
        x="44"
        y="74"
        width="172"
        height="116"
        rx="22"
        fill="#eaf3ea"
        stroke="#7c5e3b"
        strokeWidth="1.8"
      />
      <text x="56" y="66" fontSize="10" fill="#3c6347">いまの大腸</text>

      {/* たくさんの菌 */}
      {bugs.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#3c6347" />
      ))}

      {/* 矢印 + 追加 */}
      <path d="M222 132 L246 132" stroke="#7c5e3b" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="246,132 238,127 238,137" fill="#7c5e3b" />
      <text x="226" y="116" fontSize="11" fill="#7c5e3b">＋新しい菌</text>

      {/* 追加で入ってくる菌（小さな雲っぽい囲み） */}
      <rect
        x="244"
        y="92"
        width="100"
        height="76"
        rx="20"
        fill="#ffffff"
        stroke="#7c5e3b"
        strokeWidth="1.4"
        strokeDasharray="4 3"
      />
      {extraBugs.map(([cx, cy], i) => (
        <circle key={`e${i}`} cx={cx} cy={cy} r="3" fill="#5d8a6c" />
      ))}

      {/* ⚡ */}
      <text x="200" y="58" fontSize="18">⚡</text>
      {/* やわらか目の😲 — テキストで */}
      <text x="14" y="42" fontSize="22">🥛</text>
      <text x="180" y="42" fontSize="14" fill="#7c5e3b">混んでて、ちょっとびっくり</text>
    </svg>
  );
}
