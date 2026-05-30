"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { BackPhotoPlaceholder } from "@/components/progress/back-photo-placeholder";
import { useCaseTags, useCases } from "@/lib/cases/source";
import { SEVERITY_LABEL, type CaseTag } from "@/lib/cases/types";

export type CounselingViewProps = {
  caseId: string;
};

/**
 * Full-bleed, no-nav, PII-stripped display for in-room counseling.
 *
 * Hidden in this mode: anonymous_id, occupation, staff_memo.
 * Shown big: Before/After, 改善期間, 施術回数, 主な悩み, 重症度, タグ,
 *           カウンセリングコメント.
 */
export function CounselingView({ caseId }: CounselingViewProps) {
  const cases = useCases();
  const tags = useCaseTags();
  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const c = cases.find((x) => x.id === caseId);
  const params = useSearchParams();

  if (!c) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#fafaf7] px-6 text-center">
        <div>
          <p className="text-sm text-stone-500">症例が見つかりません。</p>
          <Link href="/" className="mt-3 inline-block text-sm underline">
            ホームへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#fafaf7] text-stone-900">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 py-6 md:px-12 md:py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <BeforeAfter
            label="Before"
            imageUrl={c.beforeImageUrl}
            fallbackSeverity={c.beforeSeverity ?? (c.severity === "heavy" ? "high" : "medium")}
            lighting={c.beforeLighting ?? "cool"}
          />
          <BeforeAfter
            label="After"
            imageUrl={c.afterImageUrl}
            fallbackSeverity={c.afterSeverity ?? (c.severity === "heavy" ? "low" : "clear")}
            lighting={c.afterLighting ?? "warm"}
          />
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <MetricTile label="改善期間" value={c.improvementPeriod} />
          <MetricTile label="施術回数" value={`${c.treatmentCount} 回`} />
          <MetricTile label="重症度" value={SEVERITY_LABEL[c.severity]} />
        </section>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            主な悩み
          </p>
          <p className="mt-2 text-xl leading-relaxed text-stone-900 md:text-2xl">
            {c.mainConcern}
          </p>
          <TagsRow tagIds={c.tagIds} tagsById={tagsById} />
        </section>

        <section className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/40 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            ご案内
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xl leading-relaxed text-stone-900 md:text-2xl">
            {c.counselingComment}
          </p>
        </section>

        <NavRow params={params} />

        <footer className="mt-10 rounded-2xl bg-stone-100 px-6 py-4 text-center text-xs text-stone-600 md:text-sm">
          ※ 効果には個人差があります。本資料は個別の効果効能を保証するものではありません。
        </footer>
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-4 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
        カウンセリング表示
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/cases/search"
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
        >
          別の症例を見る
        </Link>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              if (window.opener) window.close();
              else window.history.back();
            }
          }}
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
        >
          <X className="h-3.5 w-3.5" />
          閉じる
        </button>
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-stone-900 md:text-3xl">{value}</p>
    </div>
  );
}

function TagsRow({
  tagIds,
  tagsById,
}: {
  tagIds: string[];
  tagsById: Map<string, CaseTag>;
}) {
  const tagList = tagIds.map((id) => tagsById.get(id)).filter((t): t is CaseTag => Boolean(t));
  if (tagList.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tagList.map((t) => (
        <span
          key={t.id}
          className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
        >
          {t.name}
        </span>
      ))}
    </div>
  );
}

function NavRow({ params }: { params: ReturnType<typeof useSearchParams> }) {
  // If the link came from search results we expose prev/next by query.
  // For MVP we only show a "back to search" affordance unless an `i` param exists.
  const from = params.get("from");
  if (from !== "search") return null;
  return (
    <div className="mt-8 flex items-center justify-between">
      <Link
        href="/admin/cases/search"
        className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
      >
        <ChevronLeft className="h-4 w-4" />
        検索結果へ戻る
      </Link>
      <Link
        href="/admin/cases/search"
        className="inline-flex h-10 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
      >
        次の症例
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function BeforeAfter({
  label,
  imageUrl,
  fallbackSeverity,
  lighting,
}: {
  label: string;
  imageUrl: string | null;
  fallbackSeverity: "high" | "medium" | "low" | "clear";
  lighting: "cool" | "warm";
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800 shadow">
        {label}
      </span>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={label} className="block aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="aspect-[3/4] w-full">
          <BackPhotoPlaceholder
            severity={fallbackSeverity}
            lighting={lighting}
            caption={label}
          />
        </div>
      )}
    </div>
  );
}
