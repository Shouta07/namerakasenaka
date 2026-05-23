"use client";

import { useMemo } from "react";
import { MonthlyHighlights, type HighlightItem } from "@/components/admin/monthly-highlights";
import {
  useAllStoredProgressPhotos,
  useAllStoredSelfLogs,
  useAllStoredTreatmentRecords,
  useHydrated,
} from "@/lib/demo/store";
import { demoClientRoster, demoProgressPhotos } from "@/lib/demo/fixtures";
import {
  computeClientImprovement,
  type EvidencePhoto,
  type EvidenceSelfLog,
  type EvidenceTreatmentRecord,
} from "@/lib/evidence";

/**
 * Computes "this month's top 3 improvements" by self-rating delta across the
 * fixture + stored photo dataset. Wraps MonthlyHighlights.
 */
export function HighlightsSection() {
  const hydrated = useHydrated();
  const storedPhotos = useAllStoredProgressPhotos();
  const storedLogs = useAllStoredSelfLogs();
  const storedRecords = useAllStoredTreatmentRecords();

  const items: HighlightItem[] = useMemo(() => {
    return demoClientRoster.map((c) => {
      const photos: EvidencePhoto[] = [
        ...demoProgressPhotos
          .filter((p) => p.clientId === c.id)
          .map((p) => ({
            id: p.id,
            takenAt: p.takenAt,
            photoType: p.photoType,
            selfRating: p.selfRating,
          })),
        ...storedPhotos
          .filter((p) => p.clientId === c.id)
          .map((p) => ({
            id: p.id,
            takenAt: p.takenAt,
            photoType: p.photoType,
            selfRating: p.selfRating ?? null,
          })),
      ];
      const selfLogs: EvidenceSelfLog[] = storedLogs
        .filter((s) => s.clientId === c.id)
        .map((s) => ({
          id: s.id,
          loggedOn: s.loggedOn,
          itchScore: s.itchScore,
          rednessScore: s.rednessScore,
        }));
      const records: EvidenceTreatmentRecord[] = storedRecords
        .filter((r) => r.clientId === c.id)
        .map((r) => ({ id: r.id, performedAt: r.performedAt }));
      const summary = computeClientImprovement({
        photos,
        selfLogs,
        treatmentRecords: records,
        courseStartedAt: c.startedOn,
        sessionsCompleted: c.sessionsCompleted,
        sessionsTotal: c.sessionsTotal,
      });
      const sortedPhotos = photos
        .slice()
        .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
      const earliest = sortedPhotos[0]?.selfRating ?? null;
      const latest = sortedPhotos[sortedPhotos.length - 1]?.selfRating ?? null;
      return {
        clientId: c.id,
        clientName: c.displayName,
        weeksTracked: summary.weeksTracked,
        selfRatingDelta: summary.selfRatingDelta ?? 0,
        earliestRating: earliest,
        latestRating: latest,
      } satisfies HighlightItem;
    });
  }, [storedPhotos, storedLogs, storedRecords]);

  if (!hydrated) {
    return (
      <div className="h-48 rounded-lg border border-stone-200 bg-white" />
    );
  }

  return <MonthlyHighlights items={items} />;
}
