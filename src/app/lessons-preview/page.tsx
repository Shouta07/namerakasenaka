/**
 * 全7レッスンのイラストとタイトルを 1 ページで俯瞰するプレビュー画面。
 * 商談前のクライアント確認用。public path（middleware で /lessons-preview を許可）。
 */
import Link from "next/link";
import { LESSONS } from "@/lib/lessons/fixtures";
import { lessonIllustration } from "@/components/lessons/illustrations";

export const dynamic = "force-static";

export const metadata = {
  title: "腸のおはなし — 全7レッスン プレビュー | Senacare",
};

export default function LessonsPreviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
          Lesson Illustrations Preview
        </p>
        <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
          腸のおはなし — 全 7 レッスンの図解
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          医師監修。なめらかせなか向け回復ガイドのゲーミフィケーション学習コース。
        </p>
        <p className="mt-2 text-xs text-stone-400">
          本ページは社内・三社レビュー用プレビューです
        </p>
      </header>

      <div className="space-y-12">
        {LESSONS.map((lesson) => {
          const Illustration = lessonIllustration(lesson.id);
          return (
            <article
              key={lesson.id}
              className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="border-b border-stone-100 bg-stone-50/60 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-base font-semibold text-brand-700">
                    {lesson.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Lesson {lesson.order} / 7
                    </p>
                    <h2 className="mt-0.5 text-lg font-semibold text-stone-900">
                      {lesson.icon} {lesson.title}
                    </h2>
                  </div>
                  <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 sm:inline-flex">
                    {lesson.badge.emoji} {lesson.badge.name}
                  </span>
                </div>
              </div>

              <div className="px-6 py-8">
                {Illustration ? (
                  <Illustration className="w-full" />
                ) : (
                  <p className="text-center text-xs text-stone-400">
                    （イラスト未設定）
                  </p>
                )}
              </div>

              <div className="space-y-3 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  内容（{lesson.cards.length} カード）
                </p>
                {lesson.cards.map((card, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-stone-100 bg-stone-50/40 p-3"
                  >
                    <p className="text-sm font-semibold text-stone-800">
                      {card.heading}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {card.body}
                    </p>
                  </div>
                ))}

                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    なるほどクイズ
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-800">
                    Q. {lesson.quiz.question}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {lesson.quiz.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-2 rounded-lg px-2 py-1 text-xs ${
                          idx === lesson.quiz.correctIndex
                            ? "bg-white text-emerald-800 ring-1 ring-emerald-200"
                            : "text-stone-600"
                        }`}
                      >
                        <span className="font-mono text-[10px]">
                          {idx === lesson.quiz.correctIndex ? "✅" : "○"}
                        </span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
                    {lesson.quiz.explanation}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="mt-12 border-t border-stone-200 pt-6 text-center">
        <p className="text-xs text-stone-500">
          実機で体験する場合は{" "}
          <Link
            href="/share/tamura-demo-2026?presenter=1"
            className="text-brand-700 underline"
          >
            /share/tamura-demo-2026
          </Link>{" "}
          を開き、「腸のおはなし」セクションから各レッスンをタップしてください。
        </p>
      </footer>
    </main>
  );
}
