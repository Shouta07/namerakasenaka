"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, LineChart } from "lucide-react";
import {
  useAllStoredMessages,
  useAllStoredProgressPhotos,
  useAllStoredSelfLogs,
  useHydrated,
  useStoredAppointments,
} from "@/lib/demo/store";
import {
  demoAppointments,
  demoClientRoster,
  demoProgressPhotos,
} from "@/lib/demo/fixtures";
import {
  assessAllClients,
  type RetentionAppointment,
  type RetentionPhoto,
  type RetentionQaMessage,
  type RetentionSelfLog,
} from "@/lib/retention";
import {
  computeClientImprovement,
  type EvidencePhoto,
  type EvidenceSelfLog,
  type EvidenceTreatmentRecord,
} from "@/lib/evidence";
import { useAllStoredTreatmentRecords } from "@/lib/demo/store";

/**
 * Dashboard alert widgets: surfaces at-risk count and improving-trend count
 * with deep links into the dedicated pages.
 *
 * Client-side compute so it reflects localStorage changes immediately.
 */
export function RiskWidgets() {
  const hydrated = useHydrated();
  const appts = useStoredAppointments();
  const logs = useAllStoredSelfLogs();
  const photos = useAllStoredProgressPhotos();
  const treatments = useAllStoredTreatmentRecords();
  const messages = useAllStoredMessages();

  const { highCount, mediumCount, improvingCount, totalCount } = useMemo(() => {
    const clients = demoClientRoster.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      qaConversationId: `qa-client-${c.id}`,
      sessionsCompleted: c.sessionsCompleted,
      sessionsTotal: c.sessionsTotal,
      courseStartedAt: c.startedOn,
    }));

    const appointments: RetentionAppointment[] = [
      ...demoAppointments.map((a) => ({
        id: a.id,
        clientId: a.clientId,
        scheduledAt: a.scheduledAt,
        status: a.status,
      })),
      ...appts.map((a) => ({
        id: a.id,
        clientId: a.clientId,
        scheduledAt: a.scheduledAt,
        status: a.status,
      })),
    ];
    const selfLogs: RetentionSelfLog[] = logs.map((s) => ({
      id: s.id,
      clientId: s.clientId,
      loggedOn: s.loggedOn,
    }));
    const photoEvents: RetentionPhoto[] = [
      ...demoProgressPhotos.map((p) => ({
        id: p.id,
        clientId: p.clientId,
        takenAt: p.takenAt,
      })),
      ...photos.map((p) => ({
        id: p.id,
        clientId: p.clientId,
        takenAt: p.takenAt,
      })),
    ];
    const qaMessages: RetentionQaMessage[] = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      createdAt: m.createdAt,
      isMine: m.isMine,
    }));

    const buckets = assessAllClients({
      clients,
      appointments,
      selfLogs,
      qaMessages,
      photos: photoEvents,
    });

    let improving = 0;
    for (const c of demoClientRoster) {
      const evPhotos: EvidencePhoto[] = [
        ...demoProgressPhotos
          .filter((p) => p.clientId === c.id)
          .map((p) => ({
            id: p.id,
            takenAt: p.takenAt,
            photoType: p.photoType,
            selfRating: p.selfRating,
          })),
        ...photos
          .filter((p) => p.clientId === c.id)
          .map((p) => ({
            id: p.id,
            takenAt: p.takenAt,
            photoType: p.photoType,
            selfRating: p.selfRating ?? null,
          })),
      ];
      const evSelfLogs: EvidenceSelfLog[] = logs
        .filter((s) => s.clientId === c.id)
        .map((s) => ({
          id: s.id,
          loggedOn: s.loggedOn,
          itchScore: s.itchScore,
          rednessScore: s.rednessScore,
        }));
      const evRecords: EvidenceTreatmentRecord[] = treatments
        .filter((r) => r.clientId === c.id)
        .map((r) => ({ id: r.id, performedAt: r.performedAt }));
      const summary = computeClientImprovement({
        photos: evPhotos,
        selfLogs: evSelfLogs,
        treatmentRecords: evRecords,
        courseStartedAt: c.startedOn,
        sessionsCompleted: c.sessionsCompleted,
        sessionsTotal: c.sessionsTotal,
      });
      if (summary.trend === "improving") improving += 1;
    }

    return {
      highCount: buckets.high.length,
      mediumCount: buckets.medium.length,
      improvingCount: improving,
      totalCount: demoClientRoster.length,
    };
  }, [appts, logs, photos, treatments, messages]);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-2xl border border-stone-200 bg-white" />
        <div className="h-24 rounded-2xl border border-stone-200 bg-white" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Link
        href="/admin/at-risk"
        className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 transition-colors hover:bg-amber-100/60"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-900">離脱予兆</p>
          <p className="mt-1 text-2xl font-semibold leading-none text-amber-900">
            {highCount + mediumCount} 名
          </p>
          <p className="mt-1 text-[11px] text-amber-800">
            高 {highCount} ・ 中 {mediumCount} ・ 確認する →
          </p>
        </div>
      </Link>

      <Link
        href="/admin/evidence"
        className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 transition-colors hover:bg-emerald-100/60"
      >
        <LineChart className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
        <div className="flex-1">
          <p className="text-xs font-medium text-emerald-900">改善トレンド</p>
          <p className="mt-1 text-2xl font-semibold leading-none text-emerald-900">
            {improvingCount} / {totalCount} 名
          </p>
          <p className="mt-1 text-[11px] text-emerald-800">
            進捗を可視化 ・ レポート出力 →
          </p>
        </div>
      </Link>
    </div>
  );
}
