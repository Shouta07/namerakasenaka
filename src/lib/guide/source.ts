/**
 * Recovery guide — unified read helpers merging demo fixtures with the
 * localStorage store. Mirrors src/lib/cases/source.ts:
 *
 * - Fixtures render on the server (SSR-safe, no localStorage).
 * - Client hooks merge fixtures + stored rows, deduped by id, stored wins.
 * - Daily checks dedupe on (guideCustomerId, date), stored wins.
 */

"use client";

import { useMemo } from "react";
import {
  useStoredDailyChecks,
  useStoredGuideCustomers,
  useStoredHealthRecords,
  type StoredDailyCheck,
  type StoredGuideCustomer,
  type StoredHealthRecord,
} from "@/lib/demo/store";
import {
  DEMO_DAILY_CHECKS,
  DEMO_GUIDE_CUSTOMERS,
  DEMO_HEALTH_RECORDS,
} from "@/lib/demo/recovery-fixtures";

export type GuideCustomerRecord = StoredGuideCustomer;
export type HealthRecordRecord = StoredHealthRecord;
export type DailyCheckRecord = StoredDailyCheck;

export function useGuideCustomers(): GuideCustomerRecord[] {
  const stored = useStoredGuideCustomers();
  return useMemo(() => {
    const byId = new Map<string, GuideCustomerRecord>();
    for (const c of DEMO_GUIDE_CUSTOMERS) byId.set(c.id, c);
    for (const s of stored) byId.set(s.id, s);
    return Array.from(byId.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [stored]);
}

export function useGuideCustomer(id: string): GuideCustomerRecord | null {
  const all = useGuideCustomers();
  return all.find((c) => c.id === id) ?? null;
}

export function useGuideCustomerByToken(token: string): GuideCustomerRecord | null {
  const all = useGuideCustomers();
  return all.find((c) => c.shareToken === token) ?? null;
}

export function useHealthRecords(): HealthRecordRecord[] {
  const stored = useStoredHealthRecords();
  return useMemo(() => {
    const byId = new Map<string, HealthRecordRecord>();
    for (const r of DEMO_HEALTH_RECORDS) byId.set(r.id, r);
    for (const s of stored) byId.set(s.id, s);
    return Array.from(byId.values());
  }, [stored]);
}

/** Latest health record for a guide customer (there is normally exactly one). */
export function useHealthRecordFor(
  guideCustomerId: string | null,
): HealthRecordRecord | null {
  const all = useHealthRecords();
  if (!guideCustomerId) return null;
  const matches = all
    .filter((r) => r.guideCustomerId === guideCustomerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return matches[0] ?? null;
}

export function useDailyChecksFor(
  guideCustomerId: string | null,
): DailyCheckRecord[] {
  const stored = useStoredDailyChecks();
  return useMemo(() => {
    if (!guideCustomerId) return [];
    const byDate = new Map<string, DailyCheckRecord>();
    for (const c of DEMO_DAILY_CHECKS) {
      if (c.guideCustomerId === guideCustomerId) byDate.set(c.date, c);
    }
    for (const s of stored) {
      if (s.guideCustomerId === guideCustomerId) byDate.set(s.date, s);
    }
    return Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [stored, guideCustomerId]);
}

/** YYYY-MM-DD of the device's local "today" — the check-in granularity. */
export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
