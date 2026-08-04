import { PLAN_META } from "@/lib/toppings/plans";
import type { PlanId } from "@/lib/toppings/types";

/**
 * 導入の回収試算。
 *
 * オーナーが買うかどうかは「機能が多いか」ではなく「何件の成約で元が取れるか」で決まる。
 * ここは営業トークの数字ではなく、前提を全部見せたうえでの単純な四則演算にする。
 * 効果を約束するものではないので、UI 側では必ず前提と注意書きを一緒に出すこと。
 */

export type RoiInput = {
  /** 月あたりの初回カウンセリング数（体験・相談を含む）。 */
  counselingPerMonth: number;
  /** コース1本あたりの月額換算の売上（円）。 */
  monthlyTicketJpy: number;
  /** いまの成約率（%）。 */
  closeRatePct: number;
  /** いまの平均継続月数。 */
  retentionMonths: number;
  /** 導入で見込む成約率の上乗せ（ポイント）。 */
  closeLiftPt: number;
  /** 導入で見込む継続月数の上乗せ。 */
  retentionLiftMonths: number;
  plan: PlanId;
};

export const ROI_DEFAULT: RoiInput = {
  counselingPerMonth: 20,
  monthlyTicketJpy: 30000,
  closeRatePct: 45,
  retentionMonths: 4,
  closeLiftPt: 8,
  retentionLiftMonths: 1.5,
  plan: "standard",
};

export type RoiResult = {
  /** 導入前：その月のカウンセリングが、継続期間を通じて生む売上。 */
  beforeJpy: number;
  /** 導入後：同上。 */
  afterJpy: number;
  /** 生涯売上の差（一度に入る金額ではない）。 */
  gainJpy: number;
  /** 上の差を継続月数でならした、月あたりの増収。費用と比べるならこちら。 */
  monthlyGainJpy: number;
  /** 月額プラン費用。 */
  planCostJpy: number;
  /** 費用を引いた残り。 */
  netJpy: number;
  /** 何件ぶんの追加成約で月額が回収できるか。 */
  paybackContracts: number;
  /** 費用に対して何倍返ってくるか。 */
  roiMultiple: number;
  /** 損益が釣り合う成約率の上乗せ（ポイント）。ここを下回ると赤字。 */
  breakEvenLiftPt: number;
};

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));

/** 入力を現実的な範囲に丸める。極端な値で夢のような数字が出ないようにする。 */
export function normalizeRoiInput(input: RoiInput): RoiInput {
  return {
    counselingPerMonth: Math.round(clamp(input.counselingPerMonth, 1, 200)),
    monthlyTicketJpy: Math.round(clamp(input.monthlyTicketJpy, 3000, 300000)),
    closeRatePct: clamp(input.closeRatePct, 1, 95),
    retentionMonths: clamp(input.retentionMonths, 1, 24),
    closeLiftPt: clamp(input.closeLiftPt, 0, 30),
    retentionLiftMonths: clamp(input.retentionLiftMonths, 0, 12),
    plan: input.plan,
  };
}

export function simulateRoi(raw: RoiInput): RoiResult {
  const i = normalizeRoiInput(raw);
  const planCostJpy = PLAN_META[i.plan].priceJpy;

  // 成約率は 95% を超えない。上乗せしても頭打ちにする。
  const afterRatePct = clamp(i.closeRatePct + i.closeLiftPt, 1, 95);

  const contractsBefore = (i.counselingPerMonth * i.closeRatePct) / 100;
  const contractsAfter = (i.counselingPerMonth * afterRatePct) / 100;

  const beforeJpy = contractsBefore * i.monthlyTicketJpy * i.retentionMonths;
  const afterJpy =
    contractsAfter *
    i.monthlyTicketJpy *
    (i.retentionMonths + i.retentionLiftMonths);

  const gainJpy = afterJpy - beforeJpy;

  // 生涯売上の差を、そのまま月額費用と比べると過大に見える。
  // 継続月数でならした「月あたりの増収」で比べる。
  const afterMonths = i.retentionMonths + i.retentionLiftMonths;
  const monthlyGainJpy = afterMonths > 0 ? gainJpy / afterMonths : 0;
  const netJpy = monthlyGainJpy - planCostJpy;

  // 在籍が1人増えれば、その月にいくら入るか。それで月額を割る。
  const paybackContracts =
    i.monthlyTicketJpy > 0 ? planCostJpy / i.monthlyTicketJpy : Infinity;

  // 損益が釣り合う成約率の上乗せ：継続の改善は無いものとして、成約だけで賄う場合。
  // 月あたりに直すため、生涯売上ではなく単月の売上で計算する。
  const perPointJpy = (i.counselingPerMonth / 100) * i.monthlyTicketJpy;
  const breakEvenLiftPt = perPointJpy > 0 ? planCostJpy / perPointJpy : Infinity;

  return {
    beforeJpy: Math.round(beforeJpy),
    afterJpy: Math.round(afterJpy),
    gainJpy: Math.round(gainJpy),
    monthlyGainJpy: Math.round(monthlyGainJpy),
    planCostJpy,
    netJpy: Math.round(netJpy),
    paybackContracts: Math.round(paybackContracts * 10) / 10,
    roiMultiple:
      planCostJpy > 0 ? Math.round((monthlyGainJpy / planCostJpy) * 10) / 10 : 0,
    breakEvenLiftPt: Math.round(breakEvenLiftPt * 10) / 10,
  };
}

/** 試算の前提。数字の横に必ず並べて出す。 */
export const ROI_ASSUMPTIONS = [
  "棒グラフは「その月のカウンセリングが、継続期間を通じて生む売上」です。一度に入る金額ではありません。",
  "費用と比べる数字は、その差を継続月数でならした「月あたりの増収」を使っています。",
  "回収に必要な件数は、在籍が1人増えたときにその月に入る売上で計算しています。",
  "成約率の上乗せは、翻訳ガイドで検査結果に納得いただける前提の見込み値です。",
  "継続月数の上乗せは、LINE共有と再検査の提案を続けた場合の見込み値です。",
  "上乗せの値はご自由に変えられます。0 にすれば、いまのままの数字が出ます。",
];

export const ROI_CAUTION =
  "本試算は入力値にもとづく計算であり、成果を約束するものではありません。実際の数字は店舗の状況によって変わります。";
