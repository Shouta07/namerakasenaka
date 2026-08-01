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

/**
 * 表示するデータの母集団。
 * - full   … 導入後しばらく経った店舗（デモの既定）
 * - dayone … 契約直後、まだ1件も無い店舗
 * 初日の画面は、SaaSでいちばん解約に近い瞬間なので、いつでも見られるようにする。
 */
export type AccordDataset = "full" | "dayone";

type AccordBlob = {
  dataset: AccordDataset;
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
  dataset: "full",
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
      dataset: parsed.dataset === "dayone" ? "dayone" : "full",
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

// ---------- dataset（データあり / 初日） ----------

export function getDataset(): AccordDataset {
  return read().dataset;
}

export function setDataset(dataset: AccordDataset) {
  const blob = read();
  blob.dataset = dataset;
  write(blob);
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

export function recordLineSend(
  customerId: string,
  label: string,
): StoredLineSend {
  const blob = read();
  const send: StoredLineSend = {
    id: makeId("ls"),
    customerId,
    label,
    at: new Date().toISOString(),
  };
  blob.lineSends = [send, ...blob.lineSends].slice(0, 100);
  write(blob);
  return send;
}

/** 取り消し。押し間違いを戻せないと、毎日使う道具として信用されない。 */
export function removeLineSend(id: string) {
  const blob = read();
  blob.lineSends = blob.lineSends.filter((s) => s.id !== id);
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

export function addFollowNote(
  customerId: string,
  body: string,
): StoredFollowNote {
  const blob = read();
  const note: StoredFollowNote = {
    id: makeId("fn"),
    customerId,
    body,
    at: new Date().toISOString(),
  };
  blob.followNotes = [note, ...blob.followNotes].slice(0, 200);
  write(blob);
  return note;
}

/** 取り消し。 */
export function removeFollowNote(id: string) {
  const blob = read();
  blob.followNotes = blob.followNotes.filter((n) => n.id !== id);
  write(blob);
}
