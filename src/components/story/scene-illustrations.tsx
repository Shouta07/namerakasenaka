/**
 * 「使いみち絵巻」 各場面のイラスト。
 *
 * lessons/illustrations が "医療メカニズム" を描くのに対し、こちらは
 * "サロン現場の場面" を描く。 iPad / スマホ / 人 / 会話 などの素朴な
 * 形を、ブランドのあたたかいパレットで構成する。
 *
 * すべて Server-renderable。 viewBox は 360x300（共通）。
 */
import { C, SoftBg, LabelChip, DiagramTitle, Footnote } from "../lessons/illustrations/_svg";

const SCREEN_BG = "#fffdf9";
const SCREEN_EDGE = "#d6c8b8";
const ACCENT = "#8c5a3c";
const SOFT = "#f6cda9";

/**
 * iPad のフレーム。中身（children）はクリッピングしない。
 * 同一ページ上に複数の IPad/Phone を置く場合、clipPath の ID 衝突で
 * 中身が消える事故が起きるため、コンテンツ側で「スクリーン内に収まる
 * 座標」を守ることで設計する。
 */
function IPad({
  x,
  y,
  w = 130,
  h = 90,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#3b3128" />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx={3} fill={SCREEN_BG} />
      <rect x={x + w / 2 - 8} y={y + h - 3.5} width={16} height={1.4} rx={0.7} fill="#cfc2b3" />
      {children}
    </g>
  );
}

function Phone({
  x,
  y,
  w = 56,
  h = 100,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill="#3b3128" />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={6} fill={SCREEN_BG} />
      <rect x={x + w / 2 - 8} y={y + 4} width={16} height={3} rx={1.5} fill="#3b3128" />
      {children}
    </g>
  );
}

/** ふんわりした人（円頭 + 肩）。 */
function Person({
  x,
  y,
  scale = 1,
  color = "#cdb29a",
  hair = "#3b3128",
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
  hair?: string;
}) {
  const s = scale;
  return (
    <g>
      {/* 髪（後頭部） */}
      <path
        d={`M ${x - 14 * s} ${y - 8 * s} q ${14 * s} ${-22 * s} ${28 * s} 0 Z`}
        fill={hair}
      />
      {/* 顔 */}
      <circle cx={x} cy={y} r={12 * s} fill="#f1d8c0" stroke="#d3b89e" strokeWidth={1} />
      {/* 目 */}
      <circle cx={x - 3.5 * s} cy={y - 1} r={1.1 * s} fill="#3b3128" />
      <circle cx={x + 3.5 * s} cy={y - 1} r={1.1 * s} fill="#3b3128" />
      {/* 笑み */}
      <path
        d={`M ${x - 3 * s} ${y + 4 * s} q ${3 * s} ${2 * s} ${6 * s} 0`}
        fill="none"
        stroke="#3b3128"
        strokeWidth={1}
        strokeLinecap="round"
      />
      {/* 服 */}
      <path
        d={`M ${x - 20 * s} ${y + 28 * s} q ${20 * s} ${-18 * s} ${40 * s} 0 L ${x + 20 * s} ${y + 36 * s} L ${x - 20 * s} ${y + 36 * s} Z`}
        fill={color}
        stroke="#a8907a"
        strokeWidth={1}
      />
    </g>
  );
}

/* ============================================================
 * Scene 1 — カウンセリングで聴く
 * ============================================================ */
export function SceneCounseling({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="サロンのカウンセリングで担当者がお客様の悩みを聴く場面"
      className={className}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="場面 1 — 悩みを聴く" />

      {/* テーブル */}
      <rect x={36} y={186} width={288} height={10} rx={4} fill="#e2cdb1" />
      <rect x={48} y={196} width={264} height={14} fill="#d6bb95" opacity={0.6} />

      {/* 担当者（左） */}
      <Person x={92} y={130} hair="#2f241b" color="#bfa988" />
      <text x={92} y={184} fontSize={9} fontWeight={700} fill={C.ink} textAnchor="middle">
        担当者
      </text>

      {/* お客様（右） */}
      <Person x={268} y={130} hair="#5a3a2a" color="#e7c3c0" />
      <text x={268} y={184} fontSize={9} fontWeight={700} fill={C.ink} textAnchor="middle">
        お客様
      </text>

      {/* iPad（テーブル上、担当者側・少し大きく） */}
      <g transform="translate(146 150)">
        <IPad x={0} y={0} w={70} h={50}>
          {/* カウンセリングフォーム想起 */}
          <rect x={6} y={9} width={58} height={3.5} rx={1} fill={ACCENT} />
          <rect x={6} y={17} width={40} height={2.4} rx={1} fill="#bfa988" />
          <rect x={6} y={23} width={52} height={2.4} rx={1} fill="#d6c2ab" />
          <rect x={6} y={29} width={46} height={2.4} rx={1} fill="#d6c2ab" />
          <rect x={6} y={36} width={32} height={5} rx={2} fill={SOFT} />
        </IPad>
      </g>

      {/* 吹き出し（お客様→悩み・角丸 rect + しっぽ） */}
      <g>
        <rect x={204} y={68} width={128} height={52} rx={14} fill="#fff" stroke="#e1cfb6" strokeWidth={1.4} />
        <polygon points="244,120 250,136 262,120" fill="#fff" stroke="#e1cfb6" strokeWidth={1.4} />
        <line x1={245} y1={120} x2={261} y2={120} stroke="#fff" strokeWidth={2} />
        <text x={268} y={90} fontSize={9.5} fill={C.ink} textAnchor="middle">
          薬を塗っても
        </text>
        <text x={268} y={106} fontSize={9.5} fill={C.ink} textAnchor="middle">
          すぐ繰り返してしまって…
        </text>
      </g>

      <LabelChip x={92} y={224} text="聴く・記録する" fontSize={9} />
      <LabelChip x={268} y={224} text="自分の言葉で話せる" fontSize={9} />

      <Footnote
        x={180}
        y={278}
        text="iPad でカウンセリング項目を一緒に確認。検査値や食生活はあとで翻訳されます。"
        anchor="middle"
      />
    </svg>
  );
}

/* ============================================================
 * Scene 2 — その場で翻訳して見せる
 * ============================================================ */
export function SceneTranslate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="iPad の画面で検査結果が顧客にもわかる言葉と図解に翻訳される場面"
      className={className}
    >
      <SoftBg tone="green" />
      <DiagramTitle x={18} y={26} text="場面 2 — その場で『翻訳』して見せる" />

      {/* 中央 iPad（横向き大きめ） */}
      <g transform="translate(60 60)">
        <IPad x={0} y={0} w={240} h={170}>
          {/* タブ */}
          <rect x={10} y={10} width={62} height={14} rx={3} fill={ACCENT} />
          <text x={41} y={20} fontSize={7} fontWeight={700} fill="#fff" textAnchor="middle">
            あなたの検査結果
          </text>
          <rect x={76} y={10} width={50} height={14} rx={3} fill="#e7d9c8" />
          <text x={101} y={20} fontSize={7} fontWeight={600} fill={C.ink} textAnchor="middle">
            図解
          </text>

          {/* 上段: 検査値カード（医療語） */}
          <rect x={10} y={32} width={104} height={50} rx={3} fill="#fff8ee" stroke="#e2cdb1" strokeWidth={0.6} />
          <text x={16} y={42} fontSize={7} fill="#9a8b76">DAO 活性</text>
          <text x={16} y={56} fontSize={12} fontWeight={800} fill={C.ink}>低</text>
          <text x={16} y={70} fontSize={6.5} fill="#9a8b76">— ヒスタミン分解</text>

          {/* 矢印 */}
          <g stroke={ACCENT} fill={ACCENT}>
            <line x1={122} y1={56} x2={138} y2={56} strokeWidth={1.6} />
            <polygon points="138,53 144,56 138,59" />
          </g>

          {/* 下段: 翻訳カード（顧客語） */}
          <rect x={148} y={32} width={84} height={50} rx={3} fill={SOFT} opacity={0.4} />
          <text x={154} y={42} fontSize={6.5} fontWeight={700} fill={ACCENT}>あなたの体では</text>
          <text x={154} y={56} fontSize={9} fontWeight={800} fill={C.ink}>「ヒスタミン」が</text>
          <text x={154} y={68} fontSize={9} fontWeight={800} fill={C.ink}>残りやすい</text>
          <text x={154} y={78} fontSize={6} fill="#7a6657">— 赤み・かゆみの原因に</text>

          {/* 図解バー */}
          <rect x={10} y={94} width={222} height={36} rx={3} fill="#fdfaf3" stroke="#e2cdb1" strokeWidth={0.6} />
          <text x={16} y={104} fontSize={6.5} fontWeight={700} fill="#9a8b76">図解で見る</text>
          {/* 小さな腸の細胞列 */}
          <g transform="translate(16 110)">
            {Array.from({ length: 9 }).map((_, i) => (
              <rect key={i} x={i * 14} y={0} width={11} height={14} rx={3} fill={SOFT} stroke="#d3a37e" strokeWidth={0.6} />
            ))}
          </g>
          {/* 矢印で粒子 */}
          <circle cx={70} cy={120} r={2} fill="#7c5cb0" />
          <circle cx={94} cy={122} r={1.6} fill="#eec23a" />

          {/* 「今日のひとつ」チップ */}
          <rect x={10} y={138} width={222} height={22} rx={3} fill="#eaf3ea" stroke="#b8d6b8" strokeWidth={0.7} />
          <text x={18} y={152} fontSize={8} fontWeight={700} fill="#3c6347">🌱 今日のひとつ</text>
          <text x={84} y={152} fontSize={7.5} fill={C.ink}>発酵食品を一口減らして1週間試す</text>
        </IPad>
      </g>

      <LabelChip x={180} y={244} text="医療語 → あなたの体の話 → 今日のひとつ" fontSize={10} />

      <Footnote
        x={180}
        y={282}
        text="同じ検査結果が、顧客にも担当者にも『次の一手』として伝わる状態に。"
        anchor="middle"
      />
    </svg>
  );
}

/* ============================================================
 * Scene 3 — 退店時、LINE に『あなたのページ』が届く
 * ============================================================ */
export function SceneShare({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="退店後にお客様のスマホに自分専用ページのリンクが届く場面"
      className={className}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="場面 3 — 帰り道、お客様の手元へ" />

      {/* 左: 店舗 → 矢印 */}
      <g transform="translate(40 76)">
        {/* サロンのカード */}
        <rect x={0} y={20} width={86} height={84} rx={6} fill="#fff" stroke={SCREEN_EDGE} strokeWidth={1.2} />
        <rect x={0} y={20} width={86} height={18} rx={6} fill={ACCENT} />
        <text x={43} y={32} fontSize={8.5} fontWeight={800} fill="#fff" textAnchor="middle">サロン</text>
        <text x={43} y={56} fontSize={9} fontWeight={700} fill={C.ink} textAnchor="middle">本日の施術完了</text>
        <text x={43} y={70} fontSize={7.5} fill="#7a6657" textAnchor="middle">送信ボタンを押すと</text>
        <text x={43} y={82} fontSize={7.5} fill="#7a6657" textAnchor="middle">お客様に届きます</text>
        <rect x={14} y={86} width={58} height={12} rx={6} fill={SOFT} stroke="#d3a37e" strokeWidth={0.7} />
        <text x={43} y={94} fontSize={7.5} fontWeight={700} fill={ACCENT} textAnchor="middle">送信</text>
      </g>

      {/* 矢印 */}
      <g stroke={ACCENT} fill={ACCENT}>
        <line x1={138} y1={150} x2={208} y2={150} strokeWidth={2} strokeDasharray="5 4" />
        <polygon points="208,144 218,150 208,156" />
        <text x={173} y={144} fontSize={8.5} fontWeight={700} fill={ACCENT} textAnchor="middle">
          LINE 通知
        </text>
      </g>

      {/* 右: スマホ */}
      <g transform="translate(232 60)">
        <Phone x={0} y={0} w={68} h={172}>
          {/* LINE 風通知 */}
          <rect x={5} y={10} width={58} height={32} rx={3} fill="#06c755" />
          <circle cx={13} cy={20} r={4} fill="#fff" />
          <text x={20} y={20} fontSize={6} fontWeight={800} fill="#fff">LINE</text>
          <text x={9} y={32} fontSize={6.5} fill="#fff">サロン</text>
          <text x={9} y={39} fontSize={5.5} fill="#fff" opacity={0.85}>本日のあなたのページ</text>

          {/* タップ → /share カード */}
          <rect x={5} y={50} width={58} height={108} rx={3} fill="#fffdf9" stroke="#e2cdb1" strokeWidth={0.6} />
          <rect x={5} y={50} width={58} height={14} rx={3} fill={ACCENT} />
          <text x={34} y={60} fontSize={5.5} fontWeight={700} fill="#fff" textAnchor="middle">あなたの体の地図</text>

          {/* セクション */}
          <text x={9} y={74} fontSize={5} fontWeight={700} fill="#9a8b76">今日の話</text>
          <rect x={9} y={77} width={50} height={12} rx={2} fill="#fff8ee" stroke="#e2cdb1" strokeWidth={0.4} />
          <text x={11} y={85} fontSize={4.5} fill={C.ink}>ヒスタミンが残りやすい</text>

          <text x={9} y={97} fontSize={5} fontWeight={700} fill="#9a8b76">今日のひとつ</text>
          <rect x={9} y={100} width={50} height={14} rx={2} fill="#eaf3ea" stroke="#b8d6b8" strokeWidth={0.4} />
          <text x={11} y={107} fontSize={4.5} fill="#3c6347">🌱 発酵食品を</text>
          <text x={11} y={112} fontSize={4.5} fill="#3c6347">一口減らす</text>

          <text x={9} y={124} fontSize={5} fontWeight={700} fill="#9a8b76">読み物</text>
          <rect x={9} y={127} width={50} height={10} rx={2} fill={SOFT} opacity={0.4} />
          <text x={11} y={134} fontSize={4.5} fill={C.ink}>📘 7つのレッスン</text>

          {/* CTA */}
          <rect x={9} y={142} width={50} height={10} rx={5} fill={ACCENT} />
          <text x={34} y={149} fontSize={5} fontWeight={700} fill="#fff" textAnchor="middle">次の予約をとる</text>
        </Phone>
      </g>

      <LabelChip x={266} y={244} text="お客様 専用 URL（限定公開）" fontSize={9} />

      <Footnote
        x={180}
        y={282}
        text="紙の配布物は無くなる。お客様は『自分専用ページ』として何度も開ける。"
        anchor="middle"
      />
    </svg>
  );
}

/* ============================================================
 * Scene 4 — 翌日、今日のひとつを実行
 * ============================================================ */
export function SceneDoOne({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="翌日、お客様が『今日のひとつ』をスマホで確認して実行する場面"
      className={className}
    >
      <SoftBg tone="green" />
      <DiagramTitle x={18} y={26} text="場面 4 — 翌朝、『今日のひとつ』だけ" />

      {/* 朝のシーン: スマホ + 朝食イメージ */}
      <g transform="translate(46 70)">
        <Phone x={0} y={0} w={84} h={162}>
          <rect x={5} y={10} width={74} height={20} rx={3} fill="#fdfaf3" stroke="#e2cdb1" strokeWidth={0.5} />
          <text x={42} y={22} fontSize={7} fontWeight={700} fill="#9a8b76" textAnchor="middle">
            おはようございます
          </text>

          <rect x={5} y={36} width={74} height={66} rx={3} fill="#eaf3ea" stroke="#b8d6b8" strokeWidth={0.6} />
          <text x={42} y={49} fontSize={7} fontWeight={800} fill="#3c6347" textAnchor="middle">🌱 今日のひとつ</text>
          <text x={42} y={66} fontSize={9} fontWeight={800} fill={C.ink} textAnchor="middle">発酵食品を</text>
          <text x={42} y={78} fontSize={9} fontWeight={800} fill={C.ink} textAnchor="middle">一口だけ減らす</text>
          <text x={42} y={93} fontSize={6} fill="#7a6657" textAnchor="middle">ヒスタミンを残しにくく</text>

          {/* 完了ボタン */}
          <rect x={14} y={108} width={56} height={16} rx={8} fill={ACCENT} />
          <text x={42} y={119} fontSize={7} fontWeight={700} fill="#fff" textAnchor="middle">できた！</text>

          <text x={42} y={138} fontSize={5.5} fill="#9a8b76" textAnchor="middle">タップで種が育ちます</text>
        </Phone>
      </g>

      {/* 達成の演出: スマホ「できた！」→ 芽が育つ（連動を矢印で示す） */}
      <g>
        {/* 連動の流れ矢印（スマホ右 → 芽） */}
        <g stroke="#5d9a6e" fill="#5d9a6e">
          <path d="M 138 180 q 24 -10 44 -2" fill="none" strokeWidth={1.8} strokeDasharray="4 3" strokeLinecap="round" />
          <polygon points="178,170 188,178 176,181" />
        </g>
      </g>

      {/* 芽が育つ鉢（地面のマウンド + 双葉） */}
      <g transform="translate(196 120)">
        {/* やわらかい光の輪 */}
        <circle cx={42} cy={40} r={50} fill="#dcefe0" opacity={0.6} />
        {/* 鉢 */}
        <path d="M 24 70 L 60 70 L 56 92 L 28 92 Z" fill="#caa07a" stroke="#a9805c" strokeWidth={1.2} strokeLinejoin="round" />
        <rect x={20} y={64} width={44} height={8} rx={3} fill="#d8b48f" stroke="#a9805c" strokeWidth={1.2} />
        {/* 土 */}
        <ellipse cx={42} cy={68} rx={18} ry={4} fill="#7c5a3e" />
        {/* 茎 */}
        <path d="M 42 68 q -1 -16 0 -28" fill="none" stroke="#5d9a6e" strokeWidth={2.4} strokeLinecap="round" />
        {/* 双葉 */}
        <path d="M 42 46 q -16 -6 -20 4 q 12 8 20 -4 Z" fill="#7bb88a" stroke="#5d9a6e" strokeWidth={1} />
        <path d="M 42 42 q 16 -8 22 2 q -12 9 -22 -2 Z" fill="#8ec79a" stroke="#5d9a6e" strokeWidth={1} />
        {/* きらめき */}
        <g fill="#f0b429">
          <path d="M 18 28 l 1.6 4 l 4 1.6 l -4 1.6 l -1.6 4 l -1.6 -4 l -4 -1.6 l 4 -1.6 Z" />
          <path d="M 70 36 l 1.2 3 l 3 1.2 l -3 1.2 l -1.2 3 l -1.2 -3 l -3 -1.2 l 3 -1.2 Z" />
        </g>
      </g>

      {/* +1 種 ピル */}
      <g transform="translate(282 118)">
        <rect x={0} y={0} width={56} height={22} rx={11} fill="#eaf3ea" stroke="#5d9a6e" strokeWidth={1.2} />
        <text x={28} y={12} fontSize={10} fontWeight={800} fill="#3c6347" textAnchor="middle" dominantBaseline="central">
          🌱 +1 種
        </text>
      </g>

      <LabelChip x={86} y={244} text="負担ゼロの『ひとつだけ』" fontSize={9} />
      <LabelChip x={250} y={244} text="達成 → 種が育つ（小さな達成感）" fontSize={9} anchor="middle" />

      <Footnote
        x={180}
        y={282}
        text="難しいプランは続かない。だから『今日のひとつ』だけを淡々と。"
        anchor="middle"
      />
    </svg>
  );
}

/* ============================================================
 * Scene 5 — 1週間後、レッスンとクイズ
 * ============================================================ */
export function SceneLesson({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="一週間後、レッスンを読みクイズに答えて種を獲得する場面"
      className={className}
    >
      <SoftBg tone="cream" />
      <DiagramTitle x={18} y={26} text="場面 5 — 1週間後、すこしずつ詳しくなる" />

      {/* 左: レッスン本文 */}
      <g transform="translate(42 64)">
        <rect x={0} y={0} width={130} height={172} rx={8} fill="#fff" stroke={SCREEN_EDGE} strokeWidth={1} />
        <rect x={0} y={0} width={130} height={20} rx={8} fill={ACCENT} />
        <text x={65} y={13} fontSize={7.5} fontWeight={800} fill="#fff" textAnchor="middle">📘 Lesson 3 / 7</text>

        <text x={10} y={36} fontSize={9} fontWeight={800} fill={C.ink}>体の中の『漏れ』</text>
        <text x={10} y={48} fontSize={6.5} fill="#9a8b76">— 腸の壁の話</text>

        {/* ミニ図 */}
        <rect x={10} y={56} width={110} height={50} rx={4} fill="#fdf7f3" stroke="#e2cdb1" strokeWidth={0.6} />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={16 + i * 14} y={72} width={11} height={18} rx={3} fill={SOFT} stroke="#d3a37e" strokeWidth={0.6} />
        ))}
        {/* すき間 */}
        <circle cx={86} cy={84} r={2.2} fill="#7c5cb0" />

        <text x={10} y={120} fontSize={6.5} fill="#7a6657">
          細胞のすき間からこぼれることが
        </text>
        <text x={10} y={130} fontSize={6.5} fill="#7a6657">
          あって、それが体のあちこちに...
        </text>

        {/* 進捗バー */}
        <rect x={10} y={150} width={110} height={5} rx={2.5} fill="#eee5d6" />
        <rect x={10} y={150} width={48} height={5} rx={2.5} fill={ACCENT} />
        <text x={10} y={164} fontSize={6} fill="#9a8b76">読み進めている: 3 / 7</text>
      </g>

      {/* 右: クイズカード */}
      <g transform="translate(190 70)">
        <rect x={0} y={0} width={128} height={160} rx={8} fill="#fff" stroke={SCREEN_EDGE} strokeWidth={1} />
        <text x={10} y={18} fontSize={7} fontWeight={800} fill={ACCENT}>まとめのクイズ</text>
        <text x={10} y={32} fontSize={8} fontWeight={700} fill={C.ink}>『漏れ』が続くと</text>
        <text x={10} y={44} fontSize={8} fontWeight={700} fill={C.ink}>体のどこに影響する？</text>

        {[
          { y: 56, label: "A. 肌だけ", ok: false },
          { y: 76, label: "B. 体のあちこち", ok: true },
          { y: 96, label: "C. 影響しない", ok: false },
        ].map((c, i) => (
          <g key={i}>
            <rect
              x={10}
              y={c.y}
              width={108}
              height={16}
              rx={4}
              fill={c.ok ? "#eaf3ea" : "#fafafa"}
              stroke={c.ok ? "#5d9a6e" : "#e2dccb"}
              strokeWidth={c.ok ? 1.4 : 0.7}
            />
            <text x={18} y={c.y + 10.5} fontSize={7} fill={C.ink}>{c.label}</text>
            {c.ok ? (
              <text x={110} y={c.y + 10.5} fontSize={8} fontWeight={800} fill="#3c6347" textAnchor="end">✓</text>
            ) : null}
          </g>
        ))}

        {/* バッジ獲得 */}
        <rect x={10} y={120} width={108} height={32} rx={6} fill={SOFT} opacity={0.5} />
        <text x={20} y={134} fontSize={7} fontWeight={800} fill={ACCENT}>🏅 「気づきの種」</text>
        <text x={20} y={146} fontSize={6} fill={C.ink}>を獲得しました</text>
      </g>

      <LabelChip x={180} y={246} text="正解しなくても『種』は受け取れる" fontSize={9} />

      <Footnote
        x={180}
        y={282}
        text="お客様は来店の『間』にも、自分のペースで体の話を読み進める。"
        anchor="middle"
      />
    </svg>
  );
}

/* ============================================================
 * Scene 6 — 次回来店、変化を持って戻る
 * ============================================================ */
export function SceneRevisit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="次回来店時、お客様が変化を実感して戻ってくる場面"
      className={className}
    >
      <SoftBg tone="green" />
      <DiagramTitle x={18} y={26} text="場面 6 — 次回来店、変化を持って戻る" />

      {/* 左: 担当者側ダッシュボード（iPad） */}
      <g transform="translate(28 64)">
        <IPad x={0} y={0} w={150} h={170}>
          {/* タイトル */}
          <rect x={6} y={6} width={138} height={14} rx={3} fill={ACCENT} />
          <text x={75} y={16} fontSize={7} fontWeight={800} fill="#fff" textAnchor="middle">
            鈴木様 — 経過サマリ
          </text>

          {/* 種 */}
          <rect x={6} y={26} width={66} height={52} rx={4} fill="#fdf7f3" stroke="#e2cdb1" strokeWidth={0.6} />
          <text x={12} y={37} fontSize={6} fill="#9a8b76">獲得した種</text>
          <text x={12} y={56} fontSize={20} fontWeight={800} fill={ACCENT}>7</text>
          <text x={32} y={56} fontSize={7} fill="#9a8b76">/12 個</text>
          <g transform="translate(12 64)">
            {Array.from({ length: 7 }).map((_, i) => (
              <text key={i} x={i * 7} y={6} fontSize={8}>🌱</text>
            ))}
          </g>

          {/* レッスン進捗 */}
          <rect x={78} y={26} width={66} height={52} rx={4} fill="#fdf7f3" stroke="#e2cdb1" strokeWidth={0.6} />
          <text x={84} y={37} fontSize={6} fill="#9a8b76">レッスン</text>
          <text x={84} y={56} fontSize={20} fontWeight={800} fill={ACCENT}>3</text>
          <text x={104} y={56} fontSize={7} fill="#9a8b76">/ 7 章</text>
          <rect x={84} y={62} width={54} height={4} rx={2} fill="#eee5d6" />
          <rect x={84} y={62} width={23} height={4} rx={2} fill={ACCENT} />

          {/* 実行ログ */}
          <rect x={6} y={84} width={138} height={50} rx={4} fill="#eaf3ea" stroke="#b8d6b8" strokeWidth={0.6} />
          <text x={12} y={94} fontSize={6.5} fontWeight={700} fill="#3c6347">今日のひとつ 実行</text>
          {/* 日別ドット */}
          <g transform="translate(12 102)">
            {[1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1].map((v, i) => (
              <circle
                key={i}
                cx={i * 9 + 3}
                cy={6}
                r={3}
                fill={v ? "#5d9a6e" : "#e2dccb"}
              />
            ))}
          </g>
          <text x={12} y={126} fontSize={5.5} fill="#3c6347">この2週間で 11 / 14 日 達成</text>

          {/* 次の話 */}
          <rect x={6} y={140} width={138} height={22} rx={4} fill={SOFT} opacity={0.4} />
          <text x={12} y={148} fontSize={6} fontWeight={700} fill={ACCENT}>次回お話したいこと</text>
          <text x={12} y={158} fontSize={6.5} fill={C.ink}>かゆみが減った → 次のテーマ提案</text>
        </IPad>
      </g>

      {/* 右: 吹き出し + お客様 */}
      <g transform="translate(202 70)">
        {/* 吹き出し本体（シンプルな角丸 + 三角タイル） */}
        <rect
          x={0}
          y={0}
          width={130}
          height={66}
          rx={14}
          fill="#fff"
          stroke="#e1cfb6"
          strokeWidth={1.4}
        />
        <polygon points="58,66 64,82 74,66" fill="#fff" stroke="#e1cfb6" strokeWidth={1.4} />
        {/* タイル線の境目を白で重ねて隠す */}
        <line x1={59} y1={66} x2={73} y2={66} stroke="#fff" strokeWidth={2} />

        <text x={65} y={22} fontSize={10} fill={C.ink} textAnchor="middle">
          かゆみが
        </text>
        <text x={65} y={38} fontSize={10} fill={C.ink} textAnchor="middle">
          少しマシかも
        </text>
        <text x={65} y={54} fontSize={10} fill={C.ink} textAnchor="middle">
          …続けてみたい
        </text>

        {/* お客様（吹き出しの下、タイルの先） */}
        <Person x={65} y={120} scale={1.2} hair="#5a3a2a" color="#e7c3c0" />
        <text x={65} y={172} fontSize={10} fontWeight={700} fill={C.ink} textAnchor="middle">
          鈴木様
        </text>
      </g>

      <LabelChip x={104} y={246} text="担当者側に状況が見える" fontSize={9} />
      <LabelChip x={296} y={246} text="お客様は変化を実感" anchor="middle" fontSize={9} />

      <Footnote
        x={180}
        y={282}
        text="『再来店の理由』が、施術以外にも積み重なっていく。"
        anchor="middle"
      />
    </svg>
  );
}
