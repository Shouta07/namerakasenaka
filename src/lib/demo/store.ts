/**
 * Client-side localStorage-backed store for the demo mode.
 *
 * Persists user actions so the deployed app feels real even without Supabase.
 * All readers/writers are guarded for SSR — server returns null/[].
 *
 * Single namespace: `senacare-demo-v1`. Each resource is a top-level key
 * inside the JSON blob.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MealType, PhotoType } from "@/types/domain";
import type { RecoveryGuideJson } from "@/lib/guide/schema";
import type { ConsentRecord } from "@/lib/labtest/consent";

const NS_KEY = "senacare-demo-v1";
const MAX_BYTES = 1_500_000; // 1.5 MB hard cap on a single data URL.

// ---------- Types ----------

export type StoredMessage = {
  id: string;
  conversationId: string;
  body: string;
  createdAt: string;
  isMine: boolean;
  isAutoReply?: boolean;
};

export type StoredSelfLog = {
  id: string;
  clientId: string;
  loggedOn: string; // YYYY-MM-DD
  createdAt: string;
  itchScore: number;
  rednessScore: number;
  newBreakout: boolean;
  memo: string | null;
};

export type StoredMealLog = {
  id: string;
  clientId: string;
  mealType: MealType;
  memo: string;
  photoUrl: string;
  loggedAt: string;
  createdAt: string;
};

export type StoredMealFeedback = {
  id: string;
  mealLogId: string;
  status: "ai_drafting" | "awaiting_review" | "approved" | "rejected" | "sent";
  aiDraft: string;
  finalText: string | null;
  monitorName: string | null;
  licenseNumber: string | null;
  approvedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
};

export type StoredSalonComment = {
  id: string;
  mealLogId: string;
  authorRole: "therapist" | "salon_admin";
  authorName: string;
  body: string;
  createdAt: string;
};

export type StoredAppointment = {
  id: string;
  clientId: string;
  therapistId: string | null;
  scheduledAt: string;
  durationMin: number;
  status: "requested" | "confirmed" | "completed" | "cancelled" | "no_show";
  menuName: string;
  clientName: string;
  therapistName: string;
  createdAt: string;
};

export type StoredProgressPhoto = {
  id: string;
  clientId: string;
  photoType: PhotoType;
  caption: string | null;
  signedUrl: string; // data URL
  takenAt: string;
  appointmentId?: string | null;
  selfRating?: number | null;
  createdAt: string;
};

export type StoredTreatmentRecord = {
  id: string;
  clientId: string;
  therapistName: string;
  treatmentType: string;
  productsUsed: string | null;
  skinFindings: string | null;
  nextPlan: string | null;
  cautions: string | null;
  performedAt: string;
  durationMinutes: number;
  createdAt: string;
};

export type StoredTreatmentVideo = {
  id: string;
  clientId: string;
  takenAt: string;
  durationSeconds: number | null;
  signedUrl: string;
  createdAt: string;
};

export type StoredInvite = {
  id: string;
  token: string;
  email: string;
  role: "client" | "therapist";
  createdAt: string;
  acceptedAt: string | null;
};

export type StoredCapturedAppt = {
  appointmentId: string;
  capturedAt: string;
};

export type SalonNoteTargetType =
  | "photo"
  | "self_log"
  | "meal_log"
  | "treatment_record"
  | "qa_thread";

export type StoredSalonNote = {
  id: string;
  clientId: string;
  targetType: SalonNoteTargetType;
  targetId: string;
  authorRole: "therapist" | "salon_admin";
  authorName: string;
  body: string;
  createdAt: string;
};

export type StoredCase = {
  id: string;
  organizationId: string;
  anonymousId: string;
  age: number | null;
  gender: "female" | "male" | "other" | "no_answer" | null;
  occupation: string | null;
  concernDuration: string | null;
  mainConcern: string;
  firstVisitDate: string | null;
  treatmentCount: number;
  improvementPeriod: string;
  severity: "light" | "medium" | "heavy";
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  staffMemo: string | null;
  counselingComment: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type StoredCaseTag = {
  id: string;
  organizationId: string;
  name: string;
  sortOrder: number;
};

// Recovery guide (三社共同開発) -------------------------------------------------

export type StoredGuideCustomer = {
  id: string;
  organizationId: string;
  clientId: string | null;
  name: string;
  age: number | null;
  concern: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredHealthRecord = {
  id: string;
  guideCustomerId: string;
  testResultMemo: string;
  doctorComment: string;
  salonMemo: string;
  dietaryRestrictions: string;
  currentProblem: string;
  aiSummaryJson: RecoveryGuideJson | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyCheckActionLevel = "yes" | "mostly" | "rest";

export type StoredDailyCheck = {
  id: string;
  guideCustomerId: string;
  /** YYYY-MM-DD */
  date: string;
  actionDone: boolean;
  /** Finer-grained UI state (はい/だいたい/おやすみ) — demo-store only. */
  actionLevel?: DailyCheckActionLevel;
  skinCondition: number | null;
  bodyCondition: number | null;
  memo: string | null;
  createdAt: string;
};

/**
 * 🌱 「腸のおはなし」 — レッスン進捗。
 *
 * 1 レッスン = 1 行。完了日と「初回クイズ正解だったか」を記録。
 * 同じレッスンを後日読み返しても completedAt は変わらない（最初に終えた日）。
 * revisitCount は読み返した回数（バッジ判定には使わない）。
 */
export type LessonProgress = {
  guideCustomerId: string;
  lessonId: string;
  completedAt: string; // ISO when first finished
  quizCorrectFirstTry: boolean;
  revisitCount: number;
};

/**
 * 伴走ループ — サロン → 顧客の一言メッセージ。
 *
 * 顧客の daily_check.memo に対するお返事や、自由形式のひとことを保存する。
 * direction は今のところ salon_to_customer のみ。将来の双方向に備えて型は残す。
 */
export type GuideMessage = {
  id: string;
  guideCustomerId: string;
  direction: "salon_to_customer";
  /** ≤ 200 chars enforced at composer; not validated here. */
  body: string;
  createdAt: string; // ISO
  readAt: string | null;
  /** Optional — links a reply to a customer memo on that date (YYYY-MM-DD). */
  respondingToCheckDate: string | null;
};

/**
 * 同意の記録。フラグではなく「いつ・誰が・何について確認したか」を残す。
 * 型は src/lib/labtest/consent.ts が持ち、ここは保存だけを担う。
 */
export type StoredConsent = ConsentRecord;

/**
 * 施術者が投入した検査結果 1回ぶん。
 *
 * 患者は入力しない。ここに入るのは必ずスタッフが取り込んだデータで、
 * publishedAt が null のあいだは患者の画面に出ない（同意の確認前）。
 */
export type StoredLabImport = {
  id: string;
  /** guide customer id。 */
  customerId: string;
  /** 採血日（YYYY-MM-DD）。検査票から人が入れる。 */
  collectedOn: string;
  /** 取り込んだ検査値。 */
  values: { rowId: string; value: number; sourceLabel: string; sourceUnit: string }[];
  /** 元ファイル名。あとで検査票と突き合わせるために残す。 */
  sourceFileName: string;
  /** 読み取れなかった行数。0 でないことを隠さない。 */
  unparsedCount: number;
  /** 取り込んだスタッフ。 */
  importedBy: string;
  importedAt: string;
  /** 患者の画面に出した日時。null なら未公開。 */
  publishedAt: string | null;
};

type Snapshot = {
  messages: StoredMessage[];
  selfLogs: StoredSelfLog[];
  mealLogs: StoredMealLog[];
  mealFeedbacks: StoredMealFeedback[];
  salonComments: StoredSalonComment[];
  salonNotes: StoredSalonNote[];
  appointments: StoredAppointment[];
  progressPhotos: StoredProgressPhoto[];
  treatmentRecords: StoredTreatmentRecord[];
  treatmentVideos: StoredTreatmentVideo[];
  invites: StoredInvite[];
  capturedAppts: StoredCapturedAppt[];
  cases: StoredCase[];
  caseTags: StoredCaseTag[];
  guideCustomers: StoredGuideCustomer[];
  healthRecords: StoredHealthRecord[];
  dailyChecks: StoredDailyCheck[];
  guideMessages: GuideMessage[];
  lessonProgress: LessonProgress[];
  consents: StoredConsent[];
  labImports: StoredLabImport[];
};

const EMPTY: Snapshot = {
  messages: [],
  selfLogs: [],
  mealLogs: [],
  mealFeedbacks: [],
  salonComments: [],
  salonNotes: [],
  appointments: [],
  progressPhotos: [],
  treatmentRecords: [],
  treatmentVideos: [],
  invites: [],
  capturedAppts: [],
  cases: [],
  caseTags: [],
  guideCustomers: [],
  healthRecords: [],
  dailyChecks: [],
  guideMessages: [],
  lessonProgress: [],
  consents: [],
  labImports: [],
};

// ---------- Low-level access ----------

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): Snapshot {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(NS_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function write(snap: Snapshot): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(NS_KEY, JSON.stringify(snap));
    notify();
  } catch (err) {
    // Quota or serialization. Best-effort fallback.
    console.warn("[demo-store] failed to persist", err);
  }
}

function update<K extends keyof Snapshot>(
  key: K,
  fn: (current: Snapshot[K]) => Snapshot[K],
): Snapshot[K] {
  const snap = read();
  const next = fn(snap[key]);
  write({ ...snap, [key]: next });
  return next;
}

// ---------- Subscriptions ----------

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const l of listeners) l();
}

function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// React to cross-tab storage events.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === NS_KEY) notify();
  });
}

// ---------- Utilities ----------

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const FALLBACK_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect fill="#e7e5e4" width="600" height="800"/><text x="300" y="400" font-size="24" fill="#78716c" text-anchor="middle" font-family="sans-serif">サンプル画像</text></svg>`,
  );

/**
 * Resize an image File via canvas, returning a JPEG dataURL.
 * Caps the longer edge to maxEdge px. Falls back to a placeholder
 * if the file is invalid or the result is too large.
 */
export async function fileToResizedDataUrl(
  file: File,
  maxEdge = 1024,
  quality = 0.82,
): Promise<string> {
  if (!isBrowser()) return FALLBACK_DATA_URL;
  try {
    if (!file.type.startsWith("image/")) return FALLBACK_DATA_URL;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("img_load"));
        i.src = url;
      });
      const w0 = img.naturalWidth;
      const h0 = img.naturalHeight;
      const scale = Math.min(1, maxEdge / Math.max(w0, h0));
      const w = Math.max(1, Math.round(w0 * scale));
      const h = Math.max(1, Math.round(h0 * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return FALLBACK_DATA_URL;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length > MAX_BYTES) {
        // Try one smaller pass.
        const smaller = await new Promise<string>((resolve) => {
          const c2 = document.createElement("canvas");
          c2.width = Math.round(w * 0.7);
          c2.height = Math.round(h * 0.7);
          const cx = c2.getContext("2d");
          if (!cx) return resolve(FALLBACK_DATA_URL);
          cx.drawImage(img, 0, 0, c2.width, c2.height);
          resolve(c2.toDataURL("image/jpeg", 0.7));
        });
        if (smaller.length > MAX_BYTES) return FALLBACK_DATA_URL;
        return smaller;
      }
      return dataUrl;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return FALLBACK_DATA_URL;
  }
}

// ---------- Generic hook ----------

function useStore<K extends keyof Snapshot>(key: K): Snapshot[K] {
  const [value, setValue] = useState<Snapshot[K]>(EMPTY[key]);
  useEffect(() => {
    setValue(read()[key]);
    return subscribe(() => setValue(read()[key]));
  }, [key]);
  return value;
}

// ---------- Resource-specific helpers ----------

// Messages
export function useStoredMessages(conversationId: string): StoredMessage[] {
  const all = useStore("messages");
  return all.filter((m) => m.conversationId === conversationId);
}

export function addStoredMessage(input: Omit<StoredMessage, "id" | "createdAt"> & { id?: string; createdAt?: string }): StoredMessage {
  const next: StoredMessage = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    conversationId: input.conversationId,
    body: input.body,
    isMine: input.isMine,
    isAutoReply: input.isAutoReply,
  };
  update("messages", (cur) => [...cur, next]);
  return next;
}

// Self logs
export function useStoredSelfLogs(clientId: string): StoredSelfLog[] {
  const all = useStore("selfLogs");
  return all.filter((s) => s.clientId === clientId);
}

export function addStoredSelfLog(input: Omit<StoredSelfLog, "id" | "createdAt">): StoredSelfLog {
  const next: StoredSelfLog = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("selfLogs", (cur) => [...cur, next]);
  return next;
}

// Meal logs
export function useStoredMealLogs(clientId: string): StoredMealLog[] {
  const all = useStore("mealLogs");
  return all.filter((m) => m.clientId === clientId);
}

export function addStoredMealLog(input: Omit<StoredMealLog, "id" | "createdAt">): StoredMealLog {
  const next: StoredMealLog = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("mealLogs", (cur) => [...cur, next]);
  return next;
}

// Meal feedbacks
export function useStoredMealFeedbacks(): StoredMealFeedback[] {
  return useStore("mealFeedbacks");
}

export function addStoredMealFeedback(input: Omit<StoredMealFeedback, "id" | "createdAt"> & { id?: string }): StoredMealFeedback {
  const next: StoredMealFeedback = {
    id: input.id ?? newId(),
    createdAt: new Date().toISOString(),
    mealLogId: input.mealLogId,
    status: input.status,
    aiDraft: input.aiDraft,
    finalText: input.finalText,
    monitorName: input.monitorName,
    licenseNumber: input.licenseNumber,
    approvedAt: input.approvedAt,
    rejectReason: input.rejectReason,
  };
  update("mealFeedbacks", (cur) => {
    const idx = cur.findIndex((f) => f.id === next.id);
    if (idx >= 0) {
      const copy = cur.slice();
      copy[idx] = next;
      return copy;
    }
    return [...cur, next];
  });
  return next;
}

export function updateStoredMealFeedback(id: string, patch: Partial<StoredMealFeedback>): void {
  update("mealFeedbacks", (cur) =>
    cur.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  );
}

// Salon notes (generic, polymorphic) — any artifact type.
export function useStoredSalonNotes(
  targetType: SalonNoteTargetType,
  targetId: string,
): StoredSalonNote[] {
  const all = useStore("salonNotes");
  return all.filter((n) => n.targetType === targetType && n.targetId === targetId);
}

export function useStoredSalonNotesForClient(clientId: string): StoredSalonNote[] {
  const all = useStore("salonNotes");
  return all.filter((n) => n.clientId === clientId);
}

export function addStoredSalonNote(
  input: Omit<StoredSalonNote, "id" | "createdAt">,
): StoredSalonNote {
  const next: StoredSalonNote = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("salonNotes", (cur) => [...cur, next]);
  return next;
}

// Salon comments
export function useStoredSalonComments(mealLogId: string): StoredSalonComment[] {
  const all = useStore("salonComments");
  return all.filter((c) => c.mealLogId === mealLogId);
}

export function addStoredSalonComment(input: Omit<StoredSalonComment, "id" | "createdAt">): StoredSalonComment {
  const next: StoredSalonComment = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("salonComments", (cur) => [...cur, next]);
  return next;
}

// Appointments
export function useStoredAppointments(): StoredAppointment[] {
  return useStore("appointments");
}

export function addStoredAppointment(
  input: Omit<StoredAppointment, "id" | "createdAt">,
): StoredAppointment {
  const next: StoredAppointment = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("appointments", (cur) => [...cur, next]);
  return next;
}

// Progress photos
export function useStoredProgressPhotos(clientId: string): StoredProgressPhoto[] {
  const all = useStore("progressPhotos");
  return all.filter((p) => p.clientId === clientId);
}

export function addStoredProgressPhoto(
  input: Omit<StoredProgressPhoto, "id" | "createdAt">,
): StoredProgressPhoto {
  const next: StoredProgressPhoto = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("progressPhotos", (cur) => [...cur, next]);
  return next;
}

// Treatment records
export function useStoredTreatmentRecords(clientId: string): StoredTreatmentRecord[] {
  const all = useStore("treatmentRecords");
  return all.filter((r) => r.clientId === clientId);
}

export function addStoredTreatmentRecord(
  input: Omit<StoredTreatmentRecord, "id" | "createdAt">,
): StoredTreatmentRecord {
  const next: StoredTreatmentRecord = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("treatmentRecords", (cur) => [...cur, next]);
  return next;
}

// Treatment videos
export function useStoredTreatmentVideos(clientId: string): StoredTreatmentVideo[] {
  const all = useStore("treatmentVideos");
  return all.filter((v) => v.clientId === clientId);
}

export function addStoredTreatmentVideo(
  input: Omit<StoredTreatmentVideo, "id" | "createdAt">,
): StoredTreatmentVideo {
  const next: StoredTreatmentVideo = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("treatmentVideos", (cur) => [...cur, next]);
  return next;
}

// Invites
export function useStoredInvites(): StoredInvite[] {
  return useStore("invites");
}

export function addStoredInvite(input: Omit<StoredInvite, "id" | "createdAt">): StoredInvite {
  const next: StoredInvite = { id: newId(), createdAt: new Date().toISOString(), ...input };
  update("invites", (cur) => [...cur, next]);
  return next;
}

export function findStoredInviteByToken(token: string): StoredInvite | null {
  if (!isBrowser()) return null;
  return read().invites.find((i) => i.token === token) ?? null;
}

export function markStoredInviteAccepted(token: string): void {
  update("invites", (cur) =>
    cur.map((i) => (i.token === token ? { ...i, acceptedAt: new Date().toISOString() } : i)),
  );
}

// Captured appointments (badge state for therapist today)
export function useStoredCapturedAppts(): StoredCapturedAppt[] {
  return useStore("capturedAppts");
}

export function markAppointmentCaptured(appointmentId: string): void {
  update("capturedAppts", (cur) => {
    if (cur.some((c) => c.appointmentId === appointmentId)) return cur;
    return [...cur, { appointmentId, capturedAt: new Date().toISOString() }];
  });
}

// ---------- Cross-client snapshot hooks ----------

/**
 * Hooks that read all clients' data at once. Used by retention/evidence
 * engines that need to compare cohorts. In production these become Supabase
 * queries with RLS gating; here we poll the snapshot store at a slow cadence.
 */

export function useAllStoredSelfLogs(): StoredSelfLog[] {
  return useStore("selfLogs");
}

export function useAllStoredProgressPhotos(): StoredProgressPhoto[] {
  return useStore("progressPhotos");
}

export function useAllStoredMessages(): StoredMessage[] {
  return useStore("messages");
}

export function useAllStoredTreatmentRecords(): StoredTreatmentRecord[] {
  return useStore("treatmentRecords");
}

// Cases ----------------------------------------------------------------------

export function useStoredCases(): StoredCase[] {
  return useStore("cases");
}

export function addStoredCase(
  input: Omit<StoredCase, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
): StoredCase {
  const now = new Date().toISOString();
  const next: StoredCase = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    organizationId: input.organizationId,
    anonymousId: input.anonymousId,
    age: input.age,
    gender: input.gender,
    occupation: input.occupation,
    concernDuration: input.concernDuration,
    mainConcern: input.mainConcern,
    firstVisitDate: input.firstVisitDate,
    treatmentCount: input.treatmentCount,
    improvementPeriod: input.improvementPeriod,
    severity: input.severity,
    beforeImageUrl: input.beforeImageUrl,
    afterImageUrl: input.afterImageUrl,
    staffMemo: input.staffMemo,
    counselingComment: input.counselingComment,
    tagIds: input.tagIds,
  };
  update("cases", (cur) => [...cur, next]);
  return next;
}

export function updateStoredCase(id: string, patch: Partial<StoredCase>): void {
  update("cases", (cur) =>
    cur.map((c) =>
      c.id === id
        ? { ...c, ...patch, updatedAt: new Date().toISOString() }
        : c,
    ),
  );
}

export function removeStoredCase(id: string): void {
  update("cases", (cur) => cur.filter((c) => c.id !== id));
}

export function findStoredCase(id: string): StoredCase | null {
  if (!isBrowser()) return null;
  return read().cases.find((c) => c.id === id) ?? null;
}

// Case tags ------------------------------------------------------------------

export function useStoredCaseTags(): StoredCaseTag[] {
  return useStore("caseTags");
}

export function addStoredCaseTag(
  input: Omit<StoredCaseTag, "id"> & { id?: string },
): StoredCaseTag {
  const next: StoredCaseTag = {
    id: input.id ?? newId(),
    organizationId: input.organizationId,
    name: input.name,
    sortOrder: input.sortOrder,
  };
  update("caseTags", (cur) => [...cur, next]);
  return next;
}

export function updateStoredCaseTag(
  id: string,
  patch: Partial<StoredCaseTag>,
): void {
  update("caseTags", (cur) =>
    cur.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  );
}

export function removeStoredCaseTag(id: string): void {
  update("caseTags", (cur) => cur.filter((t) => t.id !== id));
}

// Recovery guide ---------------------------------------------------------------

export function useStoredGuideCustomers(): StoredGuideCustomer[] {
  return useStore("guideCustomers");
}

export function addStoredGuideCustomer(
  input: Omit<StoredGuideCustomer, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
): StoredGuideCustomer {
  const now = new Date().toISOString();
  const next: StoredGuideCustomer = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    organizationId: input.organizationId,
    clientId: input.clientId,
    name: input.name,
    age: input.age,
    concern: input.concern,
    shareToken: input.shareToken,
  };
  // Upsert by id so fixture overrides land in the store too.
  update("guideCustomers", (cur) => {
    const idx = cur.findIndex((c) => c.id === next.id);
    if (idx >= 0) {
      const copy = cur.slice();
      copy[idx] = next;
      return copy;
    }
    return [...cur, next];
  });
  return next;
}

export function updateStoredGuideCustomer(
  id: string,
  patch: Partial<StoredGuideCustomer>,
): void {
  update("guideCustomers", (cur) =>
    cur.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
    ),
  );
}

export function useStoredHealthRecords(): StoredHealthRecord[] {
  return useStore("healthRecords");
}

export function addStoredHealthRecord(
  input: Omit<StoredHealthRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
): StoredHealthRecord {
  const now = new Date().toISOString();
  const next: StoredHealthRecord = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    guideCustomerId: input.guideCustomerId,
    testResultMemo: input.testResultMemo,
    doctorComment: input.doctorComment,
    salonMemo: input.salonMemo,
    dietaryRestrictions: input.dietaryRestrictions,
    currentProblem: input.currentProblem,
    aiSummaryJson: input.aiSummaryJson,
    aiGeneratedAt: input.aiGeneratedAt,
  };
  // Upsert by id — editing a fixture-sourced record writes the full row here.
  update("healthRecords", (cur) => {
    const idx = cur.findIndex((r) => r.id === next.id);
    if (idx >= 0) {
      const copy = cur.slice();
      copy[idx] = next;
      return copy;
    }
    return [...cur, next];
  });
  return next;
}

export function useStoredDailyChecks(): StoredDailyCheck[] {
  return useStore("dailyChecks");
}

/** Upserts on (guideCustomerId, date) — one check per customer per day. */
export function upsertStoredDailyCheck(
  input: Omit<StoredDailyCheck, "id" | "createdAt"> & { id?: string },
): StoredDailyCheck {
  const next: StoredDailyCheck = {
    id: input.id ?? newId(),
    createdAt: new Date().toISOString(),
    guideCustomerId: input.guideCustomerId,
    date: input.date,
    actionDone: input.actionDone,
    actionLevel: input.actionLevel,
    skinCondition: input.skinCondition,
    bodyCondition: input.bodyCondition,
    memo: input.memo,
  };
  update("dailyChecks", (cur) => {
    const idx = cur.findIndex(
      (c) => c.guideCustomerId === next.guideCustomerId && c.date === next.date,
    );
    if (idx >= 0) {
      const copy = cur.slice();
      copy[idx] = { ...next, id: copy[idx].id, createdAt: copy[idx].createdAt };
      return copy;
    }
    return [...cur, next];
  });
  return next;
}

// Guide messages (salon → customer 伴走ループ) -------------------------------

export function useStoredGuideMessages(guideCustomerId: string): GuideMessage[] {
  const all = useStore("guideMessages");
  // 毎レンダーで新しい配列を返すと、これに依存する useEffect が回り続ける。
  return useMemo(
    () =>
      all
        .filter((m) => m.guideCustomerId === guideCustomerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [all, guideCustomerId],
  );
}

export function addStoredGuideMessage(
  input: Omit<GuideMessage, "id" | "createdAt" | "readAt"> & {
    id?: string;
    createdAt?: string;
    readAt?: string | null;
  },
): GuideMessage {
  const next: GuideMessage = {
    id: input.id ?? newId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    readAt: input.readAt ?? null,
    guideCustomerId: input.guideCustomerId,
    direction: input.direction,
    body: input.body,
    respondingToCheckDate: input.respondingToCheckDate,
  };
  update("guideMessages", (cur) => {
    const idx = cur.findIndex((m) => m.id === next.id);
    if (idx >= 0) {
      const copy = cur.slice();
      copy[idx] = next;
      return copy;
    }
    return [...cur, next];
  });
  return next;
}

export function markStoredGuideMessageRead(id: string): void {
  update("guideMessages", (cur) =>
    cur.map((m) =>
      m.id === id ? { ...m, readAt: m.readAt ?? new Date().toISOString() } : m,
    ),
  );
}

// Lesson progress (🌱 腸のおはなし) ----------------------------------------

export function useStoredLessonProgress(
  guideCustomerId: string,
): LessonProgress[] {
  const all = useStore("lessonProgress");
  return all.filter((p) => p.guideCustomerId === guideCustomerId);
}

/**
 * Mark a lesson finished. First-time completion stamps completedAt;
 * subsequent calls are no-ops on completedAt (the first day stays).
 * Returns `{ firstCompletion: boolean }` so the caller can choose
 * which toast / badge celebration to fire.
 */
export function markStoredLessonCompleted(input: {
  guideCustomerId: string;
  lessonId: string;
  quizCorrectFirstTry: boolean;
}): { firstCompletion: boolean } {
  let firstCompletion = false;
  update("lessonProgress", (cur) => {
    const idx = cur.findIndex(
      (p) =>
        p.guideCustomerId === input.guideCustomerId &&
        p.lessonId === input.lessonId,
    );
    if (idx >= 0) {
      // Already completed once — keep the original timestamp / first-try result.
      return cur;
    }
    firstCompletion = true;
    return [
      ...cur,
      {
        guideCustomerId: input.guideCustomerId,
        lessonId: input.lessonId,
        completedAt: new Date().toISOString(),
        quizCorrectFirstTry: input.quizCorrectFirstTry,
        revisitCount: 0,
      },
    ];
  });
  return { firstCompletion };
}

/** Bumps the re-visit counter (only for already-completed lessons). */
export function bumpStoredLessonRevisit(input: {
  guideCustomerId: string;
  lessonId: string;
}): void {
  update("lessonProgress", (cur) =>
    cur.map((p) =>
      p.guideCustomerId === input.guideCustomerId &&
      p.lessonId === input.lessonId
        ? { ...p, revisitCount: p.revisitCount + 1 }
        : p,
    ),
  );
}

// ---------- Reset / readers ----------

export function clearStore(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(NS_KEY);
    notify();
  } catch {
    // ignore
  }
}

/** Tracks whether the client has hydrated (read from localStorage at least once). */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

/** Forces a snapshot read for one-shot consumers. Returns null on server. */
export function readStoredSnapshotClient(): Snapshot | null {
  if (!isBrowser()) return null;
  return read();
}

export function readStoredMessagesServer(): null {
  return null;
}

export function readStoredAppointmentsServer(): null {
  return null;
}

export function useResetStore(): () => void {
  return useCallback(() => {
    clearStore();
  }, []);
}

// ---------- 同意と、検査結果の取り込み ----------
//
// この2つは対で扱う。取り込んだだけでは患者には見えず、
// 同意の記録があってはじめて公開できる（強制は API 側）。

export function useStoredConsents(): StoredConsent[] {
  return useStore("consents");
}

/** 同意を記録する。同じ目的の古い記録は残したまま、新しい意思を積む。 */
export function grantConsent(
  input: Omit<StoredConsent, "id" | "grantedAt" | "revokedAt"> & {
    id?: string;
    grantedAt?: string;
  },
): StoredConsent {
  const next: StoredConsent = {
    id: input.id ?? newId(),
    customerId: input.customerId,
    scope: input.scope,
    grantedAt: input.grantedAt ?? new Date().toISOString(),
    grantedBy: input.grantedBy,
    revokedAt: null,
    method: input.method,
  };
  update("consents", (cur) => [...cur, next]);
  return next;
}

/**
 * 同意を取り消す。記録は消さない — 「取り消した」ことも履歴。
 * 取り消した瞬間から公開は不許可になる。
 */
export function revokeConsent(consentId: string): void {
  const at = new Date().toISOString();
  update("consents", (cur) =>
    cur.map((c) => (c.id === consentId ? { ...c, revokedAt: at } : c)),
  );
}

export function useStoredLabImports(): StoredLabImport[] {
  return useStore("labImports");
}

/** 取り込みを保存する。この時点では未公開（publishedAt = null）。 */
export function addStoredLabImport(
  input: Omit<StoredLabImport, "id" | "importedAt" | "publishedAt"> & {
    id?: string;
    importedAt?: string;
  },
): StoredLabImport {
  const next: StoredLabImport = {
    id: input.id ?? newId(),
    customerId: input.customerId,
    collectedOn: input.collectedOn,
    values: input.values,
    sourceFileName: input.sourceFileName,
    unparsedCount: input.unparsedCount,
    importedBy: input.importedBy,
    importedAt: input.importedAt ?? new Date().toISOString(),
    publishedAt: null,
  };
  update("labImports", (cur) => [...cur, next]);
  return next;
}

/** 公開状態を切り替える。呼ぶ前に必ず API 側の同意チェックを通すこと。 */
export function setLabImportPublished(id: string, published: boolean): void {
  const at = published ? new Date().toISOString() : null;
  update("labImports", (cur) =>
    cur.map((r) => (r.id === id ? { ...r, publishedAt: at } : r)),
  );
}

export function removeStoredLabImport(id: string): void {
  update("labImports", (cur) => cur.filter((r) => r.id !== id));
}
