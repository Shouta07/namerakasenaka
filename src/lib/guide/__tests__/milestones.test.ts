import { describe, expect, it } from "vitest";
import {
  computeCheckStats,
  latestReachedMilestone,
  type DailyCheckLike,
} from "../milestones";
import { DEMO_DAILY_CHECKS } from "@/lib/demo/recovery-fixtures";

/** Fixed "today" for deterministic tests. */
const TODAY = new Date(2026, 5, 12); // 2026-06-12 local

function check(date: string, actionDone = true, skinCondition: number | null = null): DailyCheckLike {
  return { date, actionDone, skinCondition };
}

describe("computeCheckStats", () => {
  it("returns zeros / unknown for an empty history", () => {
    const stats = computeCheckStats([], TODAY);
    expect(stats.totalDays).toBe(0);
    expect(stats.doneDays).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.skinTrend).toBe("unknown");
    expect(stats.milestones).toEqual([
      { id: "3days", reachedAt: null },
      { id: "7days", reachedAt: null },
      { id: "14days", reachedAt: null },
      { id: "28days", reachedAt: null },
    ]);
  });

  it("counts a streak that includes today", () => {
    const stats = computeCheckStats(
      [check("2026-06-10"), check("2026-06-11"), check("2026-06-12")],
      TODAY,
    );
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  it("keeps the streak alive when today is not yet recorded (through yesterday)", () => {
    const stats = computeCheckStats(
      [check("2026-06-09"), check("2026-06-10"), check("2026-06-11")],
      TODAY,
    );
    expect(stats.currentStreak).toBe(3);
  });

  it("resets the current streak when the last record is 2+ days old", () => {
    const stats = computeCheckStats(
      [check("2026-06-08"), check("2026-06-09"), check("2026-06-10")],
      TODAY,
    );
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(3);
  });

  it("counts rest days (actionDone=false) as recorded — recording is the habit", () => {
    const stats = computeCheckStats(
      [check("2026-06-10", true), check("2026-06-11", false), check("2026-06-12", true)],
      TODAY,
    );
    expect(stats.currentStreak).toBe(3);
    expect(stats.doneDays).toBe(2);
    expect(stats.totalDays).toBe(3);
  });

  it("tracks the longest streak across gaps", () => {
    const stats = computeCheckStats(
      [
        check("2026-06-01"),
        check("2026-06-02"),
        check("2026-06-03"),
        check("2026-06-04"),
        // gap 06-05〜06-09
        check("2026-06-10"),
        check("2026-06-11"),
      ],
      TODAY,
    );
    expect(stats.longestStreak).toBe(4);
    expect(stats.currentStreak).toBe(2);
  });

  it("records the date a milestone was first reached", () => {
    const stats = computeCheckStats(
      [
        check("2026-06-05"),
        check("2026-06-06"),
        check("2026-06-07"), // 3days reached here
        check("2026-06-08"),
        check("2026-06-09"),
        check("2026-06-10"),
        check("2026-06-11"), // 7days reached here
      ],
      TODAY,
    );
    const byId = new Map(stats.milestones.map((m) => [m.id, m.reachedAt]));
    expect(byId.get("3days")).toBe("2026-06-07");
    expect(byId.get("7days")).toBe("2026-06-11");
    expect(byId.get("14days")).toBeNull();
    expect(byId.get("28days")).toBeNull();
    expect(latestReachedMilestone(stats)).toEqual({ id: "7days", reachedAt: "2026-06-11" });
  });

  it("dedupes same-date records before computing", () => {
    const stats = computeCheckStats(
      [check("2026-06-12", false), check("2026-06-12", true)],
      TODAY,
    );
    expect(stats.totalDays).toBe(1);
    expect(stats.doneDays).toBe(1);
    expect(stats.currentStreak).toBe(1);
  });

  it("detects an upward skin trend (last 5 avg > first 5 avg)", () => {
    const stats = computeCheckStats(
      [
        check("2026-06-05", true, 2),
        check("2026-06-06", true, 2),
        check("2026-06-07", true, 2),
        check("2026-06-08", true, 3),
        check("2026-06-09", true, 3),
        check("2026-06-10", true, 4),
        check("2026-06-11", true, 4),
      ],
      TODAY,
    );
    expect(stats.skinTrend).toBe("up");
  });

  it("detects flat / down / unknown trends", () => {
    const flat = computeCheckStats(
      ["05", "06", "07", "08", "09", "10"].map((d) => check(`2026-06-${d}`, true, 3)),
      TODAY,
    );
    expect(flat.skinTrend).toBe("flat");

    const down = computeCheckStats(
      [4, 4, 4, 3, 3, 2, 2].map((v, i) => check(`2026-06-0${i + 1}`, true, v)),
      TODAY,
    );
    expect(down.skinTrend).toBe("down");

    const unknown = computeCheckStats(
      [check("2026-06-11", true, 3), check("2026-06-12", true, 4)],
      TODAY,
    );
    expect(unknown.skinTrend).toBe("unknown");
  });

  it("demo fixture: streak of 5 through yesterday, 3日 reached, 7日 upcoming", () => {
    // フィクスチャは実時間相対（daysAgoIso）なので実際の now で評価する。
    const stats = computeCheckStats(DEMO_DAILY_CHECKS, new Date());
    expect(stats.currentStreak).toBe(5);
    const byId = new Map(stats.milestones.map((m) => [m.id, m.reachedAt]));
    expect(byId.get("3days")).not.toBeNull();
    expect(byId.get("7days")).toBeNull();
    expect(stats.skinTrend).toBe("up");
  });
});
