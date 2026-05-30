import { describe, expect, it } from "vitest";
import {
  computeAgeBand,
  rankCases,
  scoreSimilarity,
  scoreToDisplay,
} from "../similarity";
import type { CaseRecord } from "../types";

function mkCase(overrides: Partial<CaseRecord> = {}): CaseRecord {
  return {
    id: "case-x",
    organizationId: "org-1",
    anonymousId: "C-0001",
    age: 32,
    gender: "female",
    occupation: null,
    concernDuration: "1〜3年",
    mainConcern: "背中ニキビ",
    firstVisitDate: "2025-01-01",
    treatmentCount: 6,
    improvementPeriod: "3ヶ月",
    severity: "medium",
    beforeImageUrl: null,
    afterImageUrl: null,
    staffMemo: null,
    counselingComment: "サンプル",
    tagIds: ["t1", "t2"],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computeAgeBand", () => {
  it("buckets correctly", () => {
    expect(computeAgeBand(20)).toBe("under_25");
    expect(computeAgeBand(24)).toBe("under_25");
    expect(computeAgeBand(25)).toBe("25_34");
    expect(computeAgeBand(34)).toBe("25_34");
    expect(computeAgeBand(35)).toBe("35_44");
    expect(computeAgeBand(44)).toBe("35_44");
    expect(computeAgeBand(45)).toBe("45_plus");
    expect(computeAgeBand(80)).toBe("45_plus");
  });

  it("handles null", () => {
    expect(computeAgeBand(null)).toBeNull();
    expect(computeAgeBand(undefined)).toBeNull();
  });
});

describe("scoreSimilarity", () => {
  it("zero when no criteria match", () => {
    const c = mkCase();
    expect(scoreSimilarity(c, { tagIds: [] })).toBe(0);
  });

  it("3 points per matched tag", () => {
    const c = mkCase({ tagIds: ["a", "b", "c"] });
    expect(scoreSimilarity(c, { tagIds: ["a", "b"] })).toBe(6);
    expect(scoreSimilarity(c, { tagIds: ["a", "b", "c", "d"] })).toBe(9);
  });

  it("severity match adds 5", () => {
    const c = mkCase({ severity: "heavy" });
    expect(scoreSimilarity(c, { tagIds: [], severity: "heavy" })).toBe(5);
    expect(scoreSimilarity(c, { tagIds: [], severity: "light" })).toBe(0);
  });

  it("age band match adds 3 (via ageBand or age)", () => {
    const c = mkCase({ age: 30 });
    expect(scoreSimilarity(c, { tagIds: [], ageBand: "25_34" })).toBe(3);
    expect(scoreSimilarity(c, { tagIds: [], age: 28 })).toBe(3);
    expect(scoreSimilarity(c, { tagIds: [], age: 50 })).toBe(0);
  });

  it("gender match adds 2", () => {
    const c = mkCase({ gender: "female" });
    expect(scoreSimilarity(c, { tagIds: [], gender: "female" })).toBe(2);
    expect(scoreSimilarity(c, { tagIds: [], gender: "male" })).toBe(0);
  });

  it("concern duration match adds 2", () => {
    const c = mkCase({ concernDuration: "1〜3年" });
    expect(scoreSimilarity(c, { tagIds: [], concernDuration: "1〜3年" })).toBe(2);
    expect(scoreSimilarity(c, { tagIds: [], concernDuration: "半年未満" })).toBe(0);
  });

  it("composes all weights", () => {
    const c = mkCase({
      age: 30,
      gender: "female",
      severity: "medium",
      concernDuration: "1〜3年",
      tagIds: ["a", "b"],
    });
    const score = scoreSimilarity(c, {
      tagIds: ["a", "b"],
      severity: "medium",
      ageBand: "25_34",
      gender: "female",
      concernDuration: "1〜3年",
    });
    // 6 (tags) + 5 + 3 + 2 + 2 = 18
    expect(score).toBe(18);
  });
});

describe("rankCases", () => {
  it("returns highest score first", () => {
    const c1 = mkCase({ id: "c1", tagIds: ["a"], severity: "medium" });
    const c2 = mkCase({ id: "c2", tagIds: ["a", "b"], severity: "medium" });
    const c3 = mkCase({ id: "c3", tagIds: [], severity: "light" });
    const ranked = rankCases([c1, c2, c3], {
      tagIds: ["a", "b"],
      severity: "medium",
    });
    expect(ranked.map((r) => r.case.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("ties broken by createdAt desc", () => {
    const older = mkCase({
      id: "older",
      tagIds: ["a"],
      createdAt: "2025-01-01T00:00:00.000Z",
    });
    const newer = mkCase({
      id: "newer",
      tagIds: ["a"],
      createdAt: "2025-06-01T00:00:00.000Z",
    });
    const ranked = rankCases([older, newer], { tagIds: ["a"] });
    expect(ranked[0].case.id).toBe("newer");
  });
});

describe("scoreToDisplay", () => {
  it("clamps to 0..100", () => {
    expect(scoreToDisplay(-5)).toBe(0);
    expect(scoreToDisplay(0)).toBe(0);
    expect(scoreToDisplay(15)).toBe(50);
    expect(scoreToDisplay(30)).toBe(100);
    expect(scoreToDisplay(100)).toBe(100);
  });
});
