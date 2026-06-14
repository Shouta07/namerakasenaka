import { describe, expect, it } from "vitest";
import {
  collectGuideTexts,
  parseRecoveryGuideJson,
  recoveryGuideJsonSchema,
  safeParseRecoveryGuideJson,
} from "../schema";
import {
  DEMO_DAILY_CHECKS,
  DEMO_GUIDE_CUSTOMERS,
  DEMO_HEALTH_RECORDS,
  TAMURA_SAMPLE_GUIDE,
} from "@/lib/demo/recovery-fixtures";
import { containsBannedWord } from "@/lib/compliance/banned-words";

describe("RecoveryGuideJson schema", () => {
  it("parses the 田村洋子 fixture guide", () => {
    const parsed = parseRecoveryGuideJson(TAMURA_SAMPLE_GUIDE);
    expect(parsed.today_summary.length).toBeGreaterThan(0);
    expect(parsed.easy_explanations.length).toBe(5);
    expect(parsed.easy_explanations.map((e) => e.term)).toEqual([
      "リーキーガット",
      "腸内カンジダ菌",
      "IgGフードアレルギー",
      "カゼイン",
      "グルテン",
    ]);
  });

  it("requires exactly 3 weekly_actions", () => {
    expect(TAMURA_SAMPLE_GUIDE.weekly_actions).toHaveLength(3);

    const twoActions = {
      ...TAMURA_SAMPLE_GUIDE,
      weekly_actions: TAMURA_SAMPLE_GUIDE.weekly_actions.slice(0, 2),
    };
    expect(recoveryGuideJsonSchema.safeParse(twoActions).success).toBe(false);

    const fourActions = {
      ...TAMURA_SAMPLE_GUIDE,
      weekly_actions: [...TAMURA_SAMPLE_GUIDE.weekly_actions, "もうひとつ"],
    };
    expect(recoveryGuideJsonSchema.safeParse(fourActions).success).toBe(false);
  });

  it("parses the optional result_mappings (あなたの結果とつながり)", () => {
    const parsed = parseRecoveryGuideJson(TAMURA_SAMPLE_GUIDE);
    expect(parsed.result_mappings).toHaveLength(4);
    expect(parsed.result_mappings?.[0].finding).toContain("カンジダ");
    // 検査でわかったこと → からだで起きていること → ためしてみること が全行そろう
    for (const m of parsed.result_mappings ?? []) {
      expect(m.finding.length).toBeGreaterThan(0);
      expect(m.meaning.length).toBeGreaterThan(0);
      expect(m.action.length).toBeGreaterThan(0);
    }
  });

  it("still accepts guides without result_mappings (旧スキーマ互換)", () => {
    const legacy: Record<string, unknown> = { ...TAMURA_SAMPLE_GUIDE };
    delete legacy.result_mappings;
    const parsed = safeParseRecoveryGuideJson(legacy);
    expect(parsed).not.toBeNull();
    expect(parsed?.result_mappings).toBeUndefined();
  });

  it("rejects malformed result_mappings entries", () => {
    const broken = {
      ...TAMURA_SAMPLE_GUIDE,
      result_mappings: [{ finding: "x", meaning: "y" }],
    };
    expect(recoveryGuideJsonSchema.safeParse(broken).success).toBe(false);

    const empty = {
      ...TAMURA_SAMPLE_GUIDE,
      result_mappings: [{ finding: "", meaning: "y", action: "z" }],
    };
    expect(recoveryGuideJsonSchema.safeParse(empty).success).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(safeParseRecoveryGuideJson(null)).toBeNull();
    expect(safeParseRecoveryGuideJson({})).toBeNull();
    expect(safeParseRecoveryGuideJson({ today_summary: "x" })).toBeNull();
    expect(() => parseRecoveryGuideJson({ today_summary: 1 })).toThrow();
  });

  it("fixture guide contains no banned words in any text field (§8.2 + §17)", () => {
    for (const text of collectGuideTexts(TAMURA_SAMPLE_GUIDE)) {
      const check = containsBannedWord(text);
      expect(check.hits, `banned words in: ${text}`).toEqual([]);
    }
  });

  it("fixture staff memos are compliant too", () => {
    for (const record of DEMO_HEALTH_RECORDS) {
      for (const text of [
        record.testResultMemo,
        record.doctorComment,
        record.salonMemo,
        record.dietaryRestrictions,
        record.currentProblem,
      ]) {
        expect(containsBannedWord(text).hits).toEqual([]);
      }
    }
  });
});

describe("recovery demo fixtures", () => {
  it("daily checks tell the 7-done / 2-rest story with an upward skin trend", () => {
    const checks = DEMO_DAILY_CHECKS;
    expect(checks).toHaveLength(9);
    expect(checks.filter((c) => c.actionDone)).toHaveLength(7);
    expect(checks.filter((c) => !c.actionDone)).toHaveLength(2);
    const sorted = [...checks].sort((a, b) => a.date.localeCompare(b.date));
    expect(sorted[0].skinCondition).toBe(2);
    expect(sorted[sorted.length - 1].skinCondition).toBe(4);
  });

  it("the demo customer carries the well-known share token", () => {
    expect(DEMO_GUIDE_CUSTOMERS[0].shareToken).toBe("tamura-demo-2026");
    expect(DEMO_HEALTH_RECORDS[0].aiSummaryJson).not.toBeNull();
  });
});
