"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Calendar,
  ClipboardList,
  MessageSquare,
  StickyNote,
  CheckCircle2,
  Printer,
  AlertTriangle,
  ImageDown,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CameraCapture } from "@/components/progress/camera-capture";
import { SalonNoteComposer } from "@/components/salon/note-composer";
import { DateSlotPicker, combineDateTimeToIso } from "@/components/appointments/date-slot-picker";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  addStoredAppointment,
  addStoredProgressPhoto,
  addStoredTreatmentRecord,
  fileToResizedDataUrl,
  useHydrated,
  useStoredAppointments,
  useStoredProgressPhotos,
  useStoredSalonNotesForClient,
  useStoredSelfLogs,
  useStoredTreatmentRecords,
} from "@/lib/demo/store";
import {
  demoAppointments,
  getAvailability,
  type DayAvailability,
  type DemoClient,
  type DemoProgressPhoto,
  type DemoTreatmentRecord,
} from "@/lib/demo/fixtures";
import { cn } from "@/lib/utils/cn";
import { type PhotoType } from "@/types/domain";
import {
  BackPhotoPlaceholder,
  severityFromSelfRating,
  type BackPhotoLighting,
  type BackPhotoSeverity,
} from "@/components/progress/back-photo-placeholder";
import { CustomerAvatar } from "@/components/ui/customer-avatar";
import { relativeTimeJa } from "@/lib/demo/time";
import {
  computeClientImprovement,
  trendLabel,
  type EvidencePhoto,
  type EvidenceSelfLog,
  type EvidenceTreatmentRecord,
} from "@/lib/evidence";
import {
  assessClientRisk,
  riskLabel,
  type RetentionAppointment,
  type RetentionPhoto,
  type RetentionQaMessage,
  type RetentionSelfLog,
} from "@/lib/retention";

type ViewerRole = "salon_admin" | "therapist";

export type UnifiedCustomerDetailProps = {
  /** Customer to display. */
  client: DemoClient;
  /** Fixture-sourced photos for this client. */
  fixturePhotos: DemoProgressPhoto[];
  /** Fixture-sourced treatment records. */
  fixtureRecords: DemoTreatmentRecord[];
  /** Q&A seed (one thread per client). */
  /** Whose viewpoint — gates the "edit treatment record" affordance. */
  viewerRole: ViewerRole;
  /** Display name for the current viewer (used as note authorName). */
  viewerName?: string;
};

type TabKey =
  | "overview"
  | "evidence"
  | "photos"
  | "self_log"
  | "treatments"
  | "notes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "概要" },
  { key: "evidence", label: "エビデンス" },
  { key: "photos", label: "写真" },
  { key: "self_log", label: "セルフログ" },
  { key: "treatments", label: "施術記録" },
  { key: "notes", label: "メモ" },
];

export function UnifiedCustomerDetail({
  client,
  fixturePhotos,
  fixtureRecords,
  viewerRole,
  viewerName,
}: UnifiedCustomerDetailProps) {
  const hydrated = useHydrated();
  const [active, setActive] = useState<TabKey>("overview");
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [recordSheetOpen, setRecordSheetOpen] = useState(false);
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false);
  const [notePromptOpen, setNotePromptOpen] = useState(false);

  const storedPhotos = useStoredProgressPhotos(client.id);
  const storedRecords = useStoredTreatmentRecords(client.id);
  const storedSelfLogs = useStoredSelfLogs(client.id);
  const storedNotes = useStoredSalonNotesForClient(client.id);
  const storedAppts = useStoredAppointments();

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("compose") === "appointment") {
      setBookingSheetOpen(true);
    }
  }, [searchParams]);

  type TimelinePhoto = {
    id: string;
    signedUrl: string | null;
    caption: string | null;
    takenAt: string;
    photoType: PhotoType;
    selfRating?: number | null;
    severity?: BackPhotoSeverity;
    lighting?: BackPhotoLighting;
    source: "fixture" | "stored";
  };
  type TimelineRecord = {
    id: string;
    performedAt: string;
    therapistName: string;
    menu: string;
    durationMinutes: number;
    observations: string;
    homeCareNotes: string;
    hasVideo: boolean;
    source: "fixture" | "stored";
  };

  const photos: TimelinePhoto[] = useMemo(() => {
    const fxs: TimelinePhoto[] = fixturePhotos.map((p) => ({
      id: p.id,
      signedUrl: p.signedUrl,
      caption: p.caption,
      takenAt: p.takenAt,
      photoType: p.photoType,
      selfRating: p.selfRating,
      severity: p.severity,
      lighting: p.lighting,
      source: "fixture",
    }));
    const mine: TimelinePhoto[] = storedPhotos.map((p) => ({
      id: p.id,
      signedUrl: p.signedUrl,
      caption: p.caption,
      takenAt: p.takenAt,
      photoType: p.photoType,
      selfRating: p.selfRating ?? null,
      source: "stored",
    }));
    return [...fxs, ...mine].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  }, [fixturePhotos, storedPhotos]);

  const records: TimelineRecord[] = useMemo(() => {
    const fxs: TimelineRecord[] = fixtureRecords.map((r) => ({
      id: r.id,
      performedAt: r.performedAt,
      therapistName: r.therapistName,
      menu: r.menu,
      durationMinutes: r.durationMinutes,
      observations: r.observations,
      homeCareNotes: r.homeCareNotes,
      hasVideo: r.hasVideo,
      source: "fixture",
    }));
    const mine: TimelineRecord[] = storedRecords.map((r) => ({
      id: r.id,
      performedAt: r.performedAt,
      therapistName: r.therapistName,
      menu: r.treatmentType,
      durationMinutes: r.durationMinutes,
      observations: r.skinFindings ?? "",
      homeCareNotes: r.nextPlan ?? "",
      hasVideo: false,
      source: "stored",
    }));
    return [...fxs, ...mine].sort((a, b) => b.performedAt.localeCompare(a.performedAt));
  }, [fixtureRecords, storedRecords]);

  const selfLogs = useMemo(() => {
    return storedSelfLogs
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [storedSelfLogs]);

  const progressPct = Math.round(
    (client.sessionsCompleted / client.sessionsTotal) * 100,
  );

  // Evidence engine input (merged fixtures + stored).
  const evPhotos: EvidencePhoto[] = useMemo(
    () => [
      ...fixturePhotos.map((p) => ({
        id: p.id,
        takenAt: p.takenAt,
        photoType: p.photoType,
        selfRating: p.selfRating,
      })),
      ...storedPhotos.map((p) => ({
        id: p.id,
        takenAt: p.takenAt,
        photoType: p.photoType,
        selfRating: p.selfRating ?? null,
      })),
    ],
    [fixturePhotos, storedPhotos],
  );
  const evSelfLogs: EvidenceSelfLog[] = useMemo(
    () =>
      storedSelfLogs.map((s) => ({
        id: s.id,
        loggedOn: s.loggedOn,
        itchScore: s.itchScore,
        rednessScore: s.rednessScore,
      })),
    [storedSelfLogs],
  );
  const evRecords: EvidenceTreatmentRecord[] = useMemo(
    () => [
      ...fixtureRecords.map((r) => ({ id: r.id, performedAt: r.performedAt })),
      ...storedRecords.map((r) => ({ id: r.id, performedAt: r.performedAt })),
    ],
    [fixtureRecords, storedRecords],
  );
  const improvement = useMemo(
    () =>
      computeClientImprovement({
        photos: evPhotos,
        selfLogs: evSelfLogs,
        treatmentRecords: evRecords,
        courseStartedAt: client.startedOn,
        sessionsCompleted: client.sessionsCompleted,
        sessionsTotal: client.sessionsTotal,
      }),
    [
      client.sessionsCompleted,
      client.sessionsTotal,
      client.startedOn,
      evPhotos,
      evRecords,
      evSelfLogs,
    ],
  );

  // Retention risk input (merged fixtures + stored).
  const risk = useMemo(() => {
    const appointments: RetentionAppointment[] = [
      ...demoAppointments
        .filter((a) => a.clientId === client.id)
        .map((a) => ({
          id: a.id,
          clientId: a.clientId,
          scheduledAt: a.scheduledAt,
          status: a.status,
        })),
      ...storedAppts
        .filter((a) => a.clientId === client.id)
        .map((a) => ({
          id: a.id,
          clientId: a.clientId,
          scheduledAt: a.scheduledAt,
          status: a.status,
        })),
    ];
    const selfLogsRet: RetentionSelfLog[] = storedSelfLogs.map((s) => ({
      id: s.id,
      clientId: s.clientId,
      loggedOn: s.loggedOn,
    }));
    const photosRet: RetentionPhoto[] = [
      ...fixturePhotos.map((p) => ({
        id: p.id,
        clientId: p.clientId,
        takenAt: p.takenAt,
      })),
      ...storedPhotos.map((p) => ({
        id: p.id,
        clientId: p.clientId,
        takenAt: p.takenAt,
      })),
    ];
    // Q&A は廃止（やりとりは LINE）。離脱リスクの判定材料からも外す。
    const qaRet: RetentionQaMessage[] = [];
    return assessClientRisk({
      client: {
        id: client.id,
        displayName: client.displayName,
              sessionsCompleted: client.sessionsCompleted,
        sessionsTotal: client.sessionsTotal,
      },
      appointments,
      selfLogs: selfLogsRet,
      qaMessages: qaRet,
      photos: photosRet,
    });
  }, [
    client.displayName,
    client.id,
    client.sessionsCompleted,
    client.sessionsTotal,
    fixturePhotos,
    storedAppts,
    storedPhotos,
    storedSelfLogs,
  ]);

  return (
    <div className="space-y-4">
      <CustomerHeader
        client={client}
        progressPct={progressPct}
        risk={risk}
        viewerRole={viewerRole}
      />

      <QuickActionsRow
        onCapturePhoto={() => setPhotoSheetOpen(true)}
        onAddNote={() => setNotePromptOpen(true)}
        onAddRecord={() => setRecordSheetOpen(true)}
        onBook={() => setBookingSheetOpen(true)}
      />

      <TabBar active={active} onChange={setActive} />

      <section>
        {active === "overview" ? (
          <OverviewTab
            photos={photos}
            records={records}
            selfLogs={selfLogs}
            notes={storedNotes}
            hydrated={hydrated}
            onJump={setActive}
          />
        ) : null}
        {active === "evidence" ? (
          <EvidenceTab
            clientId={client.id}
            improvement={improvement}
          />
        ) : null}
        {active === "photos" ? (
          <PhotosTab
            clientId={client.id}
            photos={photos}
            onLaunch={() => setPhotoSheetOpen(true)}
          />
        ) : null}
        {active === "self_log" ? (
          <SelfLogTab
            clientId={client.id}
            selfLogs={selfLogs}
            hydrated={hydrated}
          />
        ) : null}
        {active === "treatments" ? (
          <TreatmentsTab
            clientId={client.id}
            records={records}
            viewerRole={viewerRole}
            onAdd={() => setRecordSheetOpen(true)}
          />
        ) : null}
        {active === "notes" ? (
          <NotesTab notes={storedNotes} hydrated={hydrated} />
        ) : null}
      </section>

      <PhotoCaptureSheet
        open={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        clientId={client.id}
      />
      <QuickRecordSheet
        open={recordSheetOpen}
        onClose={() => setRecordSheetOpen(false)}
        clientId={client.id}
        viewerName={viewerName ?? client.primaryTherapistName}
      />
      <BookingSheet
        open={bookingSheetOpen}
        onClose={() => setBookingSheetOpen(false)}
        client={client}
      />
      <NotePromptSheet
        open={notePromptOpen}
        onClose={() => setNotePromptOpen(false)}
        onPick={(key) => {
          setNotePromptOpen(false);
          setActive(key);
        }}
      />
    </div>
  );
}

// ---------- Header ----------

function CustomerHeader({
  client,
  progressPct,
  risk,
  viewerRole,
}: {
  client: DemoClient;
  progressPct: number;
  risk: {
    level: "low" | "medium" | "high";
    reasons: string[];
  };
  viewerRole: ViewerRole;
}) {
  const [tipOpen, setTipOpen] = useState(false);
  const rl = riskLabel(risk.level);
  const caseSearchHref = buildCaseSearchDeepLink(client, viewerRole);
  return (
    <section className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
      <CustomerAvatar name={client.displayName} size="lg" role="customer" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-stone-500">{client.furigana}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-stone-900">
            {client.displayName} 様
          </h1>
          <button
            type="button"
            onClick={() => setTipOpen((v) => !v)}
            className="tap-44 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            aria-label="離脱予兆の詳細"
            style={{
              background:
                rl.tone === "danger"
                  ? "#fee2e2"
                  : rl.tone === "warning"
                    ? "#fef3c7"
                    : "#f5f5f4",
              color:
                rl.tone === "danger"
                  ? "#b91c1c"
                  : rl.tone === "warning"
                    ? "#a16207"
                    : "#57534e",
            }}
          >
            <AlertTriangle className="h-3 w-3" />
            離脱予兆 {rl.text}
          </button>
        </div>
        {tipOpen && risk.reasons.length > 0 ? (
          <div className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
            {risk.reasons.join(" / ")}
          </div>
        ) : null}
        <p className="mt-0.5 text-xs text-stone-600">
          {client.courseName}・
          <span className="font-semibold">
            {client.sessionsCompleted}/{client.sessionsTotal} 回 ({progressPct}%
            完遂)
          </span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{client.skinType}</Badge>
          <Badge tone="neutral">担当: {client.primaryTherapistName}</Badge>
          <Badge tone="brand">
            開始 {new Date(client.startedOn).toLocaleDateString("ja-JP")}
          </Badge>
        </div>
      </div>
      <Link
        href={caseSearchHref}
        className="inline-flex h-11 flex-none items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-100"
      >
        <ImageDown className="h-3.5 w-3.5" />
        症例を検索
      </Link>
    </section>
  );
}

function buildCaseSearchDeepLink(client: DemoClient, viewerRole: ViewerRole): string {
  const base = viewerRole === "therapist" ? "/t/cases/search" : "/admin/cases/search";
  const params = new URLSearchParams();
  // Map "30代" → 30 as a representative age.
  const ageMatch = client.ageRange.match(/(\d+)/);
  if (ageMatch) params.set("age", String(Number(ageMatch[1])));
  // Rough heuristic: skinType mentions 敏感肌/乾燥 → light, 脂性 → medium.
  const skin = client.skinType ?? "";
  let severity: "light" | "medium" | "heavy" = "medium";
  if (skin.includes("敏感") || skin.includes("乾燥")) severity = "light";
  else if (skin.includes("脂性")) severity = "medium";
  params.set("severity", severity);
  // Seed a couple of likely tag ids based on skin keywords.
  const tagIds: string[] = [];
  if (skin.includes("乾燥")) tagIds.push("tag-dry");
  if (skin.includes("敏感")) tagIds.push("tag-itch");
  if (skin.includes("脂性")) tagIds.push("tag-oily", "tag-clog");
  if (tagIds.length > 0) params.set("tags", tagIds.join(","));
  return `${base}?${params.toString()}`;
}

// ---------- Tabs: Evidence ----------

function EvidenceTab({
  clientId,
  improvement,
}: {
  clientId: string;
  improvement: import("@/lib/evidence").ClientImprovement;
}) {
  const tl = trendLabel(improvement.trend);
  return (
    <div className="space-y-3">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">進捗サマリ</h2>
            <Link
              href={`/admin/clients/${clientId}/report`}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white"
            >
              <Printer className="h-3.5 w-3.5" />
              進捗レポートを出力
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <EvMetric label="経過週数" value={`${improvement.weeksTracked} 週`} />
            <EvMetric label="撮影枚数" value={`${improvement.photosCount} 枚`} />
            <EvMetric
              label="自覚改善度Δ"
              value={
                improvement.selfRatingDelta == null
                  ? "—"
                  : improvement.selfRatingDelta > 0
                    ? `+${improvement.selfRatingDelta.toFixed(2)}`
                    : improvement.selfRatingDelta.toFixed(2)
              }
            />
            <EvMetric label="トレンド" value={`${tl.glyph} ${tl.text}`} />
          </div>
          {improvement.itchScoreDelta != null ||
          improvement.rednessScoreDelta != null ? (
            <p className="mt-3 text-xs text-stone-600">
              {improvement.itchScoreDelta != null
                ? `痒みスコア改善: ${improvement.itchScoreDelta.toFixed(2)}　`
                : ""}
              {improvement.rednessScoreDelta != null
                ? `赤みスコア改善: ${improvement.rednessScoreDelta.toFixed(2)}`
                : ""}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] text-stone-400">
            本サマリは個別の効果効能を保証するものではなく、参考情報です。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function EvMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <p className="text-[10px] text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none text-stone-900">
        {value}
      </p>
    </div>
  );
}

// ---------- Quick actions ----------

function QuickActionsRow({
  onCapturePhoto,
  onAddNote,
  onAddRecord,
  onBook,
}: {
  onCapturePhoto: () => void;
  onAddNote: () => void;
  onAddRecord: () => void;
  onBook: () => void;
}) {
  return (
    <div
      className="sticky z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-stone-200 bg-white/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0"
      style={{ top: "calc(var(--mobile-appbar-h, 56px) + var(--pt-safe, 0px))" }}
    >
      <QuickActionButton
        icon={<Camera className="h-4 w-4" />}
        label="写真を撮る"
        onClick={onCapturePhoto}
      />
      <QuickActionButton
        icon={<StickyNote className="h-4 w-4" />}
        label="サロンメモ"
        onClick={onAddNote}
      />
      <QuickActionButton
        icon={<ClipboardList className="h-4 w-4" />}
        label="施術記録"
        onClick={onAddRecord}
      />
      <QuickActionButton
        icon={<Calendar className="h-4 w-4" />}
        label="次回予約"
        onClick={onBook}
      />
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm active:bg-stone-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ---------- Tabs ----------

function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div
      className="sticky z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-stone-200 bg-white/95 px-4 backdrop-blur md:static md:mx-0 md:border-stone-100"
      style={{ top: "calc(var(--mobile-appbar-h, 56px) + 56px + var(--pt-safe, 0px))" }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "min-h-11 flex-none border-b-2 px-3 text-sm transition-colors",
              isActive
                ? "border-brand-500 font-semibold text-brand-700"
                : "border-transparent text-stone-600",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Tabs: Overview ----------

type OverviewItem = {
  ts: string;
  kind: "photo" | "meal" | "self_log" | "treatment" | "note";
  label: string;
  detail: string;
  jumpTo: TabKey;
};

function OverviewTab({
  photos,
  records,
  selfLogs,
  notes,
  hydrated,
  onJump,
}: {
  photos: { id: string; takenAt: string; caption: string | null }[];
  records: { id: string; performedAt: string; menu: string }[];
  selfLogs: { id: string; createdAt: string; itchScore: number; rednessScore: number }[];
  notes: { id: string; createdAt: string; targetType: string; body: string }[];
  hydrated: boolean;
  onJump: (k: TabKey) => void;
}) {
  const items: OverviewItem[] = [
    ...photos.map((p) => ({
      ts: p.takenAt,
      kind: "photo" as const,
      label: "進捗写真",
      detail: p.caption ?? "写真を追加",
      jumpTo: "photos" as TabKey,
    })),
    ...records.map((r) => ({
      ts: r.performedAt,
      kind: "treatment" as const,
      label: "施術記録",
      detail: r.menu,
      jumpTo: "treatments" as TabKey,
    })),
    ...selfLogs.map((s) => ({
      ts: s.createdAt,
      kind: "self_log" as const,
      label: "セルフログ",
      detail: `痒み ${s.itchScore}/5・赤み ${s.rednessScore}/5`,
      jumpTo: "self_log" as TabKey,
    })),
    ...notes.map((n) => ({
      ts: n.createdAt,
      kind: "note" as const,
      label: "サロンメモ",
      detail: n.body,
      jumpTo: "notes" as TabKey,
    })),
  ]
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 5);

  if (!hydrated && items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        読み込み中…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        まだ記録がありません。上部のクイックアクションから追加してください。
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={`${it.kind}-${it.ts}-${it.label}`}>
          <button
            type="button"
            onClick={() => onJump(it.jumpTo)}
            className="block w-full rounded-xl border border-stone-200 bg-white p-3 text-left active:bg-stone-50"
          >
            <div className="flex items-center justify-between">
              <Badge tone="brand">{it.label}</Badge>
              <span className="text-[11px] text-stone-500">
                {new Date(it.ts).toLocaleString("ja-JP")}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm text-stone-700">
              {it.detail}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}

// ---------- Tabs: Photos ----------

function PhotosTab({
  clientId,
  photos,
  onLaunch,
}: {
  clientId: string;
  photos: {
    id: string;
    signedUrl: string | null;
    caption: string | null;
    takenAt: string;
    photoType: PhotoType;
    selfRating?: number | null;
    severity?: BackPhotoSeverity;
    lighting?: BackPhotoLighting;
  }[];
  onLaunch: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-900">進捗写真</h2>
        <Button size="sm" variant="secondary" onClick={onLaunch}>
          <Camera className="h-3.5 w-3.5" />
          新しい写真をアップロード
        </Button>
      </div>
      {photos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          写真はまだありません。上のボタンから追加してください。
        </p>
      ) : (
        <ul className="space-y-4">
          {photos.map((p) => (
            <li key={p.id} className="rounded-2xl border border-stone-200 bg-white">
              <div className="aspect-[3/4] w-full rounded-t-2xl bg-stone-100">
                {p.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.signedUrl}
                    alt={p.caption ?? "進捗写真"}
                    className="h-full w-full rounded-t-2xl object-cover"
                  />
                ) : (
                  <BackPhotoPlaceholder
                    severity={p.severity ?? severityFromSelfRating(p.selfRating)}
                    lighting={p.lighting ?? "warm"}
                    caption={p.caption ?? "進捗写真"}
                  />
                )}
              </div>
              <div className="px-4 pb-4 pt-3">
                <div className="flex items-center justify-between">
                  <Badge tone="neutral">{p.photoType}</Badge>
                  <span className="text-[11px] text-stone-500">
                    {relativeTimeJa(p.takenAt)}
                  </span>
                </div>
                {p.caption ? (
                  <p className="mt-2 text-sm text-stone-700">{p.caption}</p>
                ) : null}
                <SalonNoteComposer
                  clientId={clientId}
                  targetType="photo"
                  targetId={p.id}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Tabs: Self-log ----------

function SelfLogTab({
  clientId,
  selfLogs,
  hydrated,
}: {
  clientId: string;
  selfLogs: {
    id: string;
    createdAt: string;
    itchScore: number;
    rednessScore: number;
    newBreakout: boolean;
    memo: string | null;
  }[];
  hydrated: boolean;
}) {
  if (!hydrated) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        読み込み中…
      </p>
    );
  }
  if (selfLogs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        セルフログはまだありません。顧客がアプリで記録すると、ここに表示されます。
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {selfLogs.map((s) => (
        <li key={s.id}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">
                  痒み {s.itchScore}/5 ・ 赤み {s.rednessScore}/5
                </p>
                <span className="text-[11px] text-stone-500">
                  {new Date(s.createdAt).toLocaleString("ja-JP")}
                </span>
              </div>
              {s.newBreakout ? (
                <p className="mt-1 text-xs text-amber-700">
                  新規の吹き出物あり
                </p>
              ) : null}
              {s.memo ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
                  {s.memo}
                </p>
              ) : null}
              <SalonNoteComposer
                clientId={clientId}
                targetType="self_log"
                targetId={s.id}
              />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

// ---------- Tabs: Treatments ----------

function TreatmentsTab({
  clientId,
  records,
  viewerRole,
  onAdd,
}: {
  clientId: string;
  records: {
    id: string;
    performedAt: string;
    therapistName: string;
    menu: string;
    durationMinutes: number;
    observations: string;
    homeCareNotes: string;
    hasVideo: boolean;
    source: "fixture" | "stored";
  }[];
  viewerRole: ViewerRole;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-900">施術記録</h2>
        <Button size="sm" variant="primary" onClick={onAdd}>
          90秒で記録
        </Button>
      </div>
      {records.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          施術記録はまだありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {records.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">
                      {new Date(r.performedAt).toLocaleDateString("ja-JP")} ・{" "}
                      {r.menu}
                    </p>
                    {r.hasVideo ? (
                      <Badge tone="warning">動画あり</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    {r.therapistName} ・ {r.durationMinutes} 分
                  </p>
                  {r.observations ? (
                    <p className="mt-2 text-sm text-stone-700">
                      {r.observations}
                    </p>
                  ) : null}
                  {r.homeCareNotes ? (
                    <p className="mt-1 text-xs text-stone-500">
                      ホームケア: {r.homeCareNotes}
                    </p>
                  ) : null}
                  {viewerRole === "salon_admin" ||
                  (viewerRole === "therapist" && r.source === "stored") ? (
                    <p className="mt-2 text-[11px] text-stone-400">
                      {/* TODO(phase-1): この表示はクライアント側の判定でしかない。
                          本番では treatment_records の RLS ポリシーが権限の真の境界で、
                          ここはその結果を映すだけにする（表示と強制を二重化しない）。 */}
                      編集権限あり
                    </p>
                  ) : null}
                  <SalonNoteComposer
                    clientId={clientId}
                    targetType="treatment_record"
                    targetId={r.id}
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Tabs: Q&A ----------

function NotesTab({
  notes,
  hydrated,
}: {
  notes: {
    id: string;
    createdAt: string;
    body: string;
    targetType: string;
    authorRole: string;
    authorName: string;
  }[];
  hydrated: boolean;
}) {
  if (!hydrated) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        読み込み中…
      </p>
    );
  }
  if (notes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        サロンメモはまだありません。各タブの記録にメモを追加できます。
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {notes
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((n) => (
          <li
            key={n.id}
            className="rounded-xl border border-stone-200 bg-white p-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <Badge tone="brand">{labelForTargetType(n.targetType)}</Badge>
              <span className="text-stone-500">
                {new Date(n.createdAt).toLocaleString("ja-JP")}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-stone-700">{n.body}</p>
            <p className="mt-1 text-[10px] text-stone-400">
              — {n.authorName} (
              {n.authorRole === "therapist" ? "セラピスト" : "サロン管理者"})
            </p>
          </li>
        ))}
    </ul>
  );
}

function labelForTargetType(t: string): string {
  switch (t) {
    case "photo":
      return "写真メモ";
    case "self_log":
      return "セルフログメモ";
    case "meal_log":
      return "食事メモ";
    case "treatment_record":
      return "施術メモ";
    case "qa_thread":
      return "Q&Aメモ";
    default:
      return "メモ";
  }
}

// ---------- Bottom sheets ----------

function PhotoCaptureSheet({
  open,
  onClose,
  clientId,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
}) {
  const [photoType, setPhotoType] = useState<PhotoType>("after");
  const [captured, setCaptured] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!captured) {
      toast.error("撮影が完了していません");
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await fileToResizedDataUrl(captured, 1024, 0.82);
      addStoredProgressPhoto({
        clientId,
        photoType,
        caption: caption.trim() || null,
        signedUrl: dataUrl,
        takenAt: new Date().toISOString(),
      });
      toast.success("写真を保存しました");
      setCaptured(null);
      setCaption("");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "save_failed";
      toast.error(`保存に失敗しました (${msg})`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="進捗写真を追加">
      <div className="flex gap-2">
        {(["before", "after"] as PhotoType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setPhotoType(t)}
            className={cn(
              "min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
              photoType === t
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-stone-200 bg-white text-stone-700",
            )}
          >
            {t === "before" ? "施術前" : "施術後"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <CameraCapture onCapture={setCaptured} disabled={saving} />
      </div>

      <label className="mt-3 block text-xs text-stone-600">
        ファイルから選択 (カメラが使えない場合)
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="mt-1 block w-full text-xs"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setCaptured(f);
          }}
        />
      </label>

      <div className="mt-3 space-y-1.5">
        <Label htmlFor="caption">キャプション (任意)</Label>
        <Input
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          autoComplete="off"
          inputMode="text"
        />
      </div>

      {captured ? (
        <p className="mt-2 text-xs text-stone-600">
          撮影済み: {captured.name} ({Math.round(captured.size / 1024)} KB)
        </p>
      ) : null}

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
          onClick={handleSave}
          disabled={!captured || saving}
          className="flex-1"
        >
          {saving ? "保存中…" : "保存"}
        </Button>
      </div>
    </BottomSheet>
  );
}

function QuickRecordSheet({
  open,
  onClose,
  clientId,
  viewerName,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  viewerName: string;
}) {
  const [treatmentType, setTreatmentType] = useState(
    "クレイトリートメント + 保湿パック",
  );
  const [skinFindings, setSkinFindings] = useState("");
  const [nextPlan, setNextPlan] = useState("4週間後・同曜日 15:00");
  const [saving, setSaving] = useState(false);

  function save() {
    if (!treatmentType.trim()) {
      toast.error("施術内容を入力してください");
      return;
    }
    const check = containsBannedWord(`${treatmentType} ${skinFindings} ${nextPlan}`);
    if (!check.ok) {
      toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
      return;
    }
    setSaving(true);
    try {
      addStoredTreatmentRecord({
        clientId,
        therapistName: viewerName,
        treatmentType,
        productsUsed: null,
        skinFindings: skinFindings || null,
        nextPlan: nextPlan || null,
        cautions: null,
        performedAt: new Date().toISOString(),
        durationMinutes: 90,
      });
      toast.success("施術記録を保存しました");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="施術記録 (90秒)">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="qr-tt">施術内容</Label>
          <Input
            id="qr-tt"
            value={treatmentType}
            onChange={(e) => setTreatmentType(e.target.value)}
            autoComplete="off"
            inputMode="text"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qr-sf">所見 (任意)</Label>
          <Textarea
            id="qr-sf"
            value={skinFindings}
            onChange={(e) => setSkinFindings(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qr-np">次回プラン (任意)</Label>
          <Input
            id="qr-np"
            value={nextPlan}
            onChange={(e) => setNextPlan(e.target.value)}
            autoComplete="off"
            inputMode="text"
          />
        </div>
        <div className="flex gap-2 pt-2 pb-1">
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
            disabled={saving}
            className="flex-1"
          >
            {saving ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

function BookingSheet({
  open,
  onClose,
  client,
}: {
  open: boolean;
  onClose: () => void;
  client: DemoClient;
}) {
  const availability: DayAvailability[] = useMemo(
    () =>
      getAvailability({
        therapistName: client.primaryTherapistName,
        daysAhead: 14,
      }),
    [client.primaryTherapistName],
  );
  const recommendedDate = availability.find((d) => d.isRecommended)?.date;
  const [selectedDate, setSelectedDate] = useState<string | null>(recommendedDate ?? null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onConfirm = ({ date, time }: { date: string; time: string }) => {
    setSubmitting(true);
    try {
      const iso = combineDateTimeToIso(date, time);
      addStoredAppointment({
        clientId: client.id,
        therapistId: client.primaryTherapistName,
        scheduledAt: iso,
        durationMin: 90,
        status: "confirmed",
        menuName: "背中トリートメント 90 分",
        clientName: client.displayName,
        therapistName: client.primaryTherapistName,
      });
      toast.success("ご予約を確定しました");
      setTimeout(onClose, 300);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "store_error";
      toast.error(`予約の保存に失敗しました（${msg}）`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="次回予約">
      <DateSlotPicker
        availability={availability}
        selectedDate={selectedDate}
        onSelectDate={(d) => {
          setSelectedDate(d);
          setSelectedTime(null);
        }}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        recommendedDate={recommendedDate}
        recommendedTime="14:00"
        therapistName={client.primaryTherapistName}
        onConfirm={onConfirm}
        submitting={submitting}
      />
    </BottomSheet>
  );
}

function NotePromptSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (k: TabKey) => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="メモを残す対象を選択">
      <p className="text-xs text-stone-600">
        サロンメモは、どの記録に紐付けるかを選んで投稿します。
      </p>
      <ul className="mt-3 space-y-2">
        {[
          { key: "photos" as TabKey, label: "写真に残す", icon: <Camera className="h-4 w-4" /> },
          { key: "meals" as TabKey, label: "食事ログに残す", icon: <MessageSquare className="h-4 w-4" /> },
          { key: "self_log" as TabKey, label: "セルフログに残す", icon: <CheckCircle2 className="h-4 w-4" /> },
          { key: "treatments" as TabKey, label: "施術記録に残す", icon: <ClipboardList className="h-4 w-4" /> },
        ].map((opt) => (
          <li key={opt.key}>
            <button
              type="button"
              onClick={() => onPick(opt.key)}
              className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left active:bg-stone-50"
            >
              <span className="text-brand-700">{opt.icon}</span>
              <span className="text-sm font-medium text-stone-900">{opt.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
