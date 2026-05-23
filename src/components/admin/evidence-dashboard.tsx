"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Printer } from "lucide-react";
import { KpiCards, type KpiCardItem } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import { CustomerAvatar } from "@/components/ui/customer-avatar";
import {
  demoClientRoster,
  demoProgressPhotos,
} from "@/lib/demo/fixtures";
import {
  useAllStoredProgressPhotos,
  useAllStoredSelfLogs,
  useAllStoredTreatmentRecords,
  useHydrated,
} from "@/lib/demo/store";
import {
  computeClientImprovement,
  computeSalonAggregate,
  trendLabel,
  type ClientImprovement,
  type EvidencePhoto,
  type EvidenceSelfLog,
  type EvidenceTreatmentRecord,
  type SalonAggregateClientInput,
} from "@/lib/evidence";

/**
 * Salon-wide evidence dashboard.
 *
 * Client component because it needs to merge localStorage signals into the
 * computation. Stays mobile-first; renders a stacked card layout on small
 * screens and a desktop table above sm.
 *
 * TODO(phase-1): wire production data — replace the merge below with
 * Supabase queries for clients, photos, self_logs, treatment_records.
 */
export function EvidenceDashboard() {
  const hydrated = useHydrated();
  const logs = useAllStoredSelfLogs();
  const photos = useAllStoredProgressPhotos();
  const treatments = useAllStoredTreatmentRecords();

  const summaries = useMemo(() => {
    return demoClientRoster.map((c) => {
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
      return { client: c, summary, evPhotos, evSelfLogs, evRecords };
    });
  }, [logs, photos, treatments]);

  const aggregate = useMemo(() => {
    const input: SalonAggregateClientInput[] = summaries.map((s) => ({
      clientId: s.client.id,
      photos: s.evPhotos,
      selfLogs: s.evSelfLogs,
      treatmentRecords: s.evRecords,
      courseStartedAt: s.client.startedOn,
      sessionsCompleted: s.client.sessionsCompleted,
      sessionsTotal: s.client.sessionsTotal,
    }));
    return computeSalonAggregate(input);
  }, [summaries]);

  const kpis: KpiCardItem[] = [
    {
      label: "完遂率",
      value: `${aggregate.completionRatePct}%`,
      deltaLabel: "+6pt",
      vsLabel: "先月",
      direction: "up",
      goodWhen: "up",
      tone: "brand",
    },
    {
      label: "平均改善度",
      value:
        aggregate.avgSelfRatingImprovement > 0
          ? `+${aggregate.avgSelfRatingImprovement.toFixed(2)}`
          : aggregate.avgSelfRatingImprovement.toFixed(2),
      deltaLabel: "+0.2",
      vsLabel: "先月",
      direction: "up",
      goodWhen: "up",
      tone: "brand",
    },
    {
      label: "総撮影枚数",
      value: aggregate.totalPhotos,
      deltaLabel: "+8 枚",
      vsLabel: "先月",
      direction: "up",
      goodWhen: "up",
    },
    {
      label: "改善トレンド",
      value: `${aggregate.clientsWithImprovingTrend} / ${aggregate.totalActiveClients}`,
      deltaLabel: "+1 名",
      vsLabel: "先月",
      direction: "up",
      goodWhen: "up",
    },
  ];

  return (
    <div className="space-y-4">
      <section>
        <KpiCards items={kpis} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-stone-900">
          顧客別の進捗エビデンス
        </h2>

        {!hydrated ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
            読み込み中…
          </p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <ul className="space-y-2 sm:hidden">
              {summaries.map(({ client, summary }) => (
                <li
                  key={client.id}
                  className="rounded-2xl border border-stone-200 bg-white p-3"
                >
                  <MobileSummaryCard
                    client={client}
                    summary={summary}
                  />
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 bg-white sm:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-stone-50 text-xs text-stone-500">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">顧客</th>
                    <th className="px-4 py-2 text-right font-medium">経過週</th>
                    <th className="px-4 py-2 text-right font-medium">撮影</th>
                    <th className="px-4 py-2 text-right font-medium">
                      自覚Δ
                    </th>
                    <th className="px-4 py-2 text-left font-medium">トレンド</th>
                    <th className="px-4 py-2 text-right font-medium">詳細</th>
                    <th className="px-4 py-2 text-right font-medium">
                      レポート
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map(({ client, summary }) => {
                    const tl = trendLabel(summary.trend);
                    return (
                      <tr
                        key={client.id}
                        className="border-t border-stone-100"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CustomerAvatar name={client.displayName} size="sm" role="customer" />
                            <div>
                              <p className="font-medium text-stone-900">
                                {client.displayName}
                              </p>
                              <p className="text-[11px] text-stone-500">
                                {client.courseName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-stone-700">
                          {summary.weeksTracked}
                        </td>
                        <td className="px-4 py-3 text-right text-stone-700">
                          {summary.photosCount}
                        </td>
                        <td className="px-4 py-3 text-right text-stone-700">
                          {formatDelta(summary.selfRatingDelta)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">
                            {tl.glyph} {tl.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                          >
                            開く <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/clients/${client.id}/report`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                          >
                            <Printer className="h-3 w-3" />
                            出力
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function MobileSummaryCard({
  client,
  summary,
}: {
  client: (typeof demoClientRoster)[number];
  summary: ClientImprovement;
}) {
  const tl = trendLabel(summary.trend);
  return (
    <>
      <div className="flex items-center gap-3">
        <CustomerAvatar name={client.displayName} size="md" role="customer" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-900">
            {client.displayName}
          </p>
          <p className="text-[11px] text-stone-500">{client.courseName}</p>
        </div>
        <Badge tone="brand">
          {tl.glyph} {tl.text}
        </Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="経過週" value={summary.weeksTracked.toString()} />
        <Stat label="撮影" value={summary.photosCount.toString()} />
        <Stat label="自覚Δ" value={formatDelta(summary.selfRatingDelta)} />
      </dl>
      <div className="mt-3 flex gap-2">
        <Link
          href={`/admin/clients/${client.id}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-700"
        >
          顧客を開く
        </Link>
        <Link
          href={`/admin/clients/${client.id}/report`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white"
        >
          <Printer className="h-3.5 w-3.5" />
          レポート
        </Link>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-2 py-2">
      <p className="text-[10px] text-stone-500">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold leading-none text-stone-900">
        {value}
      </p>
    </div>
  );
}

function formatDelta(d: number | null): string {
  if (d == null) return "—";
  if (d > 0) return `+${d.toFixed(2)}`;
  return d.toFixed(2);
}
