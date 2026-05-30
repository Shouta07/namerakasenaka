"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CaseCard } from "./case-card";
import {
  CaseFilterPanel,
  EMPTY_FILTER,
  applyCaseFilter,
  type CaseFilterState,
} from "./filter-panel";
import { useCaseTags, useCases } from "@/lib/cases/source";
import {
  computeAgeBand,
  rankCases,
  scoreToDisplay,
} from "@/lib/cases/similarity";
import type {
  AgeBand,
  CaseGender,
  CaseSeverity,
} from "@/lib/cases/types";

export type CaseSearchViewProps = {
  basePath: string;
};

export function CaseSearchView({ basePath }: CaseSearchViewProps) {
  const router = useRouter();
  const params = useSearchParams();
  const cases = useCases();
  const tags = useCaseTags();
  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const [filter, setFilter] = useState<CaseFilterState>(() =>
    seedFromParams(params),
  );

  // Re-seed when URL changes (e.g., deep link from customer detail).
  useEffect(() => {
    setFilter(seedFromParams(params));
  }, [params]);

  const filtered = useMemo(() => applyCaseFilter(cases, filter), [cases, filter]);

  const ranked = useMemo(
    () =>
      rankCases(filtered, {
        tagIds: filter.tagIds,
        severity: filter.severity ?? undefined,
        ageBand: filter.ageBand ?? undefined,
        concernDuration: filter.concernDuration ?? undefined,
      }),
    [filtered, filter],
  );

  const top = ranked[0]?.case;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">症例検索</h1>
          <p className="mt-0.5 text-xs text-stone-500">
            類似度順に並び替えてカウンセリングで活用
          </p>
        </div>
        {top ? (
          <Link
            href={`/counseling/${top.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-1 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white"
          >
            <Presentation className="h-4 w-4" />
            カウンセリング開始
          </Link>
        ) : null}
      </header>

      {hasPreset(params) ? (
        <Card>
          <CardContent>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              現在のお客様に近い症例
            </p>
            <p className="mt-1 text-xs text-stone-600">
              お客様のプロフィールから検索条件を自動設定しました。下のフィルターで調整できます。
            </p>
            <div className="mt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilter(EMPTY_FILTER);
                  router.replace(`${basePath}/search`);
                }}
              >
                条件をリセット
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <CaseFilterPanel
          value={filter}
          onChange={setFilter}
          tags={tags}
        />
        <div>
          <p className="mb-3 text-xs text-stone-500">
            {ranked.length} 件 / 全 {cases.length} 件（類似度順）
          </p>
          {ranked.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              該当する症例が見つかりませんでした。
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ranked.map((r) => (
                <CaseCard
                  key={r.case.id}
                  case={r.case}
                  tagsById={tagsById}
                  score={scoreToDisplay(r.score)}
                  href={`${basePath}/${r.case.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function hasPreset(params: URLSearchParams | ReturnType<typeof useSearchParams>): boolean {
  for (const k of ["age", "ageBand", "severity", "gender", "tags", "concernDuration"]) {
    if (params.get(k)) return true;
  }
  return false;
}

function seedFromParams(
  params: URLSearchParams | ReturnType<typeof useSearchParams>,
): CaseFilterState {
  const ageStr = params.get("age");
  const age = ageStr ? Number(ageStr) : null;
  const explicitBand = params.get("ageBand") as AgeBand | null;
  const ageBand: AgeBand | null =
    explicitBand ?? (age != null ? computeAgeBand(age) : null);
  const severity = params.get("severity") as CaseSeverity | null;
  const gender = params.get("gender") as CaseGender | null;
  const concernDuration = params.get("concernDuration");
  const tagsRaw = params.get("tags");
  const tagIds = tagsRaw ? tagsRaw.split(",").filter(Boolean) : [];
  return {
    ...EMPTY_FILTER,
    ageBand,
    gender,
    severity,
    concernDuration,
    tagIds,
  };
}
