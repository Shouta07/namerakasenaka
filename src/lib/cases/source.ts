/**
 * Unified read helpers that merge the fixture cases with any user-added
 * cases stored in localStorage.
 *
 * - Server-safe readers return only the fixtures (no localStorage).
 * - Client-side hooks return fixtures + stored, deduped by id, stored wins.
 */

"use client";

import { useMemo } from "react";
import {
  useStoredCaseTags,
  useStoredCases,
  type StoredCase,
  type StoredCaseTag,
} from "@/lib/demo/store";
import { DEMO_CASES, DEMO_CASE_TAGS } from "./fixtures";
import type { CaseRecord, CaseTag } from "./types";

function storedToRecord(s: StoredCase): CaseRecord {
  return {
    id: s.id,
    organizationId: s.organizationId,
    anonymousId: s.anonymousId,
    age: s.age,
    gender: s.gender,
    occupation: s.occupation,
    concernDuration: s.concernDuration,
    mainConcern: s.mainConcern,
    firstVisitDate: s.firstVisitDate,
    treatmentCount: s.treatmentCount,
    improvementPeriod: s.improvementPeriod,
    severity: s.severity,
    beforeImageUrl: s.beforeImageUrl,
    afterImageUrl: s.afterImageUrl,
    staffMemo: s.staffMemo,
    counselingComment: s.counselingComment,
    tagIds: s.tagIds,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

function storedToTag(s: StoredCaseTag): CaseTag {
  return {
    id: s.id,
    organizationId: s.organizationId,
    name: s.name,
    sortOrder: s.sortOrder,
  };
}

export function useCases(): CaseRecord[] {
  const stored = useStoredCases();
  return useMemo(() => {
    const byId = new Map<string, CaseRecord>();
    for (const c of DEMO_CASES) byId.set(c.id, c);
    for (const s of stored) byId.set(s.id, storedToRecord(s));
    return Array.from(byId.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [stored]);
}

export function useCaseTags(): CaseTag[] {
  const stored = useStoredCaseTags();
  return useMemo(() => {
    const byId = new Map<string, CaseTag>();
    for (const t of DEMO_CASE_TAGS) byId.set(t.id, t);
    for (const s of stored) byId.set(s.id, storedToTag(s));
    return Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [stored]);
}

/** Server-safe — only fixtures. */
export function getServerCases(): CaseRecord[] {
  return [...DEMO_CASES];
}

/** Server-safe — only fixtures. */
export function getServerCaseTags(): CaseTag[] {
  return [...DEMO_CASE_TAGS];
}

export function findFixtureCase(id: string): CaseRecord | null {
  return DEMO_CASES.find((c) => c.id === id) ?? null;
}

export function findFixtureTag(id: string): CaseTag | null {
  return DEMO_CASE_TAGS.find((t) => t.id === id) ?? null;
}
