"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, MessageSquare, CalendarPlus, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Textarea } from "@/components/ui/textarea";
import { CustomerAvatar } from "@/components/ui/customer-avatar";
import { relativeTimeJa } from "@/lib/demo/time";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  addStoredMessage,
  addStoredSalonNote,
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
  type DemoClient,
} from "@/lib/demo/fixtures";
import {
  assessAllClients,
  riskLabel,
  type ClientRisk,
  type RetentionAppointment,
  type RetentionPhoto,
  type RetentionQaMessage,
  type RetentionSelfLog,
} from "@/lib/retention";

type ScopedClient = DemoClient & { qaConversationId: string };

export type AtRiskListProps = {
  /** When set, narrow the list to clients whose primary therapist matches. */
  filterPrimaryTherapistName?: string;
  /** Hide the explainer / show a more compact list for embedded contexts. */
  compact?: boolean;
};

/**
 * Client-side at-risk list. Computes risk from merged fixtures + localStorage
 * so the demo feels alive even without backend wiring.
 *
 * TODO(phase-1): wire production data — replace fixtures+localStorage merge
 * with Supabase reads gated by RLS.
 */
export function AtRiskList({
  filterPrimaryTherapistName,
  compact = false,
}: AtRiskListProps) {
  const hydrated = useHydrated();
  const storedAppts = useStoredAppointments();
  const storedSelfLogsAll = useAllStoredSelfLogs();
  const storedPhotosAll = useAllStoredProgressPhotos();
  const allMessages = useAllStoredMessages();

  const baseClients: ScopedClient[] = useMemo(() => {
    const all = demoClientRoster.map((c) => ({
      ...c,
      qaConversationId: `qa-client-${c.id}`,
    }));
    return filterPrimaryTherapistName
      ? all.filter((c) => c.primaryTherapistName === filterPrimaryTherapistName)
      : all;
  }, [filterPrimaryTherapistName]);

  const appointments: RetentionAppointment[] = useMemo(() => {
    const fxs: RetentionAppointment[] = demoAppointments.map((a) => ({
      id: a.id,
      clientId: a.clientId,
      scheduledAt: a.scheduledAt,
      status: a.status,
    }));
    const mine: RetentionAppointment[] = storedAppts.map((a) => ({
      id: a.id,
      clientId: a.clientId,
      scheduledAt: a.scheduledAt,
      status: a.status,
    }));
    return [...fxs, ...mine];
  }, [storedAppts]);

  const selfLogs: RetentionSelfLog[] = useMemo(() => {
    return storedSelfLogsAll.map((s) => ({
      id: s.id,
      clientId: s.clientId,
      loggedOn: s.loggedOn,
    }));
  }, [storedSelfLogsAll]);

  const photos: RetentionPhoto[] = useMemo(() => {
    const fxs: RetentionPhoto[] = demoProgressPhotos.map((p) => ({
      id: p.id,
      clientId: p.clientId,
      takenAt: p.takenAt,
    }));
    const mine: RetentionPhoto[] = storedPhotosAll.map((p) => ({
      id: p.id,
      clientId: p.clientId,
      takenAt: p.takenAt,
    }));
    return [...fxs, ...mine];
  }, [storedPhotosAll]);

  const qaMessages: RetentionQaMessage[] = useMemo(() => {
    return allMessages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      createdAt: m.createdAt,
      isMine: m.isMine,
    }));
  }, [allMessages]);

  const buckets = useMemo(() => {
    return assessAllClients({
      clients: baseClients.map((c) => ({
        id: c.id,
        displayName: c.displayName,
        qaConversationId: c.qaConversationId,
        sessionsCompleted: c.sessionsCompleted,
        sessionsTotal: c.sessionsTotal,
      })),
      appointments,
      selfLogs,
      qaMessages,
      photos,
    });
  }, [appointments, baseClients, photos, qaMessages, selfLogs]);

  const ordered = useMemo(
    () => [...buckets.high, ...buckets.medium],
    [buckets],
  );

  const clientById = useMemo(() => {
    const m = new Map<string, ScopedClient>();
    for (const c of baseClients) m.set(c.id, c);
    return m;
  }, [baseClients]);

  const [messageTarget, setMessageTarget] = useState<ClientRisk | null>(null);
  const [noteTarget, setNoteTarget] = useState<ClientRisk | null>(null);

  if (!hydrated) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
        読み込み中…
      </p>
    );
  }

  if (ordered.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-2 text-base font-semibold text-emerald-900">
          現在、離脱予兆のある顧客はいません
        </p>
        <p className="mt-2 text-xs text-emerald-800">
          追跡対象: 最終来店日 ・ セルフログ継続 ・ 未返信Q&A ・ コース完了後の次回予約
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!compact ? (
        <p className="rounded-xl bg-stone-50 px-3 py-2 text-[11px] text-stone-600">
          来店間隔・セルフログ・未返信Q&A・コース完了後の次回予約状況をもとに、
          能動的にフォローしたい顧客を自動で抽出しています。
        </p>
      ) : null}
      <ul className="space-y-2">
        {ordered.map((risk) => {
          const c = clientById.get(risk.clientId);
          if (!c) return null;
          const label = riskLabel(risk.level);
          return (
            <li
              key={risk.clientId}
              className="rounded-2xl border border-stone-200 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <CustomerAvatar name={c.displayName} size="md" role="customer" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="text-base font-semibold text-stone-900 hover:underline"
                    >
                      {c.displayName} 様
                    </Link>
                    <Badge tone={label.tone}>
                      <AlertTriangle className="-ml-0.5 mr-1 inline h-3 w-3" />
                      予兆 {label.text}
                    </Badge>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {risk.reasons.slice(0, 2).map((r) => (
                      <li key={r} className="text-xs text-stone-600">
                        ・{r}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[11px] text-stone-400">
                    最終アクティビティ:{" "}
                    {risk.lastActivityAt
                      ? relativeTimeJa(risk.lastActivityAt)
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => setMessageTarget(risk)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  メッセージ
                </Button>
                <Link href={`/admin/clients/${c.id}?compose=appointment`}>
                  <Button type="button" size="sm" variant="secondary">
                    <CalendarPlus className="h-3.5 w-3.5" />
                    予約打診
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setNoteTarget(risk)}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  サロンメモ
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <MessageSheet
        target={messageTarget}
        clientById={clientById}
        onClose={() => setMessageTarget(null)}
      />
      <SalonNoteSheet
        target={noteTarget}
        clientById={clientById}
        onClose={() => setNoteTarget(null)}
      />
    </div>
  );
}

function MessageSheet({
  target,
  clientById,
  onClose,
}: {
  target: ClientRisk | null;
  clientById: Map<string, ScopedClient>;
  onClose: () => void;
}) {
  const client = target ? (clientById.get(target.clientId) ?? null) : null;
  const defaultBody = client
    ? `${client.displayName}様、最近のお調子はいかがですか？お困りごとがあれば、いつでもお声がけください。`
    : "";
  const [body, setBody] = useState<string>(defaultBody);
  const [sending, setSending] = useState(false);

  useResetOnOpen(target, () => setBody(defaultBody));

  if (!target || !client) return null;

  function send() {
    if (!client) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    const check = containsBannedWord(trimmed);
    if (!check.ok) {
      toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
      return;
    }
    setSending(true);
    try {
      addStoredMessage({
        conversationId: `qa-client-${client.id}`,
        body: trimmed,
        isMine: true,
        isAutoReply: false,
      });
      toast.success(`${client.displayName}様にメッセージを送信しました`);
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <BottomSheet
      open={Boolean(target)}
      onClose={onClose}
      title={`${client.displayName}様へメッセージ`}
    >
      <p className="text-xs text-stone-500">
        テンプレートをご活用ください。送信前にカスタマイズも可能です。
      </p>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        className="mt-3"
      />
      <div className="mt-4 flex gap-2 pb-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={sending}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="button"
          onClick={send}
          disabled={sending || !body.trim()}
          className="flex-1"
        >
          {sending ? "送信中…" : "送信する"}
        </Button>
      </div>
    </BottomSheet>
  );
}

function SalonNoteSheet({
  target,
  clientById,
  onClose,
}: {
  target: ClientRisk | null;
  clientById: Map<string, ScopedClient>;
  onClose: () => void;
}) {
  const client = target ? (clientById.get(target.clientId) ?? null) : null;
  const defaultBody = target
    ? `離脱予兆フォロー: ${target.reasons.join(" / ")}`
    : "";
  const [body, setBody] = useState<string>(defaultBody);
  const [saving, setSaving] = useState(false);

  useResetOnOpen(target, () => setBody(defaultBody));

  if (!target || !client) return null;

  function save() {
    if (!target || !client) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    const check = containsBannedWord(trimmed);
    if (!check.ok) {
      toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
      return;
    }
    setSaving(true);
    try {
      addStoredSalonNote({
        clientId: client.id,
        targetType: "qa_thread",
        targetId: `qa-client-${client.id}`,
        authorRole: "salon_admin",
        authorName: "サロン管理者",
        body: trimmed,
      });
      toast.success("サロンメモを保存しました");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={Boolean(target)}
      onClose={onClose}
      title={`${client.displayName}様にメモ`}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="mt-1"
      />
      <div className="mt-4 flex gap-2 pb-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={saving}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="button"
          onClick={save}
          disabled={saving || !body.trim()}
          className="flex-1"
        >
          {saving ? "保存中…" : "メモを保存"}
        </Button>
      </div>
    </BottomSheet>
  );
}

/** Reset a piece of local state whenever the open target changes. */
function useResetOnOpen<T>(target: T | null, reset: () => void) {
  const lastRef = useRef<T | null>(null);
  useEffect(() => {
    if (target && target !== lastRef.current) {
      lastRef.current = target;
      reset();
    } else if (!target) {
      lastRef.current = null;
    }
  }, [target, reset]);
}
