"use client";

import { BookOpen, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LESSONS, LESSON_TOTAL } from "@/lib/lessons/fixtures";
import { useLessonProgressFor } from "@/lib/lessons/source";

/**
 * 🌱 /admin/customers/[id] に表示する「学習進捗」セクション。
 *
 * 「全7回中 {n}回 完了」 + 完了済みレッスン一覧（タイトル + 完了日 + 初回正解の小バッジ）。
 * サロン側スタッフが、次回カウンセリングで触れる話題を選びやすくするための小さな窓。
 */
export function AdminLessonProgressSection({
  guideCustomerId,
}: {
  guideCustomerId: string;
}) {
  const progress = useLessonProgressFor(guideCustomerId);
  const byId = new Map(progress.map((p) => [p.lessonId, p]));
  const done = LESSONS.filter((l) => byId.has(l.id));
  const doneCount = done.length;

  return (
    <Card>
      <CardContent className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
            <BookOpen className="h-4 w-4 text-[#5d8a6c]" aria-hidden />
            学習進捗（腸のおはなし）
          </h2>
          <span className="text-xs font-medium text-[#3c6347]">
            全{LESSON_TOTAL}回中 {doneCount}回 完了
          </span>
        </header>

        {/* 7-dot mini progress */}
        <div className="flex items-center gap-1.5">
          {LESSONS.map((l) => (
            <span
              key={l.id}
              title={l.title}
              className={
                "h-2 flex-1 rounded-full " +
                (byId.has(l.id) ? "bg-[#5d8a6c]" : "bg-stone-200")
              }
            />
          ))}
        </div>

        {done.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 px-3 py-4 text-center text-xs text-stone-500">
            まだレッスンは始まっていません。
          </p>
        ) : (
          <ul className="space-y-1.5">
            {done.map((l) => {
              const p = byId.get(l.id)!;
              const date = new Date(p.completedAt).toLocaleDateString("ja-JP", {
                month: "numeric",
                day: "numeric",
              });
              return (
                <li
                  key={l.id}
                  className="flex items-center gap-2 text-xs text-stone-700"
                >
                  <Check className="h-3 w-3 flex-none text-[#5d8a6c]" aria-hidden />
                  <span className="flex-1 truncate">
                    Lesson {l.order} ・ {l.title}
                  </span>
                  <span className="text-stone-400">{date}</span>
                  {p.quizCorrectFirstTry ? (
                    <span
                      title="初回クイズ正解"
                      className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700"
                    >
                      ◎
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
