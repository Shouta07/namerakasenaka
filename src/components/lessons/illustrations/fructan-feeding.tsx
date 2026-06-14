import { LessonHero } from "./_atoms";

/** Lesson 3 — フルクタン */
export function FructanFeedingIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="soft-brand"
      hero="🌾"
      caption="フルクタン"
      accents={[
        { emoji: "🧅", top: 22, left: 18, size: "lg", opacity: 75, rotate: -6 },
        { emoji: "🧄", top: 22, left: 80, size: "md", opacity: 70, rotate: 8 },
        { emoji: "🍞", top: 78, left: 22, size: "md", opacity: 65, rotate: -10 },
        { emoji: "🥯", top: 78, left: 78, size: "md", opacity: 60, rotate: 6 },
        { emoji: "✨", top: 50, left: 92, size: "sm", opacity: 60 },
      ]}
      chips={["小腸で吸収されにくい", "大腸で発酵 → ガス"]}
    />
  );
}
