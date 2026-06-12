/**
 * Recovery Guide (「あなた専用の回復ガイド」) — shared schema.
 *
 * Lives outside src/lib/ai so client components and demo fixtures can import
 * the type + zod validation without pulling the Anthropic SDK into the
 * browser bundle.
 */

import { z } from "zod";

export const recoveryGuideJsonSchema = z.object({
  today_summary: z.string().min(1),
  current_body_state: z.string().min(1),
  relation_to_back_acne: z.string().min(1),
  easy_explanations: z
    .array(
      z.object({
        term: z.string().min(1),
        explanation: z.string().min(1),
      }),
    )
    .min(1),
  avoid_foods: z.array(z.string().min(1)).min(1),
  recommended_foods: z.array(z.string().min(1)).min(1),
  /** Exactly 3 — 完璧主義にさせないための設計上の上限。 */
  weekly_actions: z.array(z.string().min(1)).length(3),
  monthly_policy: z.string().min(1),
  encouraging_message: z.string().min(1),
  next_counseling_points: z.array(z.string().min(1)).min(1),
  /**
   * 「あなたの結果とつながり」— 検査結果 → 身体の状態 → 行動 の対応表。
   * optional: 既存の保存済みガイド（旧スキーマ）も引き続き読めるようにする。
   */
  result_mappings: z
    .array(
      z.object({
        /** 例:「腸内カンジダ菌がやや多め」 */
        finding: z.string().min(1),
        /** 例:「腸の中のバランスが揺らいでいる可能性があります」 */
        meaning: z.string().min(1),
        /** 例:「甘いものを少し控えて、発酵食品をとり入れてみましょう」 */
        action: z.string().min(1),
      }),
    )
    .optional(),
});

export type ResultMapping = NonNullable<RecoveryGuideJson["result_mappings"]>[number];

export type RecoveryGuideJson = z.infer<typeof recoveryGuideJsonSchema>;

/**
 * Validation helper — parses unknown data (AI output, jsonb column, demo
 * store) into a RecoveryGuideJson or throws a ZodError.
 */
export function parseRecoveryGuideJson(input: unknown): RecoveryGuideJson {
  return recoveryGuideJsonSchema.parse(input);
}

/** Non-throwing variant for UI code reading possibly-stale stored JSON. */
export function safeParseRecoveryGuideJson(input: unknown): RecoveryGuideJson | null {
  const result = recoveryGuideJsonSchema.safeParse(input);
  return result.success ? result.data : null;
}

/**
 * Flattens every human-readable string in the guide for compliance checks
 * (§8.2 banned-word filter + §17 additions).
 */
export function collectGuideTexts(guide: RecoveryGuideJson): string[] {
  return [
    guide.today_summary,
    guide.current_body_state,
    guide.relation_to_back_acne,
    ...guide.easy_explanations.flatMap((e) => [e.term, e.explanation]),
    ...guide.avoid_foods,
    ...guide.recommended_foods,
    ...guide.weekly_actions,
    guide.monthly_policy,
    guide.encouraging_message,
    ...guide.next_counseling_points,
    ...(guide.result_mappings ?? []).flatMap((m) => [m.finding, m.meaning, m.action]),
  ];
}

/** Input fields for AI generation — mirrors health_records + guide_customers. */
export type RecoveryGuideInput = {
  name: string;
  age: number | null;
  concern: string;
  testResultMemo: string;
  doctorComment: string;
  salonMemo: string;
  dietaryRestrictions: string;
  currentProblem: string;
};
