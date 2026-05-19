"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
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

/**
 * Small at-risk widget for the therapist's "本日" page.
 * Filters to a therapist's own clients and links to /t/clients?risk=high.
 */
export function TherapistAtRiskCard({
  primaryTherapistName,
}: {
  primaryTherapistName: string;
}) {
  const hydrated = useHydrated();
  const appts = useStoredAppointments();
  const logs = useAllStoredSelfLogs();
  const photos = useAllStoredProgressPhotos();
  const messages = useAllStoredMessages();

  const { high, medium } = useMemo(() => {
    const clients = demoClientRoster
      .filter((c) => c.primaryTherapistName === primaryTherapistName)
      .map((c) => ({
        id: c.id,
        displayName: c.displayName,
        qaConversationId: `qa-client-${c.id}`,
        sessionsCompleted: c.sessionsCompleted,
        sessionsTotal: c.sessionsTotal,
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
    return { high: buckets.high.length, medium: buckets.medium.length };
  }, [appts, logs, messages, photos, primaryTherapistName]);

  if (!hydrated) return null;
  if (high + medium === 0) return null;

  return (
    <Link
      href="/t/clients?risk=high"
      className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3 transition-colors hover:bg-amber-100/60"
    >
      <AlertTriangle className="h-5 w-5 flex-none text-amber-700" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-900">
          離脱予兆あり: {high + medium} 名
        </p>
        <p className="text-[11px] text-amber-800">
          高 {high} ・ 中 {medium} ・ 確認する →
        </p>
      </div>
    </Link>
  );
}
