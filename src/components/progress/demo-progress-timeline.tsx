"use client";

import { useMemo } from "react";
import {
  PhotoTimeline,
  type TimelinePhoto,
} from "@/components/progress/photo-timeline";
import { demoClient, demoProgressPhotos } from "@/lib/demo/fixtures";
import { useStoredProgressPhotos } from "@/lib/demo/store";

export function DemoProgressTimeline() {
  const stored = useStoredProgressPhotos(demoClient.id);

  const merged = useMemo<TimelinePhoto[]>(() => {
    const fixtures: TimelinePhoto[] = demoProgressPhotos.map((p) => ({
      id: p.id,
      takenAt: p.takenAt,
      photoType: p.photoType,
      signedUrl: p.signedUrl,
      caption: p.caption,
      selfRating: p.selfRating,
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

  return <PhotoTimeline photos={merged} />;
}
