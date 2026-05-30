"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BackPhotoPlaceholder } from "@/components/progress/back-photo-placeholder";
import { AnonymousAvatar } from "./anonymous-avatar";
import { SEVERITY_LABEL, type CaseRecord, type CaseTag } from "@/lib/cases/types";
import { cn } from "@/lib/utils/cn";

export type CaseCardProps = {
  case: CaseRecord;
  tagsById: Map<string, CaseTag>;
  href: string;
  /** Optional similarity score 0..100 (shown as a chip if present). */
  score?: number;
  className?: string;
};

export function CaseCard({ case: c, tagsById, href, score, className }: CaseCardProps) {
  const tags = c.tagIds
    .map((id) => tagsById.get(id))
    .filter((t): t is CaseTag => Boolean(t));

  const severityTone =
    c.severity === "heavy" ? "danger" : c.severity === "medium" ? "warning" : "success";

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-stone-50",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <AnonymousAvatar id={c.anonymousId} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-stone-900">
              {c.anonymousId}
            </span>
            {c.age != null ? (
              <Badge tone="neutral">{c.age}歳</Badge>
            ) : null}
            <Badge tone={severityTone}>{SEVERITY_LABEL[c.severity]}</Badge>
            {typeof score === "number" ? (
              <Badge tone="brand">類似度 {score}/100</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-stone-500">
            {c.treatmentCount} 回・{c.improvementPeriod}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <BeforeAfter
          label="Before"
          imageUrl={c.beforeImageUrl}
          fallbackSeverity={c.beforeSeverity ?? severityToPlaceholder(c.severity, true)}
          lighting={c.beforeLighting ?? "cool"}
        />
        <BeforeAfter
          label="After"
          imageUrl={c.afterImageUrl}
          fallbackSeverity={c.afterSeverity ?? severityToPlaceholder(c.severity, false)}
          lighting={c.afterLighting ?? "warm"}
        />
      </div>

      <p className="mt-3 line-clamp-1 text-xs text-stone-700">{c.mainConcern}</p>

      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700"
            >
              {t.name}
            </span>
          ))}
          {tags.length > 4 ? (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">
              +{tags.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}

function severityToPlaceholder(
  severity: "light" | "medium" | "heavy",
  before: boolean,
) {
  if (before) return severity === "heavy" ? "high" : severity === "medium" ? "high" : "medium";
  return severity === "heavy" ? "low" : "clear";
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
    <div className="relative overflow-hidden rounded-xl bg-stone-100">
      <span className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-stone-700 shadow-sm">
        {label}
      </span>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={label}
          className="block h-32 w-full object-cover"
        />
      ) : (
        <div className="aspect-[3/4] h-32 w-full">
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
