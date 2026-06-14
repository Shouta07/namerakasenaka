/**
 * 🌱 「腸のおはなし」 — レッスン進捗の派生ロジック。
 *
 * UI 層から純粋関数として切り出してあるので、ユニットテストで
 * 並び順・バッジ計算・連続学習日数を直接担保できる。
 */

import { LESSONS, LESSON_TOTAL, type Lesson, type LessonBadge } from "./fixtures";
import type { LessonProgress } from "@/lib/demo/store";

/**
 * 完了済みの lessonId set を返す（O(1) lookup 用）。
 */
export function completedLessonIds(progress: LessonProgress[]): Set<string> {
  return new Set(progress.map((p) => p.lessonId));
}

/**
 * 完了数。0 .. LESSON_TOTAL を返す。
 */
export function completedCount(progress: LessonProgress[]): number {
  return completedLessonIds(progress).size;
}

/**
 * Order 順に並べたレッスン一覧 + completed フラグ。
 * リスト UI と「次のレッスン」決定の両方からこの配列を参照する。
 */
export type LessonWithStatus = {
  lesson: Lesson;
  completed: boolean;
  completedAt: string | null;
  quizCorrectFirstTry: boolean | null;
  revisitCount: number;
};

export function lessonsWithStatus(
  progress: LessonProgress[],
): LessonWithStatus[] {
  const byId = new Map(progress.map((p) => [p.lessonId, p]));
  return [...LESSONS]
    .sort((a, b) => a.order - b.order)
    .map((lesson) => {
      const p = byId.get(lesson.id);
      return {
        lesson,
        completed: !!p,
        completedAt: p?.completedAt ?? null,
        quizCorrectFirstTry: p?.quizCorrectFirstTry ?? null,
        revisitCount: p?.revisitCount ?? 0,
      };
    });
}

/**
 * 「今日のおすすめ」 = order の小さい順で最初に未完了のレッスン。
 * 全完了なら null（UI は「ありがとう」メッセージに切り替わる）。
 */
export function nextRecommendedLesson(
  progress: LessonProgress[],
): Lesson | null {
  const done = completedLessonIds(progress);
  return (
    [...LESSONS]
      .sort((a, b) => a.order - b.order)
      .find((l) => !done.has(l.id)) ?? null
  );
}

/**
 * 獲得したバッジ一覧（order 順）。
 */
export function earnedBadges(progress: LessonProgress[]): LessonBadge[] {
  const done = completedLessonIds(progress);
  return [...LESSONS]
    .sort((a, b) => a.order - b.order)
    .filter((l) => done.has(l.id))
    .map((l) => l.badge);
}

/**
 * 学習連続日数 — distinct な「学習した日（YYYY-MM-DD）」が、
 * 今日を含めて何日連続で続いているか。今日学んでいなくても、
 * 昨日まで続いていれば 0 ではなく「昨日までの連続日数」を返す
 * （DailyCheck の streak と同じ思想：今日を強制しない）。
 */
export function learningStreak(
  progress: LessonProgress[],
  now: Date = new Date(),
): number {
  if (progress.length === 0) return 0;
  const days = new Set(
    progress.map((p) => p.completedAt.slice(0, 10)),
  );

  // 開始日 = 今日 / 今日が空なら昨日 から逆向きにカウント。
  const today = ymd(now);
  let cursor: Date;
  if (days.has(today)) {
    cursor = new Date(now);
  } else {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (!days.has(ymd(y))) return 0;
    cursor = y;
  }
  let streak = 0;
  while (days.has(ymd(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 進捗バーの「{n}/7 完了」ラベルや admin の chip にそのまま使える完了割合。
 */
export function completionFraction(progress: LessonProgress[]): {
  done: number;
  total: number;
} {
  return { done: completedCount(progress), total: LESSON_TOTAL };
}
