/**
 * Shared types for the case library.
 *
 * Mirrors the `cases` + `case_tags_master` + `case_tag_assignments` schema
 * from migration 0008. The demo path stores these in localStorage; the
 * production path will hydrate them from Supabase with identical shape.
 */

export type CaseGender = "female" | "male" | "other" | "no_answer";
export type CaseSeverity = "light" | "medium" | "heavy";
export type AgeBand = "under_25" | "25_34" | "35_44" | "45_plus";

import type { BackPhotoSeverity, BackPhotoLighting } from "@/components/progress/back-photo-placeholder";

export type CaseRecord = {
  id: string;
  organizationId: string;
  anonymousId: string;
  age: number | null;
  gender: CaseGender | null;
  occupation: string | null;
  concernDuration: string | null;
  mainConcern: string;
  firstVisitDate: string | null;
  treatmentCount: number;
  improvementPeriod: string;
  severity: CaseSeverity;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  staffMemo: string | null;
  counselingComment: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
  /** Optional placeholder hints, used when before/after URLs are null. */
  beforeSeverity?: BackPhotoSeverity;
  afterSeverity?: BackPhotoSeverity;
  beforeLighting?: BackPhotoLighting;
  afterLighting?: BackPhotoLighting;
};

export type CaseTag = {
  id: string;
  organizationId: string;
  name: string;
  sortOrder: number;
};

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  under_25: "25歳未満",
  "25_34": "25〜34歳",
  "35_44": "35〜44歳",
  "45_plus": "45歳以上",
};

export const SEVERITY_LABEL: Record<CaseSeverity, string> = {
  light: "軽度",
  medium: "中度",
  heavy: "重度",
};

export const GENDER_LABEL: Record<CaseGender, string> = {
  female: "女性",
  male: "男性",
  other: "その他",
  no_answer: "回答なし",
};

export const CONCERN_DURATION_OPTIONS: readonly string[] = [
  "半年未満",
  "半年〜1年",
  "1〜3年",
  "3年以上",
] as const;

export const IMPROVEMENT_PERIOD_OPTIONS: readonly string[] = [
  "1ヶ月",
  "2ヶ月",
  "3ヶ月",
  "6ヶ月",
  "9ヶ月",
  "12ヶ月以上",
] as const;
