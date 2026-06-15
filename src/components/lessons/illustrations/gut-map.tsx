import { LessonHero } from "./_atoms";

/** Lesson 1 — おなかの地図 */
export function GutMapIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="calm-emerald"
      hero="🌿"
      accents={[
        { emoji: "👄", top: 12, left: 18, size: "md", opacity: 70 },
        { emoji: "🍽️", top: 22, left: 80, size: "sm", opacity: 55, rotate: -8 },
        { emoji: "🫃", top: 70, left: 14, size: "md", opacity: 55 },
        { emoji: "🌀", top: 80, left: 84, size: "md", opacity: 50, rotate: 12 },
        { emoji: "✨", top: 40, left: 88, size: "sm", opacity: 70 },
        { emoji: "✨", top: 60, left: 10, size: "sm", opacity: 50 },
      ]}
      chips={["小腸: 菌すくない", "大腸: 菌のおうち"]}
    />
  );
}
