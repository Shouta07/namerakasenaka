"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ExternalLink, Pencil, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BackPhotoPlaceholder } from "@/components/progress/back-photo-placeholder";
import { useCaseTags, useCases } from "@/lib/cases/source";
import {
  AGE_BAND_LABEL,
  GENDER_LABEL,
  SEVERITY_LABEL,
  type CaseTag,
} from "@/lib/cases/types";
import { computeAgeBand } from "@/lib/cases/similarity";
import { cn } from "@/lib/utils/cn";

export type CaseDetailViewProps = {
  caseId: string;
  basePath: string;
};

export function CaseDetailView({ caseId, basePath }: CaseDetailViewProps) {
  const cases = useCases();
  const tags = useCaseTags();
  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const c = cases.find((x) => x.id === caseId);

  if (!c) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
        症例が見つかりません。
      </div>
    );
  }

  const band = computeAgeBand(c.age);
  const tagList = c.tagIds
    .map((id) => tagsById.get(id))
    .filter((t): t is CaseTag => Boolean(t));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-stone-500">症例 ID</p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900">{c.anonymousId}</h1>
            {c.age != null ? (
              <Badge tone="neutral">
                {c.age}歳{band ? `（${AGE_BAND_LABEL[band]}）` : ""}
              </Badge>
            ) : null}
            {c.gender ? (
              <Badge tone="neutral">{GENDER_LABEL[c.gender]}</Badge>
            ) : null}
            <Badge
              tone={
                c.severity === "heavy"
                  ? "danger"
                  : c.severity === "medium"
                    ? "warning"
                    : "success"
              }
            >
              {SEVERITY_LABEL[c.severity]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/${c.id}/edit`}
            className="inline-flex h-11 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
          >
            <Pencil className="h-3.5 w-3.5" />
            編集
          </Link>
          <Link
            href={`/counseling/${c.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-1 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
          >
            <Presentation className="h-4 w-4" />
            カウンセリングモードで開く
          </Link>
        </div>
      </header>

      <p className="text-[11px] text-stone-500">
        <Link
          href={`/counseling/${c.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline"
        >
          <ExternalLink className="h-3 w-3" />
          新しいタブで開く
        </Link>
      </p>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-stone-900">Before / After</h2>
          <p className="mt-1 text-[11px] text-stone-500">タップで拡大（カウンセリングモードで全画面表示）</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <BeforeAfterCell
              label="Before"
              imageUrl={c.beforeImageUrl}
              fallbackSeverity={c.beforeSeverity ?? (c.severity === "heavy" ? "high" : "medium")}
              lighting={c.beforeLighting ?? "cool"}
            />
            <BeforeAfterCell
              label="After"
              imageUrl={c.afterImageUrl}
              fallbackSeverity={c.afterSeverity ?? (c.severity === "heavy" ? "low" : "clear")}
              lighting={c.afterLighting ?? "warm"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-stone-900">プロフィール</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Field label="職業" value={c.occupation ?? "—"} />
            <Field label="悩みの期間" value={c.concernDuration ?? "—"} />
            <Field label="初回来店日" value={c.firstVisitDate ?? "—"} />
            <Field label="施術回数" value={`${c.treatmentCount} 回`} />
            <Field label="改善期間" value={c.improvementPeriod} />
            <Field label="重症度" value={SEVERITY_LABEL[c.severity]} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-stone-900">症状タグ</h2>
          {tagList.length === 0 ? (
            <p className="mt-2 text-xs text-stone-500">タグが設定されていません。</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagList.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-stone-900">主な悩み</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-800">{c.mainConcern}</p>
        </CardContent>
      </Card>

      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
          スタッフのみ
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-stone-900">スタッフメモ</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
          {c.staffMemo ?? "（未記入）"}
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-700">
          カウンセリングで表示
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-stone-900">
          カウンセリングコメント
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
          {c.counselingComment}
        </p>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-900">{value}</dd>
    </div>
  );
}

function BeforeAfterCell({
  label,
  imageUrl,
  fallbackSeverity,
  lighting,
  className,
}: {
  label: string;
  imageUrl: string | null;
  fallbackSeverity: "high" | "medium" | "low" | "clear";
  lighting: "cool" | "warm";
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-stone-100", className)}>
      <span className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-stone-700 shadow-sm">
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

