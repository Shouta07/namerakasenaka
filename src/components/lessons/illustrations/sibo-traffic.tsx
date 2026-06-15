import { LessonHero } from "./_atoms";

/** Lesson 2 — 菌の渋滞 SIBO */
export function SiboTrafficIllustration({ className }: { className?: string }) {
  return (
    <LessonHero
      className={className}
      gradient="warm-amber"
      hero="🚦"
      accents={[
        { emoji: "💨", top: 18, left: 22, size: "md", opacity: 70 },
        { emoji: "💨", top: 14, left: 76, size: "lg", opacity: 60 },
        { emoji: "💨", top: 36, left: 90, size: "sm", opacity: 50 },
        { emoji: "🦠", top: 70, left: 18, size: "md", opacity: 65 },
        { emoji: "🦠", top: 80, left: 50, size: "sm", opacity: 55 },
        { emoji: "🦠", top: 72, left: 82, size: "md", opacity: 60 },
      ]}
      chips={["小腸に菌が逆流", "ガスが発生"]}
    />
  );
}
