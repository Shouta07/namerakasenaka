import { LessonHero } from "./_atoms";

/** Lesson 4 — 乳酸菌が逆効果になることもある */
export function OvercrowdingIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="rose-cream"
      hero="🥛"
      accents={[
        { emoji: "🦠", top: 18, left: 18, size: "md", opacity: 65 },
        { emoji: "🦠", top: 24, left: 82, size: "sm", opacity: 55 },
        { emoji: "🦠", top: 78, left: 20, size: "md", opacity: 60 },
        { emoji: "🦠", top: 80, left: 78, size: "sm", opacity: 60 },
        { emoji: "💨", top: 40, left: 90, size: "md", opacity: 60 },
        { emoji: "💨", top: 60, left: 8, size: "sm", opacity: 55 },
      ]}
      chips={["まずは今の腸を知ること", "順番が大切"]}
    />
  );
}
