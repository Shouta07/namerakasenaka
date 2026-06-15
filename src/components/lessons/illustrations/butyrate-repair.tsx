import { LessonHero } from "./_atoms";

/** Lesson 6 — 酪酸菌 = 腸の修理屋さん */
export function ButyrateRepairIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="fresh-green"
      hero="🌱"
      accents={[
        { emoji: "👷", top: 22, left: 20, size: "lg", opacity: 80 },
        { emoji: "🧱", top: 24, left: 82, size: "md", opacity: 70 },
        { emoji: "🏠", top: 78, left: 80, size: "lg", opacity: 75 },
        { emoji: "🍚", top: 76, left: 18, size: "md", opacity: 65 },
        { emoji: "✨", top: 50, left: 92, size: "sm", opacity: 60 },
        { emoji: "✨", top: 56, left: 10, size: "sm", opacity: 55 },
      ]}
      chips={["炎症をしずめる", "腸の壁を守る", "細胞のごはん"]}
    />
  );
}
