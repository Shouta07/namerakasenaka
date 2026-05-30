"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CaseCard } from "./case-card";
import {
  CaseFilterPanel,
  EMPTY_FILTER,
  applyCaseFilter,
  type CaseFilterState,
} from "./filter-panel";
import { useCaseTags, useCases } from "@/lib/cases/source";

export type CaseListViewProps = {
  /** Route base — "/admin/cases" or "/t/cases". */
  basePath: string;
  /** When true, "新規登録" button shown (admin only or both? Both can register). */
  showCreateButton?: boolean;
};

export function CaseListView({ basePath, showCreateButton = true }: CaseListViewProps) {
  const cases = useCases();
  const tags = useCaseTags();
  const tagsById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const [filter, setFilter] = useState<CaseFilterState>(EMPTY_FILTER);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filtered = useMemo(() => applyCaseFilter(cases, filter), [cases, filter]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">症例ライブラリ</h1>
          <p className="mt-0.5 text-xs text-stone-500">
            過去の事例をカウンセリングで活用
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${basePath}/search`}
            className="inline-flex h-11 items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            詳細検索
          </Link>
          {showCreateButton ? (
            <Link
              href={`${basePath}/new`}
              className="inline-flex h-11 items-center gap-1 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              新規
            </Link>
          ) : null}
        </div>
      </header>

      <div className="md:hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setFilterSheetOpen(true)}
        >
          <Filter className="h-4 w-4" />
          フィルター
          {hasActive(filter) ? (
            <span className="ml-1 rounded-full bg-brand-500 px-1.5 text-[10px] text-white">
              ON
            </span>
          ) : null}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden md:block">
          <CaseFilterPanel value={filter} onChange={setFilter} tags={tags} />
        </div>

        <div>
          <p className="mb-3 text-xs text-stone-500">
            {filtered.length} 件 / 全 {cases.length} 件
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              該当する症例が見つかりませんでした。
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CaseCard
                  key={c.id}
                  case={c}
                  tagsById={tagsById}
                  href={`${basePath}/${c.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="フィルター"
      >
        <CaseFilterPanel
          value={filter}
          onChange={setFilter}
          tags={tags}
          onSearch={() => setFilterSheetOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}

function hasActive(f: CaseFilterState): boolean {
  return (
    f.ageBand != null ||
    f.gender != null ||
    f.concernDuration != null ||
    f.severity != null ||
    f.improvementPeriod != null ||
    f.minTreatmentCount != null ||
    f.maxTreatmentCount != null ||
    f.tagIds.length > 0
  );
}
