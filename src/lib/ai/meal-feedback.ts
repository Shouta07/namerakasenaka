import Anthropic from "@anthropic-ai/sdk";
import { appendDisclaimer, containsBannedWord } from "@/lib/compliance/banned-words";

export type MealLogInput = {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  memo: string | null;
  photoUrl: string | null;
};

export type MealFeedbackResult =
  | { ok: true; draft: string }
  | { ok: false; reason: "banned_words"; hits: string[]; rawDraft: string }
  | { ok: false; reason: "api_error"; message: string }
  | { ok: false; reason: "missing_key" };

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `あなたは日本の管理栄養士監修済みのアシスタントです。サロン顧客の食事ログに対し、健康的な習慣作りをサポートする簡潔な日本語コメント（120〜200字）を作成します。

【遵守事項】
- 医療的助言は一切行わない。
- 治療・治る・効く・効果・改善する等の表現は絶対に使わない。
- 「健康的な習慣作り」「一般的な栄養バランス」「肌コンディションに配慮した」等の許容表現を使う。
- 個人を特定する情報、診断、推奨用量等は書かない。
- 末尾の免責文はシステム側で付与するため本文では書かない。`;

export async function generateMealFeedback(
  input: MealLogInput,
): Promise<MealFeedbackResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "missing_key" };
  }

  const client = new Anthropic({ apiKey });

  let rawDraft = "";
  try {
    const result = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            `食事ログ:\n` +
            `- 区分: ${input.mealType}\n` +
            `- メモ: ${input.memo ?? "(なし)"}\n` +
            `- 写真: ${input.photoUrl ? "あり" : "なし"}\n\n` +
            `上記に対する一次フィードバック案を日本語で作成してください。`,
        },
      ],
    });

    const block = result.content.find((c) => c.type === "text");
    rawDraft = block && block.type === "text" ? block.text : "";
  } catch (err) {
    return {
      ok: false,
      reason: "api_error",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  const check = containsBannedWord(rawDraft);
  if (!check.ok) {
    return { ok: false, reason: "banned_words", hits: check.hits, rawDraft };
  }

  return { ok: true, draft: appendDisclaimer(rawDraft) };
}
