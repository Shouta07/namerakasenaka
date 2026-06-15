import { LessonHero } from "./_atoms";

/** Lesson 5 — まず「整える」順序 */
export function TidyOrderIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="earth-sand"
      hero="🛠"
      accents={[
        { emoji: "🧹", top: 20, left: 20, size: "lg", opacity: 70, rotate: -10 },
        { emoji: "🌾", top: 22, left: 80, size: "lg", opacity: 65, rotate: 8 },
        { emoji: "🦠", top: 78, left: 50, size: "lg", opacity: 65 },
        { emoji: "✨", top: 50, left: 12, size: "sm", opacity: 50 },
        { emoji: "✨", top: 60, left: 90, size: "sm", opacity: 50 },
      ]}
      chips={["① 整える", "② エサ", "③ 菌"]}
    />
  );
}
