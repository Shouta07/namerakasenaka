"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  demoAppointments,
  demoClientRoster,
  demoProgressPhotos,
} from "@/lib/demo/fixtures";
import {
  useAllStoredMessages,
  useAllStoredProgressPhotos,
  useAllStoredSelfLogs,
  useHydrated,
  useStoredAppointments,
} from "@/lib/demo/store";
import {
  assessAllClients,
  riskLabel,
  type RetentionAppointment,
  type RetentionPhoto,
  type RetentionQaMessage,
  type RetentionSelfLog,
} from "@/lib/retention";

/**
 * Therapist client list — supports a `?risk=high` query param to filter to
 * at-risk clients (high + medium).
 */
export function TherapistClientsList({
  primaryTherapistName,
}: {
  primaryTherapistName?: string;
}) {
  const params = useSearchParams();
  const filter = params.get("risk");
  const hydrated = useHydrated();
  const appts = useStoredAppointments();
  const logs = useAllStoredSelfLogs();
  const photos = useAllStoredProgressPhotos();
  const messages = useAllStoredMessages();

  const clients = useMemo(() => {
    const all = primaryTherapistName
      ? demoClientRoster.filter(
          (c) => c.primaryTherapistName === primaryTherapistName,
        )
      : demoClientRoster;
    return all;
  }, [primaryTherapistName]);

  const riskByClientId = useMemo(() => {
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
      clients: clients.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        qaConversationId: `qa-client-${c.id}`,
        sessionsCompleted: c.sessionsCompleted,
        sessionsTotal: c.sessionsTotal,
      })),
      appointments,
      selfLogs,
      qaMessages,
      photos: photoEvents,
    });
    const m = new Map<string, "low" | "medium" | "high">();
    for (const r of buckets.high) m.set(r.clientId, "high");
    for (const r of buckets.medium) m.set(r.clientId, "medium");
    for (const r of buckets.low) m.set(r.clientId, "low");
    return m;
  }, [appts, clients, logs, messages, photos]);

  const filtered = useMemo(() => {
    if (filter === "high") {
      return clients.filter((c) => {
        const lvl = riskByClientId.get(c.id);
        return lvl === "high" || lvl === "medium";
      });
    }
    return clients;
  }, [clients, filter, riskByClientId]);

  return (
    <div className="space-y-3">
      {filter === "high" ? (
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
          離脱予兆のある担当顧客のみ表示中。
          <Link href="/t/clients" className="ml-2 underline">
            全件表示に戻す
          </Link>
        </div>
      ) : null}
      {!hydrated && filter === "high" ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
          読み込み中…
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
          {filter === "high"
            ? "離脱予兆のある担当顧客はいません 🎉"
            : "担当顧客がいません。"}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => {
            const lvl = riskByClientId.get(c.id) ?? "low";
            const rl = riskLabel(lvl);
            return (
              <li key={c.id}>
                <Link href={`/t/clients/${c.id}`} className="block">
                  <Card>
                    <CardContent className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.avatarUrl}
                        alt={c.displayName}
                        className="h-10 w-10 flex-none rounded-full bg-stone-100 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-900">
                          {c.displayName}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {c.courseName} ・ {c.sessionsCompleted}/
                          {c.sessionsTotal} 回
                        </p>
                      </div>
                      {lvl !== "low" ? (
                        <Badge tone={rl.tone}>予兆 {rl.text}</Badge>
                      ) : (
                        <Badge tone="brand">詳細を見る</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
