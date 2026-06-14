"use client";

import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useLessonProgressFor } from "@/lib/lessons/source";
import { lessonsWithStatus } from "@/lib/lessons/progress";
import type { Lesson } from "@/lib/lessons/fixtures";
import { LESSON_TOTAL } from "@/lib/lessons/fixtures";
import { cn } from "@/lib/utils/cn";
import { lessonIllustration } from "./illustrations";

/**
 * 🌱 「腸のおはなし」 — 全7レッスン一覧（BottomSheet）。
 *
 * 行ごとに: order, icon, title, 完了マーク（バッジ絵文字）。
 * タップで lesson-sheet が開く（親側で順次表示）。
 */
export function LessonList({
  guideCustomerId,
  onClose,
  onOpenLesson,
}: {
  guideCustomerId: string;
  onClose: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}) {
  const progress = useLessonProgressFor(guideCustomerId);
  const items = lessonsWithStatus(progress);
  const doneCount = items.filter((i) => i.completed).length;

  return (
    <BottomSheet open={true} onClose={onClose} title="腸のおはなし — 全7回">
      <p className="mb-3 text-xs text-stone-500">
        {doneCount}/{LESSON_TOTAL} 完了 ・ 気になるレッスンから読めます
      </p>
      <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-100 bg-white">
        {items.map(({ lesson, completed }) => {
          const Thumb = lessonIllustration(lesson.id);
          return (
          <li key={lesson.id}>
            <button
              type="button"
              onClick={() => onOpenLesson(lesson)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-stone-50"
            >
              {Thumb ? (
                <span
                  aria-hidden
                  className={cn(
                    "flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-lg",
                    completed ? "bg-[#eaf3ea]" : "bg-stone-50",
                  )}
                >
                  <Thumb className="h-full w-full" />
                </span>
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "flex h-10 w-10 flex-none items-center justify-center rounded-full text-xl",
                    completed ? "bg-[#eaf3ea]" : "bg-stone-50",
                  )}
                >
                  {lesson.icon}
                </span>
              )}
              <span className="flex-1">
                <span className="block text-[11px] uppercase tracking-widest text-stone-400">
                  Lesson {lesson.order}
                </span>
                <span className="mt-0.5 block text-sm font-medium leading-snug text-stone-800">
                  {lesson.title}
                </span>
              </span>
              {completed ? (
                <span className="flex flex-none items-center gap-1 text-xs text-[#3c6347]">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  <span aria-hidden>{lesson.badge.emoji}</span>
                </span>
              ) : (
                <span className="text-xs text-stone-400">未読</span>
              )}
            </button>
          </li>
          );
        })}
      </ul>
    </BottomSheet>
  );
}
