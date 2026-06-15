"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  EXCIA_DOCTOR_LABEL,
  LESSON_TOTAL,
  type Lesson,
} from "@/lib/lessons/fixtures";
import { cn } from "@/lib/utils/cn";
import {
  bumpStoredLessonRevisit,
  markStoredLessonCompleted,
} from "@/lib/demo/store";
import { lessonIllustration } from "./illustrations";

/**
 * 🌱 「腸のおはなし」 — レッスン本体（BottomSheet）。
 *
 * - 上: 「Lesson n / 7」 + アイコン + タイトル + 監修チップ。
 * - 中: cards を縦に積む（仕切り線）。
 * - 末: 3択クイズ。タップで explanation を表示。
 * - 「わかった！」 で markStoredLessonCompleted（初回） or bumpStoredLessonRevisit（再訪）。
 *
 * クイズの不正解は決して責めない。explanation は fixtures 側で十分やさしく
 * 書いてあるので、ここはトーストと進行制御だけに専念する。
 */
export function LessonSheet({
  lesson,
  guideCustomerId,
  alreadyCompleted,
  onClose,
  onCompleted,
}: {
  lesson: Lesson;
  guideCustomerId: string;
  /** true なら revisit カウントだけが増える（completedAt は変えない）。 */
  alreadyCompleted: boolean;
  onClose: () => void;
  /** わかった！ タップ後に呼ばれる。親が次のレッスンへ進めるためのフック。 */
  onCompleted: (lessonId: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const Illustration = lessonIllustration(lesson.id);

  function handleSelect(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  }

  function handleDone() {
    if (alreadyCompleted) {
      bumpStoredLessonRevisit({
        guideCustomerId,
        lessonId: lesson.id,
      });
      toast("もう一度読みました 🌱");
    } else {
      const correct = selected === lesson.quiz.correctIndex;
      const { firstCompletion } = markStoredLessonCompleted({
        guideCustomerId,
        lessonId: lesson.id,
        quizCorrectFirstTry: correct,
      });
      if (firstCompletion) {
        toast.success(
          `${lesson.badge.emoji} 「${lesson.badge.name}」 を獲得しました！`,
        );
      } else {
        toast.success("🌱 種をひとつ獲得しました");
      }
    }
    onCompleted(lesson.id);
    onClose();
  }

  return (
    <BottomSheet open={true} onClose={onClose}>
      <div className="flex flex-col gap-4 pb-24">
        {/* ヘッダ */}
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {EXCIA_DOCTOR_LABEL}
          </div>
          <p className="text-xs text-stone-500">
            Lesson {lesson.order} / {LESSON_TOTAL}
          </p>
          <h2 className="flex items-center gap-2 text-lg font-semibold leading-snug text-stone-900">
            <span aria-hidden className="text-2xl">
              {lesson.icon}
            </span>
            {lesson.title}
          </h2>
        </header>

        {/* フル幅イラスト（ムードカードが自己完結） */}
        {Illustration ? (
          <Illustration className="w-full" />
        ) : null}

        {/* カード本体 */}
        <div className="divide-y divide-stone-100 rounded-2xl border border-stone-100 bg-[#fafcfa]">
          {lesson.cards.map((c, i) => (
            <article key={i} className="space-y-1.5 px-4 py-4">
              <h3 className="text-sm font-semibold text-stone-800">{c.heading}</h3>
              <p className="text-base leading-relaxed text-stone-700">{c.body}</p>
            </article>
          ))}
        </div>

        {/* クイズ */}
        <section className="space-y-3 rounded-2xl border border-[#cfe3cf] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
            まとめのひとくちクイズ
          </p>
          <p className="text-base font-medium leading-snug text-stone-800">
            {lesson.quiz.question}
          </p>
          <ul className="space-y-2">
            {lesson.quiz.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === lesson.quiz.correctIndex;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelect(i)}
                    disabled={revealed}
                    className={cn(
                      "flex w-full min-h-12 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-base leading-snug transition",
                      !revealed &&
                        "border-stone-200 bg-white hover:border-[#cfe3cf] hover:bg-[#f3f8f3]",
                      revealed && isCorrect &&
                        "border-[#5d8a6c] bg-[#eaf3ea] text-[#3c6347]",
                      revealed && isSelected && !isCorrect &&
                        "border-stone-300 bg-stone-50 text-stone-700",
                      revealed && !isSelected && !isCorrect &&
                        "border-stone-100 bg-white text-stone-500",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-semibold",
                        revealed && isCorrect
                          ? "bg-[#5d8a6c] text-white"
                          : "bg-stone-100 text-stone-600",
                      )}
                    >
                      {revealed && isCorrect ? "○" : String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {revealed ? (
            <p className="rounded-xl bg-[#f3f8f3] p-3 text-sm leading-relaxed text-[#3c6347]">
              {lesson.quiz.explanation}
            </p>
          ) : (
            <p className="text-xs text-stone-400">
              答えは1つ。当たっても外れても、種は受け取れます 🌱
            </p>
          )}
        </section>
      </div>

      {/* sticky 「わかった！」 */}
      <div className="sticky bottom-0 left-0 right-0 -mx-5 border-t border-stone-100 bg-white/95 px-5 pt-3 pb-1 backdrop-blur">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!revealed && !alreadyCompleted}
          onClick={handleDone}
        >
          {alreadyCompleted ? "読み返しました" : "わかった！"}
        </Button>
        {!revealed && !alreadyCompleted ? (
          <p className="mt-1 text-center text-[11px] text-stone-400">
            まずクイズに答えてみてください
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
