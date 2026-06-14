import { describe, expect, it } from "vitest";
import {
  LESSONS,
  LESSON_TOTAL,
  EXCIA_DOCTOR_LABEL,
  LESSON_AUTHOR_LABEL,
} from "@/lib/lessons/fixtures";
import {
  completedCount,
  completedLessonIds,
  earnedBadges,
  lessonsWithStatus,
  nextRecommendedLesson,
  learningStreak,
  completionFraction,
} from "@/lib/lessons/progress";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import type { LessonProgress } from "@/lib/demo/store";

const CUST = "guide-tamura-demo";
const isoDaysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

function p(lessonId: string, daysAgo: number, quizCorrectFirstTry = true): LessonProgress {
  return {
    guideCustomerId: CUST,
    lessonId,
    completedAt: isoDaysAgo(daysAgo),
    quizCorrectFirstTry,
    revisitCount: 0,
  };
}

describe("lesson fixtures — shape & 監修クレジット", () => {
  it("ships exactly 7 lessons", () => {
    expect(LESSONS).toHaveLength(7);
    expect(LESSON_TOTAL).toBe(7);
  });

  it("lessons are ordered 1..7 with unique ids and badges", () => {
    const orders = LESSONS.map((l) => l.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(7);
    expect(new Set(LESSONS.map((l) => l.badge.id)).size).toBe(7);
  });

  it("doctor credit label is exported under both names", () => {
    expect(EXCIA_DOCTOR_LABEL).toContain("エクシアクリニック");
    expect(LESSON_AUTHOR_LABEL).toBe(EXCIA_DOCTOR_LABEL);
  });

  it("every quiz has 3 options and a valid correctIndex", () => {
    for (const l of LESSONS) {
      expect(l.quiz.options).toHaveLength(3);
      expect(l.quiz.correctIndex).toBeGreaterThanOrEqual(0);
      expect(l.quiz.correctIndex).toBeLessThan(3);
      expect(l.quiz.options[l.quiz.correctIndex]).toBeTruthy();
    }
  });

  it("every card body is meaningful (40-180 chars)", () => {
    for (const l of LESSONS) {
      for (const c of l.cards) {
        expect(c.heading.length, `${l.id}: heading "${c.heading}"`).toBeGreaterThan(0);
        expect(c.body.length, `${l.id}: card body`).toBeGreaterThanOrEqual(40);
        expect(c.body.length, `${l.id}: card body`).toBeLessThanOrEqual(180);
      }
    }
  });
});

describe("lesson copy — banned-word filter", () => {
  it("every lesson title / card / quiz / explanation passes §8.2 + §17", () => {
    for (const l of LESSONS) {
      const fields = [
        l.title,
        ...l.cards.flatMap((c) => [c.heading, c.body]),
        l.quiz.question,
        ...l.quiz.options,
        l.quiz.explanation,
      ];
      for (const f of fields) {
        const check = containsBannedWord(f);
        expect(
          check.hits,
          `${l.id}: "${f.slice(0, 24)}…" → ${check.hits.join(", ")}`,
        ).toEqual([]);
      }
    }
  });
});

describe("lesson-progress helpers", () => {
  it("empty progress → zero done, all badges locked, lesson 1 recommended", () => {
    expect(completedCount([])).toBe(0);
    expect(completedLessonIds([]).size).toBe(0);
    expect(earnedBadges([])).toEqual([]);
    const next = nextRecommendedLesson([]);
    expect(next?.order).toBe(1);
    expect(completionFraction([])).toEqual({ done: 0, total: 7 });
  });

  it("with lessons 1-3 done, recommended is lesson 4 and 3 badges are earned", () => {
    const progress = [
      p(LESSONS[0].id, 6),
      p(LESSONS[1].id, 4),
      p(LESSONS[2].id, 2, false),
    ];
    expect(completedCount(progress)).toBe(3);
    expect(earnedBadges(progress)).toHaveLength(3);
    expect(earnedBadges(progress)[0].id).toBe(LESSONS[0].badge.id);
    expect(nextRecommendedLesson(progress)?.order).toBe(4);
  });

  it("lessonsWithStatus preserves order regardless of progress insertion order", () => {
    const progress = [p(LESSONS[6].id, 1), p(LESSONS[0].id, 5)];
    const rows = lessonsWithStatus(progress);
    expect(rows.map((r) => r.lesson.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(rows[0].completed).toBe(true);
    expect(rows[6].completed).toBe(true);
    expect(rows[3].completed).toBe(false);
  });

  it("all 7 done → no next recommendation", () => {
    const progress = LESSONS.map((l, i) => p(l.id, 7 - i));
    expect(nextRecommendedLesson(progress)).toBeNull();
    expect(earnedBadges(progress)).toHaveLength(7);
  });

  it("learning streak counts distinct days backward from today/yesterday", () => {
    const today = new Date();
    const progress = [p(LESSONS[0].id, 0), p(LESSONS[1].id, 1), p(LESSONS[2].id, 2)];
    expect(learningStreak(progress, today)).toBe(3);
  });

  it("learning streak is zero when the latest day is older than yesterday", () => {
    const progress = [p(LESSONS[0].id, 4)];
    expect(learningStreak(progress, new Date())).toBe(0);
  });
});
