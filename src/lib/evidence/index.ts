/**
 * Evidence aggregation engine.
 *
 * Pure typed helpers — no Supabase, no localStorage. Pass in already-hydrated
 * data and receive a typed summary. Used by:
 *  - /admin/evidence (salon-wide aggregate)
 *  - the unified customer detail "エビデンス" tab
 *  - the printable progress report
 *
 * Trend labels follow §8 copy rules — we never claim cause/effect.
 */

import type { PhotoType } from "@/types/domain";

/** Minimum signal required for a trustworthy trend assessment. */
export const MIN_WEEKS_FOR_TREND = 4;
export const MIN_DATAPOINTS_FOR_TREND = 6;

export type EvidencePhoto = {
  id: string;
  takenAt: string;
  photoType: PhotoType;
  selfRating?: number | null;
};

export type EvidenceSelfLog = {
  id: string;
  loggedOn: string;
  itchScore: number;
  rednessScore: number;
};

export type EvidenceTreatmentRecord = {
  id: string;
  performedAt: string;
};

export type ClientImprovementTrend =
  | "improving"
  | "stable"
  | "regressing"
  | "insufficient_data";

export type ClientImprovement = {
  weeksTracked: number;
  photosCount: number;
  /** Latest self_rating minus first self_rating (1-5). Higher is better. */
  selfRatingDelta: number | null;
  /**
   * Drop in itch (first − latest). Positive number means improvement.
   * Null if too little data.
   */
  itchScoreDelta: number | null;
  /**
   * Drop in redness (first − latest). Positive number means improvement.
   * Null if too little data.
   */
  rednessScoreDelta: number | null;
  /** Sessions completed / total (0-100). Null if no course info. */
  courseProgressPct: number | null;
  trend: ClientImprovementTrend;
  lastActivityAt: Date | null;
};

export type EvidenceClientInput = {
  photos: EvidencePhoto[];
  selfLogs: EvidenceSelfLog[];
  treatmentRecords: EvidenceTreatmentRecord[];
  /** Course start (ISO or YYYY-MM-DD). */
  courseStartedAt?: string | null;
  /** Sessions completed in the course. */
  sessionsCompleted?: number;
  /** Total sessions in the course. */
  sessionsTotal?: number;
  /** Today, defaults to `new Date()`. */
  today?: Date;
};

function parseDate(value: string): Date {
  // Accept both ISO and YYYY-MM-DD; if YYYY-MM-DD, treat as JST start of day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+09:00`);
  }
  return new Date(value);
}

function diffWeeks(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24 * 7));
}

function meanRating(photos: EvidencePhoto[]): number | null {
  const rated = photos
    .map((p) => p.selfRating)
    .filter((r): r is number => typeof r === "number");
  if (rated.length === 0) return null;
  return rated.reduce((a, b) => a + b, 0) / rated.length;
}

function pickFirstAndLast<T extends { ts: string }>(
  items: T[],
): { first: T; last: T } | null {
  if (items.length < 2) return null;
  const sorted = items.slice().sort((a, b) => a.ts.localeCompare(b.ts));
  return { first: sorted[0], last: sorted[sorted.length - 1] };
}

/**
 * Compute the improvement summary for a single client.
 *
 * Pure — does not read from localStorage or Supabase. Caller hydrates data.
 */
export function computeClientImprovement(
  input: EvidenceClientInput,
): ClientImprovement {
  const today = input.today ?? new Date();
  const { photos, selfLogs, treatmentRecords, courseStartedAt } = input;

  // weeksTracked: max(time since course start, time since first photo).
  let earliest: Date | null = null;
  if (courseStartedAt) earliest = parseDate(courseStartedAt);
  for (const p of photos) {
    const d = parseDate(p.takenAt);
    if (!earliest || d < earliest) earliest = d;
  }
  for (const s of selfLogs) {
    const d = parseDate(s.loggedOn);
    if (!earliest || d < earliest) earliest = d;
  }
  for (const r of treatmentRecords) {
    const d = parseDate(r.performedAt);
    if (!earliest || d < earliest) earliest = d;
  }
  const weeksTracked = earliest ? Math.round(diffWeeks(earliest, today)) : 0;

  // selfRatingDelta from photos.
  const photosWithRating = photos
    .filter((p) => typeof p.selfRating === "number")
    .map((p) => ({ ts: p.takenAt, rating: p.selfRating as number }));
  let selfRatingDelta: number | null = null;
  if (photosWithRating.length >= 2) {
    // Use earliest half mean vs latest half mean for stability if many points;
    // otherwise simple first vs last.
    if (photosWithRating.length >= 4) {
      const sorted = photosWithRating
        .slice()
        .sort((a, b) => a.ts.localeCompare(b.ts));
      const half = Math.floor(sorted.length / 2);
      const firstMean =
        sorted.slice(0, half).reduce((a, b) => a + b.rating, 0) / half;
      const lastMean =
        sorted.slice(-half).reduce((a, b) => a + b.rating, 0) / half;
      selfRatingDelta = Number((lastMean - firstMean).toFixed(2));
    } else {
      const pair = pickFirstAndLast(photosWithRating);
      if (pair) {
        selfRatingDelta = Number((pair.last.rating - pair.first.rating).toFixed(2));
      }
    }
  } else if (photosWithRating.length === 1 && photos.length > 0) {
    // Single rating — no delta possible.
    selfRatingDelta = null;
    void meanRating; // keep helper referenced for future use
  }

  // itch / redness delta from self_logs. We expose improvement as positive.
  let itchScoreDelta: number | null = null;
  let rednessScoreDelta: number | null = null;
  if (selfLogs.length >= 2) {
    const sorted = selfLogs
      .slice()
      .sort((a, b) => a.loggedOn.localeCompare(b.loggedOn));
    // Use first 3 and last 3 means if available, otherwise first/last.
    const window = Math.min(3, Math.floor(sorted.length / 2)) || 1;
    const firstSlice = sorted.slice(0, window);
    const lastSlice = sorted.slice(-window);
    const firstItch =
      firstSlice.reduce((a, b) => a + b.itchScore, 0) / firstSlice.length;
    const lastItch =
      lastSlice.reduce((a, b) => a + b.itchScore, 0) / lastSlice.length;
    const firstRed =
      firstSlice.reduce((a, b) => a + b.rednessScore, 0) / firstSlice.length;
    const lastRed =
      lastSlice.reduce((a, b) => a + b.rednessScore, 0) / lastSlice.length;
    itchScoreDelta = Number((firstItch - lastItch).toFixed(2));
    rednessScoreDelta = Number((firstRed - lastRed).toFixed(2));
  }

  // courseProgressPct.
  let courseProgressPct: number | null = null;
  if (
    typeof input.sessionsCompleted === "number" &&
    typeof input.sessionsTotal === "number" &&
    input.sessionsTotal > 0
  ) {
    courseProgressPct = Math.round(
      (input.sessionsCompleted / input.sessionsTotal) * 100,
    );
  }

  // lastActivityAt.
  let lastActivityAt: Date | null = null;
  const allDates: Date[] = [
    ...photos.map((p) => parseDate(p.takenAt)),
    ...selfLogs.map((s) => parseDate(s.loggedOn)),
    ...treatmentRecords.map((r) => parseDate(r.performedAt)),
  ];
  if (allDates.length > 0) {
    lastActivityAt = allDates.reduce((a, b) => (a > b ? a : b));
  }

  // trend.
  const totalDatapoints =
    photos.length + selfLogs.length + treatmentRecords.length;
  let trend: ClientImprovementTrend;
  if (
    weeksTracked < MIN_WEEKS_FOR_TREND ||
    totalDatapoints < MIN_DATAPOINTS_FOR_TREND
  ) {
    trend = "insufficient_data";
  } else {
    // Combine signals.
    let score = 0;
    if (selfRatingDelta != null) {
      if (selfRatingDelta >= 0.6) score += 2;
      else if (selfRatingDelta >= 0.2) score += 1;
      else if (selfRatingDelta <= -0.6) score -= 2;
      else if (selfRatingDelta <= -0.2) score -= 1;
    }
    if (itchScoreDelta != null) {
      if (itchScoreDelta >= 0.6) score += 1;
      else if (itchScoreDelta <= -0.6) score -= 1;
    }
    if (rednessScoreDelta != null) {
      if (rednessScoreDelta >= 0.6) score += 1;
      else if (rednessScoreDelta <= -0.6) score -= 1;
    }
    if (score >= 2) trend = "improving";
    else if (score <= -2) trend = "regressing";
    else trend = "stable";
  }

  return {
    weeksTracked,
    photosCount: photos.length,
    selfRatingDelta,
    itchScoreDelta,
    rednessScoreDelta,
    courseProgressPct,
    trend,
    lastActivityAt,
  };
}

export type SalonAggregateClientInput = EvidenceClientInput & {
  clientId: string;
};

export type SalonAggregate = {
  totalActiveClients: number;
  completionRatePct: number;
  avgSelfRatingImprovement: number;
  totalPhotos: number;
  clientsWithImprovingTrend: number;
};

/**
 * Salon-wide aggregate across many clients.
 */
export function computeSalonAggregate(
  clients: SalonAggregateClientInput[],
): SalonAggregate {
  let totalActive = 0;
  let started = 0;
  let completed = 0;
  let sumDelta = 0;
  let countDelta = 0;
  let totalPhotos = 0;
  let improving = 0;

  for (const c of clients) {
    totalActive += 1;
    if (typeof c.sessionsTotal === "number" && c.sessionsTotal > 0) {
      started += 1;
      if (
        typeof c.sessionsCompleted === "number" &&
        c.sessionsCompleted >= c.sessionsTotal
      ) {
        completed += 1;
      }
    }
    totalPhotos += c.photos.length;
    const summary = computeClientImprovement(c);
    if (summary.selfRatingDelta != null) {
      sumDelta += summary.selfRatingDelta;
      countDelta += 1;
    }
    if (summary.trend === "improving") improving += 1;
  }

  const completionRatePct =
    started > 0 ? Math.round((completed / started) * 100) : 0;
  const avgSelfRatingImprovement =
    countDelta > 0 ? Number((sumDelta / countDelta).toFixed(2)) : 0;

  return {
    totalActiveClients: totalActive,
    completionRatePct,
    avgSelfRatingImprovement,
    totalPhotos,
    clientsWithImprovingTrend: improving,
  };
}

/** Human-readable trend label (Japanese, compliance-safe). */
export function trendLabel(t: ClientImprovementTrend): {
  glyph: string;
  text: string;
} {
  switch (t) {
    case "improving":
      return { glyph: "🟢", text: "改善傾向" };
    case "stable":
      return { glyph: "⚪️", text: "安定" };
    case "regressing":
      return { glyph: "🟡", text: "要観察" };
    case "insufficient_data":
    default:
      return { glyph: "—", text: "データ不足" };
  }
}
