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

import { useCallback, useEffect, useState } from "react";
import type { MealType, PhotoType } from "@/types/domain";

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
