import { describe, expect, it } from "vitest";
import { PLAN_META } from "@/lib/toppings/plans";
import {
  ROI_CAUTION,
  ROI_DEFAULT,
  normalizeRoiInput,
  simulateRoi,
} from "../roi";

describe("回収試算", () => {
  it("上乗せを0にすると、導入前と導入後が一致する（盛らない）", () => {
    const r = simulateRoi({
      ...ROI_DEFAULT,
      closeLiftPt: 0,
      retentionLiftMonths: 0,
    });
    expect(r.afterJpy).toBe(r.beforeJpy);
    expect(r.gainJpy).toBe(0);
    expect(r.monthlyGainJpy).toBe(0);
    // 費用ぶんはきちんとマイナスで出る
    expect(r.netJpy).toBe(-r.planCostJpy);
  });

  it("手計算と一致する", () => {
    // 20件 × 45% = 9件、9件 × 3万 × 4ヶ月 = 1,080,000
    const r = simulateRoi({
      counselingPerMonth: 20,
      monthlyTicketJpy: 30000,
      closeRatePct: 45,
      retentionMonths: 4,
      closeLiftPt: 0,
      retentionLiftMonths: 0,
      plan: "standard",
    });
    expect(r.beforeJpy).toBe(1_080_000);
    expect(r.planCostJpy).toBe(PLAN_META.standard.priceJpy);
  });

  it("成約率は95%で頭打ち — 夢のような数字を出さない", () => {
    const r = simulateRoi({
      ...ROI_DEFAULT,
      closeRatePct: 90,
      closeLiftPt: 30,
      retentionLiftMonths: 0,
    });
    const capped = simulateRoi({
      ...ROI_DEFAULT,
      closeRatePct: 95,
      closeLiftPt: 0,
      retentionLiftMonths: 0,
    });
    expect(r.afterJpy).toBe(capped.afterJpy);
  });

  it("極端な入力は現実的な範囲に丸められる", () => {
    const n = normalizeRoiInput({
      ...ROI_DEFAULT,
      counselingPerMonth: 99999,
      monthlyTicketJpy: -5,
      closeRatePct: 500,
      retentionMonths: 0,
    });
    expect(n.counselingPerMonth).toBe(200);
    expect(n.monthlyTicketJpy).toBe(3000);
    expect(n.closeRatePct).toBe(95);
    expect(n.retentionMonths).toBe(1);
  });

  it("NaN が入っても壊れない", () => {
    const r = simulateRoi({ ...ROI_DEFAULT, counselingPerMonth: NaN });
    expect(Number.isFinite(r.gainJpy)).toBe(true);
    expect(Number.isFinite(r.paybackContracts)).toBe(true);
  });

  it("費用と比べる数字は、生涯売上ではなく月あたりにならした額", () => {
    const r = simulateRoi(ROI_DEFAULT);
    // 生涯ぶんをそのまま費用と比べると過大になる。ならした額はそれより小さい。
    expect(r.monthlyGainJpy).toBeLessThan(r.gainJpy);
    expect(r.netJpy).toBe(r.monthlyGainJpy - r.planCostJpy);
    // 倍率も月あたりで計算されている
    expect(r.roiMultiple).toBeCloseTo(
      Math.round((r.monthlyGainJpy / r.planCostJpy) * 10) / 10,
      5,
    );
  });

  it("回収に必要な追加成約数は、プランが上がるほど増える", () => {
    const s = simulateRoi({ ...ROI_DEFAULT, plan: "starter" });
    const p = simulateRoi({ ...ROI_DEFAULT, plan: "pro" });
    expect(p.paybackContracts).toBeGreaterThan(s.paybackContracts);
  });

  it("損益分岐の上乗せポイントを下回ると、赤字になる", () => {
    const base = { ...ROI_DEFAULT, retentionLiftMonths: 0 };
    const { breakEvenLiftPt } = simulateRoi(base);
    const under = simulateRoi({ ...base, closeLiftPt: breakEvenLiftPt - 0.5 });
    const over = simulateRoi({ ...base, closeLiftPt: breakEvenLiftPt + 0.5 });
    expect(under.netJpy).toBeLessThan(0);
    expect(over.netJpy).toBeGreaterThan(0);
  });

  it("成果を約束しない注意書きがある", () => {
    expect(ROI_CAUTION).toContain("約束するものではありません");
  });
});
