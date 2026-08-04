import { describe, expect, it } from "vitest";
import {
  TRIAL_DAYS,
  TRIAL_PROMISES,
  TRIAL_START_OPTIONS,
  TRIAL_STEPS,
  trialDay,
  trialDaysLeft,
  type TrialState,
} from "../trial";
import { containsBannedWord } from "@/lib/compliance/banned-words";

/**
 * お試しの約束。
 *
 * 画面に書いた約束は、実装で守られている必要がある。
 * 守れないことを書いていないか、ここで固定する。
 */

function state(startedAt: string): TrialState {
  return { startedAt, start: "sample" };
}

describe("経過日数", () => {
  it("開始した日は1日目", () => {
    const s = state("2026-08-01T09:00:00.000Z");
    expect(trialDay(s, new Date("2026-08-01T23:00:00.000Z"))).toBe(1);
  });

  it("翌日は2日目", () => {
    const s = state("2026-08-01T09:00:00.000Z");
    expect(trialDay(s, new Date("2026-08-02T10:00:00.000Z"))).toBe(2);
  });

  it("時計が巻き戻っても1日目より前にならない", () => {
    const s = state("2026-08-05T09:00:00.000Z");
    expect(trialDay(s, new Date("2026-08-01T09:00:00.000Z"))).toBe(1);
  });

  it("残り日数は0で止まる（マイナスを見せない）", () => {
    const s = state("2026-08-01T00:00:00.000Z");
    expect(trialDaysLeft(s, new Date("2026-12-01T00:00:00.000Z"))).toBe(0);
  });

  it("初日の残りは目安の日数そのもの", () => {
    const s = state("2026-08-01T00:00:00.000Z");
    expect(trialDaysLeft(s, new Date("2026-08-01T12:00:00.000Z"))).toBe(
      TRIAL_DAYS,
    );
  });
});

describe("約束の文言", () => {
  it("「この端末から出ません」を必ず含む（この商品の最初の関門）", () => {
    const local = TRIAL_PROMISES.find((p) => p.id === "stays-local");
    expect(local).toBeDefined();
    expect(local!.detail).toContain("送信していません");
  });

  it("実際の患者データで試してよい、と明言している", () => {
    const local = TRIAL_PROMISES.find((p) => p.id === "stays-local");
    expect(local!.detail).toContain("患者");
  });

  it("消せることを約束している", () => {
    expect(TRIAL_PROMISES.some((p) => p.id === "erasable")).toBe(true);
  });

  it("LINEに触れないことを約束している（店舗の資産なので）", () => {
    expect(TRIAL_PROMISES.some((p) => p.id === "no-line")).toBe(true);
  });

  it("約束はすべて禁止語を通る", () => {
    for (const p of TRIAL_PROMISES) {
      expect(containsBannedWord(`${p.label} ${p.detail}`).hits, p.id).toEqual(
        [],
      );
    }
  });
});

describe("順路", () => {
  it("3手で山場（患者さんの画面）まで着く", () => {
    expect(TRIAL_STEPS.length).toBeLessThanOrEqual(3);
    expect(TRIAL_STEPS[TRIAL_STEPS.length - 1].href).toBe("/c/guide");
  });

  it("最初の一歩は取り込み（触ってもらうところから始める）", () => {
    expect(TRIAL_STEPS[0].href).toBe("/admin/customers");
  });

  it("順路の文言も禁止語を通る", () => {
    for (const s of TRIAL_STEPS) {
      expect(containsBannedWord(`${s.title} ${s.body}`).hits, s.title).toEqual(
        [],
      );
    }
  });
});

describe("開始の選択肢", () => {
  it("サンプルと、まっさらの2つ（迷わせない）", () => {
    expect(TRIAL_START_OPTIONS.map((o) => o.id)).toEqual(["sample", "empty"]);
  });

  it("それぞれ何が起きるかが書いてある", () => {
    for (const o of TRIAL_START_OPTIONS) {
      expect(o.detail.length, o.id).toBeGreaterThan(20);
    }
  });
});
