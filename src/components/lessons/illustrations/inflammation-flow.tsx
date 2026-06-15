import { LessonHero } from "./_atoms";

/** Lesson 7 — 腸 → 全身 → 背中とのつながり */
export function InflammationFlowIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="petal"
      hero="💖"
      accents={[
        { emoji: "🌿", top: 20, left: 22, size: "lg", opacity: 70 },
        { emoji: "🫀", top: 22, left: 78, size: "md", opacity: 65 },
        { emoji: "🌸", top: 78, left: 22, size: "lg", opacity: 75, rotate: -10 },
        { emoji: "🌸", top: 80, left: 80, size: "md", opacity: 65, rotate: 12 },
        { emoji: "✨", top: 50, left: 92, size: "sm", opacity: 60 },
        { emoji: "✨", top: 56, left: 10, size: "sm", opacity: 55 },
      ]}
      chips={["腸 → 全身", "命のあとに肌へ", "だから背中に出る"]}
    />
  );
}
