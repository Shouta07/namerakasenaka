/**
 * 図解の共通プリミティブ。
 * Apple/Google 絵文字 × グラデーション × 浮遊アクセントで、
 * 1 つのデザイン言語に統一されたムードカードを描く。
 */
import { cn } from "@/lib/utils/cn";

export type GradientKey =
  | "fresh-green"
  | "warm-amber"
  | "rose-cream"
  | "earth-sand"
  | "calm-emerald"
  | "soft-brand"
  | "petal";

const GRADIENTS: Record<GradientKey, string> = {
  "fresh-green":
    "bg-[radial-gradient(120%_120%_at_20%_0%,#ecfdf5_0%,#fdf7f3_55%,#fffaf0_100%)]",
  "warm-amber":
    "bg-[radial-gradient(120%_120%_at_80%_10%,#fff4d6_0%,#fdf7f3_55%,#fff1ec_100%)]",
  "rose-cream":
    "bg-[radial-gradient(120%_120%_at_80%_0%,#ffe4e6_0%,#fff3eb_55%,#fdf7f3_100%)]",
  "earth-sand":
    "bg-[radial-gradient(120%_120%_at_20%_100%,#f0e6d2_0%,#fdf7f3_60%,#ecfdf5_100%)]",
  "calm-emerald":
    "bg-[radial-gradient(120%_120%_at_50%_100%,#d1fae5_0%,#ecfdf5_55%,#fdf7f3_100%)]",
  "soft-brand":
    "bg-[radial-gradient(120%_120%_at_50%_0%,#f7e7d5_0%,#fdf7f3_55%,#fffaf0_100%)]",
  petal:
    "bg-[radial-gradient(120%_120%_at_30%_100%,#fce7f3_0%,#fdf7f3_55%,#ecfdf5_100%)]",
};

export type AccentEmoji = {
  emoji: string;
  /** 0-100 の % 座標。背景に散らされる小さな装飾。 */
  top: number;
  left: number;
  /** デフォルト 24px */
  size?: "sm" | "md" | "lg";
  /** デフォルト 60 */
  opacity?: number;
  /** 回転 (deg) */
  rotate?: number;
};

const ACCENT_SIZE: Record<NonNullable<AccentEmoji["size"]>, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export type LessonHeroProps = {
  /** 中央に大きく置く主役絵文字 */
  hero: string;
  /** 背景グラデの種類 */
  gradient: GradientKey;
  /** 浮遊する装飾絵文字 */
  accents?: AccentEmoji[];
  /** ヒーロー絵文字の下に小さくキャプション（任意） */
  caption?: string;
  /** カードの下に薄いタグ列 */
  chips?: string[];
  /** カード高さ（aspect 比）。デフォルト 5/4 */
  ratio?: "1/1" | "5/4" | "4/3" | "3/2";
  className?: string;
};

/**
 * 1 つのデザイン言語で統一されたレッスン用ムードカード。
 *
 * - 背景: 柔らかい放射グラデ + ぼかし円
 * - 主役: 大きな絵文字（Apple/Google のプロイラスト）
 * - 装飾: 浮遊する小さな絵文字（半透明）
 * - 下部: 小さなキャプション + 任意のタグ列
 */
export function LessonHero({
  hero,
  gradient,
  accents = [],
  caption,
  chips,
  ratio = "5/4",
  className,
}: LessonHeroProps) {
  const ratioCls = {
    "1/1": "aspect-square",
    "5/4": "aspect-[5/4]",
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
  }[ratio];

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/60 shadow-sm",
          ratioCls,
          GRADIENTS[gradient],
        )}
      >
        {/* 大きな soft blob */}
        <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/55 blur-3xl" />
        <div className="absolute -right-14 -bottom-16 h-56 w-56 rounded-full bg-white/45 blur-3xl" />

        {/* 浮遊する装飾絵文字 */}
        {accents.map((a, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute drop-shadow-sm",
              ACCENT_SIZE[a.size ?? "md"],
            )}
            style={{
              top: `${a.top}%`,
              left: `${a.left}%`,
              opacity: (a.opacity ?? 60) / 100,
              transform: `translate(-50%, -50%) rotate(${a.rotate ?? 0}deg)`,
            }}
          >
            {a.emoji}
          </span>
        ))}

        {/* ヒーロー絵文字 */}
        <div className="relative flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <span
            aria-hidden
            className="text-[88px] leading-none drop-shadow-[0_4px_18px_rgba(124,94,59,0.18)]"
          >
            {hero}
          </span>
          {caption ? (
            <p className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-stone-700 shadow-sm backdrop-blur-sm">
              {caption}
            </p>
          ) : null}
        </div>
      </div>

      {chips && chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5 px-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-medium text-stone-600 shadow-sm"
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
