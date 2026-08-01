"use clieninline-flex min-h-11 items-center t";

import { useState } from "react";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { Eyebrow, SoftCard } from "@/components/guide/guide-content";
import { useLessonProgressFor } from "@/lib/lessons/source";
import {
  EXCIA_DOCTOR_LABEL,
  LESSONS,
  LESSON_TOTAL,
  type Lesson,
} from "@/lib/lessons/fixtures";
import {
  completedLessonIds,
  earnedBadges,
  learningStreak,
  nextRecommendedLesson,
} from "@/lib/lessons/progress";
import { LessonSheet } from "./lesson-sheet";
import { LessonList } from "./lesson-list";
import { LessonBadges } from "./lesson-badges";
import { lessonIllustration } from "./illustrations";

/**
 * 🌱 「腸のおはなし」 — 全7回の入口カード。
 *
 * - 7ドットの進捗バー + 完了数キャプション。
 * - 「学びの種」（バッジ数）と「学習連続日数」を並べて表示。
 * - 「今日のおすすめ」 = 次の未完了レッスン（全完了なら感謝メッセージ）。
 * - 「すべてのレッスン →」 でリスト（BottomSheet）を開く。
 *
 * このカードは GuideContent の中で
 * 「きょうのひとつ」 と 「あなたの身体で起きていること」 の間に置かれる。
 */
export const LESSONS_ANCHOR_ID = "intestinal-lessons";

export function LessonsCard({ guideCustomerId }: { guideCustomerId: string }) {
  const progress = useLessonProgressFor(guideCustomerId);
  const done = completedLessonIds(progress);
  const doneCount = done.size;
  const streak = learningStreak(progress);
  const badges = earnedBadges(progress);
  const next = nextRecommendedLesson(progress);

  // Sheet state.
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null);
  const [listOpen, setListOpen] = useState(false);

  function openLessonAndCloseList(lesson: Lesson) {
    setListOpen(false);
    // Defer one frame so the list sheet finishes closing before the lesson opens.
    setTimeout(() => setOpenLesson(lesson), 0);
  }

  function handleLessonClose() {
    setOpenLesson(null);
  }

  /** After completing/re-visiting a lesson, advance to the next uncompleted. */
  function handleLessonCompleted(_finishedId: string) {
    void _finishedId;
    setOpenLesson(null);
  }

  return (
    <SoftCard id={LESSONS_ANCHOR_ID}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        {EXCIA_DOCTOR_LABEL}
      </div>
      <Eyebrow>腸のおはなし — 全7回</Eyebrow>

      {/* 進捗バー */}
      <div className="space-y-2">
        <div
          className="flex items-center gap-1.5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={LESSON_TOTAL}
          aria-valuenow={doneCount}
          aria-label={`${doneCount} / ${LESSON_TOTAL} 完了`}
        >
          {LESSONS.map((l) => {
            const isDone = done.has(l.id);
            return (
              <span
                key={l.id}
                title={l.title}
                className={
                  "h-3 flex-1 rounded-full " +
                  (isDone
                    ? "bg-[#5d8a6c]"
                    : "border border-stone-300 bg-transparent")
                }
              />
            );
          })}
        </div>
        <p className="text-sm text-stone-500">
          {doneCount}/{LESSON_TOTAL} 完了
        </p>
      </div>

      {/* メトリクス */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ea] px-3.5 py-1.5 text-base font-semibold text-[#3c6347]">
          学びの種 {doneCount}🌱
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-1.5 text-base text-stone-700">
          <GraduationCap className="h-4 w-4 text-stone-500" aria-hidden />
          学習連続日数 {streak}日
        </span>
      </div>

      {/* 今日のおすすめレッスン or 完了メッセージ */}
      <div className="mt-5">
        {next ? (
          <button
            type="button"
            onClick={() => setOpenLesson(next)}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-[#cfe3cf] bg-gradient-to-r from-[#f3f8f3] to-white p-4 text-left shadow-sm transition hover:shadow-md"
          >
            {(() => {
              const Thumb = lessonIllustration(next.id);
              return Thumb ? (
                <span className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                  <Thumb className="h-full w-full" />
                </span>
              ) : (
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                  {next.icon}
                </span>
              );
            })()}
            <span className="flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
                今日のおすすめレッスン
              </span>
              <span className="mt-0.5 block text-base font-medium leading-snug text-stone-800">
                Lesson {next.order} ・ {next.title}
              </span>
              <span className="mt-1 block text-xs text-stone-500">
                2-3分で読めます
              </span>
            </span>
            <span className="flex-none rounded-full bg-[#5d8a6c] px-3.5 py-1.5 text-xs font-medium text-white">
              読んでみる →
            </span>
          </button>
        ) : (
          <div className="rounded-2xl bg-[#eaf3ea] p-4 text-base leading-relaxed text-[#3c6347]">
            全部読んでくださってありがとうございます。気になったレッスンはいつでも読み返してくださいね 🌱
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="mt-2 block text-sm font-medium text-[#587f63] underline underline-offset-2"
            >
              読み返す →
            </button>
          </div>
        )}
      </div>

      {/* すべてのレッスン */}
      <div className="mt-4 text-right">
        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[#587f63] underline underline-offset-2"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          すべてのレッスン →
        </button>
      </div>

      {/* バッジ一覧 */}
      <div className="mt-5">
        <LessonBadges earned={badges} />
      </div>

      {/* レッスン本体 (sheet) */}
      {openLesson ? (
        <LessonSheet
          lesson={openLesson}
          guideCustomerId={guideCustomerId}
          alreadyCompleted={done.has(openLesson.id)}
          onClose={handleLessonClose}
          onCompleted={handleLessonCompleted}
        />
      ) : null}

      {/* レッスン一覧 (sheet) */}
      {listOpen ? (
        <LessonList
          guideCustomerId={guideCustomerId}
          onClose={() => setListOpen(false)}
          onOpenLesson={openLessonAndCloseList}
        />
      ) : null}
    </SoftCard>
  );
}
