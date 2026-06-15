/**
 * 図解の共通プリミティブ。
 * Apple/Google 絵文字 × グラデーション × 浮遊アクセントで、
 * 1 つのデザイン言語に統一されたムードカードを描く。
 *
 * 自己完結: 外側に余計な背景・パディングは不要。直接置けば成立する。
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
  size?: "sm" | "md" | "lg";
  /** 0-100 (%) */
  opacity?: number;
  rotate?: number;
};

const ACCENT_SIZE: Record<NonNullable<AccentEmoji["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export type LessonHeroProps = {
  hero: string;
  gradient: GradientKey;
  accents?: AccentEmoji[];
  /** カード内にオーバーレイ表示する小さなタグ列 */
  chips?: string[];
  /** カード高さ。デフォルト 4/3 */
  ratio?: "1/1" | "5/4" | "4/3" | "3/2";
  className?: string;
};

export function LessonHero({
  hero,
  gradient,
  accents = [],
  chips,
  ratio = "4/3",
  className,
}: LessonHeroProps) {
  const ratioCls = {
    "1/1": "aspect-square",
    "5/4": "aspect-[5/4]",
    "4/3": "aspect-[4/3]",
    "3/2": "aspect-[3/2]",
  }[ratio];

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 shadow-sm",
        ratioCls,
        GRADIENTS[gradient],
        className,
      )}
    >
      {/* やわらかい背景 blob */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/55 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -bottom-14 h-52 w-52 rounded-full bg-white/45 blur-3xl" />

      {/* 浮遊絵文字（カード内のみ・四隅寄り） */}
      {accents.map((a, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "pointer-events-none absolute drop-shadow-sm",
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
      <div className="relative flex h-full items-center justify-center">
        <span
          aria-hidden
          className="text-[96px] leading-none drop-shadow-[0_4px_18px_rgba(124,94,59,0.18)]"
        >
          {hero}
        </span>
      </div>

      {/* チップ列をカード内下部にオーバーレイ */}
      {chips && chips.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-wrap justify-center gap-1.5 px-3">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-stone-700 shadow-sm backdrop-blur-sm"
            >
              {c}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
