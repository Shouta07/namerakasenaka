"use client";

import { useMemo } from "react";
import { useStoredLessonProgress, type LessonProgress } from "@/lib/demo/store";
import { DEMO_LESSON_PROGRESS } from "@/lib/demo/recovery-fixtures";

export type LessonProgressRecord = LessonProgress;

/**
 * 🌱 「腸のおはなし」 — レッスン進捗の読み出しヘルパ。
 *
 * - フィクスチャと localStorage 進捗をマージ。
 * - 同じ (guideCustomerId, lessonId) があれば stored を優先（最新の操作を反映）。
 *
 * `lib/guide/source.ts` と同じ思想で、SSR では空配列を返す。
 */
export function useLessonProgressFor(
  guideCustomerId: string | null,
): LessonProgressRecord[] {
  const stored = useStoredLessonProgress(guideCustomerId ?? "");
  return useMemo(() => {
    if (!guideCustomerId) return [];
    const byKey = new Map<string, LessonProgressRecord>();
    const k = (p: LessonProgressRecord) => `${p.guideCustomerId}::${p.lessonId}`;
    for (const p of DEMO_LESSON_PROGRESS) {
      if (p.guideCustomerId === guideCustomerId) byKey.set(k(p), p);
    }
    for (const s of stored) byKey.set(k(s), s);
    return Array.from(byKey.values());
  }, [stored, guideCustomerId]);
}
