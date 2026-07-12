"use client";

/**
 * Accord のデモ用 localStorage ストア。
 *
 * senacare 本体の demo/store.ts と同じ思想:
 * - SSR ガード（window が無ければ既定値を返す）
 * - 単一 namespace `accord-demo-v1`
 * - モジュールの増減（トグル）を永続化するのが最重要の責務
 */

import {
  DEFAULT_MODULE_STATE,
  type AccordModuleId,
  type RubricKey,
} from "./fixtures";

const NS_KEY = "accord-demo-v1";

type AccordBlob = {
  modules: Record<AccordModuleId, boolean>;
  roleplayResults: StoredRoleplayResult[];
  lineSends: StoredLineSend[];
  followNotes: StoredFollowNote[];
  copilotDecisions: Record<string, StoredCopilotDecision>;
};

export type StoredCopilotDecision = {
  insightId: string;
  status: "done" | "dismissed";
  at: string;
};

export type StoredRoleplayResult = {
  id: string;
  scenarioId: string;
  score: number;
  passed: RubricKey[];
  at: string;
};

export type StoredLineSend = {
  id: string;
  customerId: string;
  label: string;
  at: string;
};

export type StoredFollowNote = {
  id: string;
  customerId: string;
  body: string;
  at: string;
};

const EMPTY: AccordBlob = {
  modules: { ...DEFAULT_MODULE_STATE },
  roleplayResults: [],
  lineSends: [],
  followNotes: [],
  copilotDecisions: {},
};

function read(): AccordBlob {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(NS_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AccordBlob>;
    return {
      modules: { ...DEFAULT_MODULE_STATE, ...(parsed.modules ?? {}) },
      roleplayResults: parsed.roleplayResults ?? [],
      lineSends: parsed.lineSends ?? [],
      followNotes: parsed.followNotes ?? [],
      copilotDecisions: parsed.copilotDecisions ?? {},
    };
  } catch {
    return EMPTY;
  }
}

function write(blob: AccordBlob) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NS_KEY, JSON.stringify(blob));
  window.dispatchEvent(new Event("accord-store"));
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- modules ----------

export function getModuleState(): Record<AccordModuleId, boolean> {
  return read().modules;
}

export function setModuleEnabled(id: AccordModuleId, enabled: boolean) {
  const blob = read();
  blob.modules = { ...blob.modules, [id]: enabled };
  write(blob);
}

// ---------- roleplay ----------

export function getRoleplayResults(): StoredRoleplayResult[] {
  return read().roleplayResults;
}

export function saveRoleplayResult(input: {
  scenarioId: string;
  score: number;
  passed: RubricKey[];
}): StoredRoleplayResult {
  const blob = read();
  const result: StoredRoleplayResult = {
    id: makeId("rp"),
    at: new Date().toISOString(),
    ...input,
  };
  blob.roleplayResults = [result, ...blob.roleplayResults].slice(0, 50);
  write(blob);
  return result;
}

// ---------- LINE sends ----------

export function getLineSends(customerId?: string): StoredLineSend[] {
  const all = read().lineSends;
  return customerId ? all.filter((s) => s.customerId === customerId) : all;
}

export function recordLineSend(customerId: string, label: string) {
  const blob = read();
  blob.lineSends = [
    { id: makeId("ls"), customerId, label, at: new Date().toISOString() },
    ...blob.lineSends,
  ].slice(0, 100);
  write(blob);
}

// ---------- copilot（v2） ----------

export function getCopilotDecisions(): Record<string, StoredCopilotDecision> {
  return read().copilotDecisions;
}

export function recordCopilotDecision(
  insightId: string,
  status: "done" | "dismissed",
) {
  const blob = read();
  blob.copilotDecisions = {
    ...blob.copilotDecisions,
    [insightId]: { insightId, status, at: new Date().toISOString() },
  };
  write(blob);
}

// ---------- follow notes ----------

export function getFollowNotes(customerId: string): StoredFollowNote[] {
  return read().followNotes.filter((n) => n.customerId === customerId);
}

export function addFollowNote(customerId: string, body: string) {
  const blob = read();
  blob.followNotes = [
    { id: makeId("fn"), customerId, body, at: new Date().toISOString() },
    ...blob.followNotes,
  ].slice(0, 200);
  write(blob);
}
