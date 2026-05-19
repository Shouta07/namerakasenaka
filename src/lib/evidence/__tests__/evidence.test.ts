import { describe, expect, it } from "vitest";
import {
  MIN_DATAPOINTS_FOR_TREND,
  MIN_WEEKS_FOR_TREND,
  computeClientImprovement,
  computeSalonAggregate,
  trendLabel,
  type EvidencePhoto,
  type EvidenceSelfLog,
  type EvidenceTreatmentRecord,
} from "../index";

function photo(
  daysAgo: number,
  rating: number | null,
  today: Date,
): EvidencePhoto {
  const d = new Date(today.getTime() - daysAgo * 86400000);
  return {
    id: `p-${daysAgo}`,
    takenAt: d.toISOString(),
    photoType: "after",
    selfRating: rating,
  };
}

function selfLog(
  daysAgo: number,
  itch: number,
  redness: number,
  today: Date,
): EvidenceSelfLog {
  const d = new Date(today.getTime() - daysAgo * 86400000);
  const ymd = d.toISOString().slice(0, 10);
  return { id: `s-${daysAgo}`, loggedOn: ymd, itchScore: itch, rednessScore: redness };
}

function record(daysAgo: number, today: Date): EvidenceTreatmentRecord {
  const d = new Date(today.getTime() - daysAgo * 86400000);
  return { id: `r-${daysAgo}`, performedAt: d.toISOString() };
}

const TODAY = new Date("2026-05-19T00:00:00+09:00");

describe("computeClientImprovement", () => {
  it("returns insufficient_data when nothing is tracked", () => {
    const r = computeClientImprovement({
      photos: [],
      selfLogs: [],
      treatmentRecords: [],
      today: TODAY,
    });
    expect(r.trend).toBe("insufficient_data");
    expect(r.weeksTracked).toBe(0);
    expect(r.photosCount).toBe(0);
    expect(r.selfRatingDelta).toBeNull();
    expect(r.itchScoreDelta).toBeNull();
    expect(r.lastActivityAt).toBeNull();
  });

  it("computes weeksTracked from course start", () => {
    const r = computeClientImprovement({
      photos: [],
      selfLogs: [],
      treatmentRecords: [],
      courseStartedAt: "2026-04-21",
      today: TODAY,
    });
    expect(r.weeksTracked).toBe(4);
  });

  it("computes a self-rating delta when given enough photos", () => {
    const photos = [
      photo(90, 2, TODAY),
      photo(60, 3, TODAY),
      photo(30, 4, TODAY),
      photo(7, 5, TODAY),
    ];
    const r = computeClientImprovement({
      photos,
      selfLogs: [],
      treatmentRecords: [],
      today: TODAY,
    });
    expect(r.photosCount).toBe(4);
    expect(r.selfRatingDelta).not.toBeNull();
    expect(r.selfRatingDelta!).toBeGreaterThan(0);
  });

  it("flags improving when self-log scores drop and ratings rise", () => {
    const photos = [
      photo(70, 2, TODAY),
      photo(56, 3, TODAY),
      photo(35, 4, TODAY),
      photo(14, 5, TODAY),
    ];
    const selfLogs = [
      selfLog(60, 4, 4, TODAY),
      selfLog(45, 4, 4, TODAY),
      selfLog(30, 3, 3, TODAY),
      selfLog(15, 2, 2, TODAY),
      selfLog(5, 1, 1, TODAY),
    ];
    const r = computeClientImprovement({
      photos,
      selfLogs,
      treatmentRecords: [record(40, TODAY)],
      courseStartedAt: "2026-02-14",
      today: TODAY,
    });
    expect(r.trend).toBe("improving");
    expect(r.itchScoreDelta).not.toBeNull();
    expect(r.itchScoreDelta!).toBeGreaterThan(0);
    expect(r.lastActivityAt).not.toBeNull();
  });

  it("flags regressing when scores worsen", () => {
    const photos = [
      photo(70, 5, TODAY),
      photo(56, 4, TODAY),
      photo(35, 3, TODAY),
      photo(14, 2, TODAY),
    ];
    const selfLogs = [
      selfLog(60, 1, 1, TODAY),
      selfLog(45, 2, 2, TODAY),
      selfLog(30, 3, 3, TODAY),
      selfLog(15, 4, 4, TODAY),
      selfLog(5, 5, 5, TODAY),
    ];
    const r = computeClientImprovement({
      photos,
      selfLogs,
      treatmentRecords: [record(40, TODAY)],
      courseStartedAt: "2026-02-14",
      today: TODAY,
    });
    expect(r.trend).toBe("regressing");
  });

  it("computes courseProgressPct from session counts", () => {
    const r = computeClientImprovement({
      photos: [],
      selfLogs: [],
      treatmentRecords: [],
      sessionsCompleted: 3,
      sessionsTotal: 6,
      today: TODAY,
    });
    expect(r.courseProgressPct).toBe(50);
  });

  it("respects insufficient_data threshold even with photos", () => {
    // Only 2 weeks tracked but plenty of points → still insufficient.
    const photos = [
      photo(10, 2, TODAY),
      photo(8, 3, TODAY),
      photo(6, 3, TODAY),
      photo(4, 4, TODAY),
      photo(2, 5, TODAY),
      photo(0, 5, TODAY),
    ];
    const r = computeClientImprovement({
      photos,
      selfLogs: [],
      treatmentRecords: [],
      today: TODAY,
    });
    expect(r.trend).toBe("insufficient_data");
    expect(MIN_WEEKS_FOR_TREND).toBeGreaterThan(0);
    expect(MIN_DATAPOINTS_FOR_TREND).toBeGreaterThan(0);
  });
});

describe("computeSalonAggregate", () => {
  it("sums clients across the salon", () => {
    const agg = computeSalonAggregate([
      {
        clientId: "a",
        photos: [photo(40, 2, TODAY), photo(10, 4, TODAY)],
        selfLogs: [],
        treatmentRecords: [],
        sessionsCompleted: 6,
        sessionsTotal: 6,
        today: TODAY,
      },
      {
        clientId: "b",
        photos: [photo(20, 3, TODAY)],
        selfLogs: [],
        treatmentRecords: [],
        sessionsCompleted: 2,
        sessionsTotal: 6,
        today: TODAY,
      },
    ]);
    expect(agg.totalActiveClients).toBe(2);
    expect(agg.totalPhotos).toBe(3);
    expect(agg.completionRatePct).toBe(50);
  });

  it("handles all-empty input safely", () => {
    const agg = computeSalonAggregate([]);
    expect(agg.totalActiveClients).toBe(0);
    expect(agg.completionRatePct).toBe(0);
    expect(agg.avgSelfRatingImprovement).toBe(0);
    expect(agg.clientsWithImprovingTrend).toBe(0);
  });
});

describe("trendLabel", () => {
  it("returns Japanese labels for each trend", () => {
    expect(trendLabel("improving").text).toContain("改善");
    expect(trendLabel("stable").text).toBe("安定");
    expect(trendLabel("regressing").text).toBe("要観察");
    expect(trendLabel("insufficient_data").text).toBe("データ不足");
  });
});
