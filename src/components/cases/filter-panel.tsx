"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import {
  AGE_BAND_LABEL,
  CONCERN_DURATION_OPTIONS,
  GENDER_LABEL,
  SEVERITY_LABEL,
  type AgeBand,
  type CaseGender,
  type CaseSeverity,
  type CaseTag,
} from "@/lib/cases/types";

export type CaseFilterState = {
  ageBand: AgeBand | null;
  gender: CaseGender | null;
  concernDuration: string | null;
  severity: CaseSeverity | null;
  tagIds: string[];
  minTreatmentCount: number | null;
  maxTreatmentCount: number | null;
  improvementPeriod: string | null;
};

export const EMPTY_FILTER: CaseFilterState = {
  ageBand: null,
  gender: null,
  concernDuration: null,
  severity: null,
  tagIds: [],
  minTreatmentCount: null,
  maxTreatmentCount: null,
  improvementPeriod: null,
};

export type CaseFilterPanelProps = {
  value: CaseFilterState;
  onChange: (next: CaseFilterState) => void;
  onSearch?: () => void;
  tags: CaseTag[];
  className?: string;
};

const AGE_BANDS: AgeBand[] = ["under_25", "25_34", "35_44", "45_plus"];
const GENDERS: CaseGender[] = ["female", "male", "other", "no_answer"];
const SEVERITIES: CaseSeverity[] = ["light", "medium", "heavy"];

export function CaseFilterPanel({
  value,
  onChange,
  onSearch,
  tags,
  className,
}: CaseFilterPanelProps) {
  function patch(p: Partial<CaseFilterState>) {
    onChange({ ...value, ...p });
  }

  function toggleTag(id: string) {
    const has = value.tagIds.includes(id);
    patch({ tagIds: has ? value.tagIds.filter((t) => t !== id) : [...value.tagIds, id] });
  }

  return (
    <aside
      className={cn(
        "space-y-4 rounded-2xl border border-stone-200 bg-white p-4",
        className,
      )}
    >
      <Section title="年齢帯">
        <ChipGroup>
          {AGE_BANDS.map((b) => (
            <Chip
              key={b}
              selected={value.ageBand === b}
              onClick={() => patch({ ageBand: value.ageBand === b ? null : b })}
            >
              {AGE_BAND_LABEL[b]}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      <Section title="性別">
        <ChipGroup>
          {GENDERS.map((g) => (
            <Chip
              key={g}
              selected={value.gender === g}
              onClick={() => patch({ gender: value.gender === g ? null : g })}
            >
              {GENDER_LABEL[g]}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      <Section title="悩みの期間">
        <ChipGroup>
          {CONCERN_DURATION_OPTIONS.map((d) => (
            <Chip
              key={d}
              selected={value.concernDuration === d}
              onClick={() =>
                patch({ concernDuration: value.concernDuration === d ? null : d })
              }
            >
              {d}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      <Section title="重症度">
        <ChipGroup>
          {SEVERITIES.map((s) => (
            <Chip
              key={s}
              selected={value.severity === s}
              onClick={() => patch({ severity: value.severity === s ? null : s })}
              tone={s === "heavy" ? "danger" : s === "medium" ? "warning" : "success"}
            >
              {SEVERITY_LABEL[s]}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      <Section title="症状タグ">
        <ChipGroup>
          {tags.map((t) => (
            <Chip
              key={t.id}
              selected={value.tagIds.includes(t.id)}
              onClick={() => toggleTag(t.id)}
            >
              {t.name}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      <Section title="施術回数">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="最小"
            value={value.minTreatmentCount ?? ""}
            onChange={(e) =>
              patch({
                minTreatmentCount: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
          <span className="text-xs text-stone-500">〜</span>
          <Input
            type="number"
            min={0}
            placeholder="最大"
            value={value.maxTreatmentCount ?? ""}
            onChange={(e) =>
              patch({
                maxTreatmentCount: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </Section>

      <Section title="改善期間">
        <ChipGroup>
          {["1ヶ月", "2ヶ月", "3ヶ月", "6ヶ月", "9ヶ月", "12ヶ月以上"].map((p) => (
            <Chip
              key={p}
              selected={value.improvementPeriod === p}
              onClick={() =>
                patch({ improvementPeriod: value.improvementPeriod === p ? null : p })
              }
            >
              {p}
            </Chip>
          ))}
        </ChipGroup>
      </Section>

      <div className="flex items-center gap-2 pt-1">
        {onSearch ? (
          <Button type="button" onClick={onSearch} className="flex-1">
            検索
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange(EMPTY_FILTER)}
        >
          クリア
        </Button>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {title}
      </Label>
      {children}
    </div>
  );
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  selected,
  onClick,
  children,
  tone,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "danger" | "warning" | "success";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border px-3.5 text-xs transition-colors",
        selected
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
      )}
    >
      {children}
      {tone && !selected ? (
        <Badge tone={tone} className="ml-1 px-1 py-0 text-[9px]">
          •
        </Badge>
      ) : null}
    </button>
  );
}

// Utilities for applying the filter ------------------------------------------

import type { CaseRecord } from "@/lib/cases/types";
import { computeAgeBand } from "@/lib/cases/similarity";

export function applyCaseFilter(
  cases: CaseRecord[],
  f: CaseFilterState,
): CaseRecord[] {
  return cases.filter((c) => {
    if (f.ageBand && computeAgeBand(c.age) !== f.ageBand) return false;
    if (f.gender && c.gender !== f.gender) return false;
    if (f.concernDuration && c.concernDuration !== f.concernDuration) return false;
    if (f.severity && c.severity !== f.severity) return false;
    if (f.improvementPeriod && c.improvementPeriod !== f.improvementPeriod)
      return false;
    if (f.minTreatmentCount != null && c.treatmentCount < f.minTreatmentCount)
      return false;
    if (f.maxTreatmentCount != null && c.treatmentCount > f.maxTreatmentCount)
      return false;
    if (f.tagIds.length > 0) {
      const set = new Set(c.tagIds);
      for (const id of f.tagIds) if (!set.has(id)) return false;
    }
    return true;
  });
}
