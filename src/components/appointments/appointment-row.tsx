"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, Play, UserCheck, ArrowRight } from "lucide-react";
import { TreatmentDayCameraLauncher } from "@/components/progress/treatment-day-camera-launcher";
import { CustomerAvatar } from "@/components/ui/customer-avatar";
import { cn } from "@/lib/utils/cn";

export type AppointmentFlowState =
  | "scheduled"
  | "checked_in"
  | "in_progress"
  | "completed";

export type AppointmentFlowEntry = {
  appointmentId: string;
  state: AppointmentFlowState;
  checkedInAt?: string;
  startedAt?: string;
  completedAt?: string;
  photosTaken?: number;
};

const NS_KEY = "senacare-appointment-flow-v1";

function readAll(): Record<string, AppointmentFlowEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, AppointmentFlowEntry>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, AppointmentFlowEntry>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NS_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("senacare-appointment-flow-changed"));
  } catch {
    // ignore
  }
}

export function useAppointmentFlow(appointmentId: string): {
  entry: AppointmentFlowEntry;
  transition: (next: AppointmentFlowState) => void;
  hydrated: boolean;
} {
  const [entry, setEntry] = useState<AppointmentFlowEntry>({
    appointmentId,
    state: "scheduled",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const map = readAll();
    if (map[appointmentId]) setEntry(map[appointmentId]);
    setHydrated(true);

    function onChange() {
      const m = readAll();
      if (m[appointmentId]) {
        setEntry(m[appointmentId]);
      } else {
        setEntry({ appointmentId, state: "scheduled" });
      }
    }
    window.addEventListener("senacare-appointment-flow-changed", onChange);
    window.addEventListener("storage", (e) => {
      if (e.key === NS_KEY) onChange();
    });
    return () => {
      window.removeEventListener("senacare-appointment-flow-changed", onChange);
    };
  }, [appointmentId]);

  function transition(next: AppointmentFlowState) {
    const now = new Date().toISOString();
    const map = readAll();
    const cur = map[appointmentId] ?? { appointmentId, state: "scheduled" };
    const updated: AppointmentFlowEntry = { ...cur, state: next };
    if (next === "checked_in") updated.checkedInAt = now;
    if (next === "in_progress") updated.startedAt = now;
    if (next === "completed") updated.completedAt = now;
    map[appointmentId] = updated;
    writeAll(map);
    setEntry(updated);
  }

  return { entry, transition, hydrated };
}

const STATE_LABEL: Record<AppointmentFlowState, string> = {
  scheduled: "予定",
  checked_in: "受付済",
  in_progress: "施術中",
  completed: "完了",
};

const STATE_TONE: Record<AppointmentFlowState, string> = {
  scheduled: "bg-stone-100 text-stone-700",
  checked_in: "bg-sky-100 text-sky-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const elapsedMin = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / 60_000),
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      経過 {elapsedMin} 分
    </span>
  );
}

export function AppointmentFlowRow({
  appointmentId,
  clientId,
  clientName,
  therapistName,
  menuName,
  scheduledAt,
}: {
  appointmentId: string;
  clientId: string;
  clientName: string;
  therapistName: string;
  menuName: string;
  scheduledAt: string;
}) {
  const { entry, transition, hydrated } = useAppointmentFlow(appointmentId);
  const time = `${String(new Date(scheduledAt).getHours()).padStart(2, "0")}:${String(
    new Date(scheduledAt).getMinutes(),
  ).padStart(2, "0")}`;

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-6 flex-none items-center justify-center rounded-full px-2 text-[10px] font-semibold",
            STATE_TONE[entry.state],
          )}
        >
          {STATE_LABEL[entry.state]}
        </span>
        <span className="w-12 flex-none text-sm font-semibold tabular-nums text-stone-900">
          {time}
        </span>
        <CustomerAvatar name={clientName} size="sm" role="customer" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-stone-900">
            {clientName} 様
          </span>
          <span className="block truncate text-[11px] text-stone-500">
            {menuName} ・ {therapistName}
          </span>
        </span>
      </div>

      {hydrated ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {entry.state === "scheduled" ? (
            <button
              type="button"
              onClick={() => transition("checked_in")}
              className="inline-flex min-h-11 items-center gap-1 rounded-md bg-sky-600 px-3.5 text-[12px] font-medium text-white hover:bg-sky-700"
            >
              <UserCheck className="h-3.5 w-3.5" />
              受付
            </button>
          ) : null}
          {entry.state === "checked_in" ? (
            <button
              type="button"
              onClick={() => transition("in_progress")}
              className="inline-flex min-h-11 items-center gap-1 rounded-md bg-amber-600 px-3 text-[12px] font-medium text-white hover:bg-amber-700"
            >
              <Play className="h-3.5 w-3.5" />
              施術開始
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : null}
          {entry.state === "in_progress" ? (
            <>
              {entry.startedAt ? <ElapsedTimer startedAt={entry.startedAt} /> : null}
              <TreatmentDayCameraLauncher
                clientId={clientId}
                appointmentId={appointmentId}
                demo
              />
              <button
                type="button"
                onClick={() => transition("completed")}
                className="inline-flex min-h-11 items-center gap-1 rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                施術完了
              </button>
            </>
          ) : null}
          {entry.state === "completed" ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                完了
              </span>
              {entry.photosTaken && entry.photosTaken > 0 ? (
                <span className="text-[10px] text-stone-500">
                  撮影 {entry.photosTaken} 枚
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-stone-500">
                  <Camera className="h-3 w-3" />
                  撮影あり
                </span>
              )}
              <Link
                href={`/admin/clients/${clientId}`}
                className="inline-flex min-h-11 items-center gap-1 rounded-md border border-stone-200 bg-white px-3 text-[12px] font-medium text-stone-700 hover:bg-stone-50"
              >
                次回予約
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 h-11" />
      )}
    </li>
  );
}
