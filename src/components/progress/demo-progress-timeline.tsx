"use client";

import { useMemo } from "react";
import {
  PhotoTimeline,
  type TimelinePhoto,
} from "@/components/progress/photo-timeline";
import { demoClient, demoProgressPhotos } from "@/lib/demo/fixtures";
import { useStoredProgressPhotos } from "@/lib/demo/store";

/**
 * 毎日ひらく画面なので、既定では直近だけ出す。
 * 全部を並べると縦に長くなり、下にある「次の一歩」まで届かない。
 */
export function DemoProgressTimeline({ limit }: { limit?: number } = {}) {
  const stored = useStoredProgressPhotos(demoClient.id);

  const merged = useMemo<TimelinePhoto[]>(() => {
    const fixtures: TimelinePhoto[] = demoProgressPhotos
      .filter((p) => p.clientId === demoClient.id)
      .map((p) => ({
        id: p.id,
        takenAt: p.takenAt,
        photoType: p.photoType,
        signedUrl: p.signedUrl,
        caption: p.caption,
        selfRating: p.selfRating,
        severity: p.severity,
        lighting: p.lighting,
      }));
    const mine: TimelinePhoto[] = stored.map((p) => ({
      id: p.id,
      takenAt: p.takenAt,
      photoType: p.photoType,
      signedUrl: p.signedUrl,
      caption: p.caption,
      selfRating: p.selfRating ?? null,
    }));
    return [...mine, ...fixtures].sort((a, b) =>
      b.takenAt.localeCompare(a.takenAt),
    );
  }, [stored]);

  return <PhotoTimeline photos={limit ? merged.slice(0, limit) : merged} />;
}
