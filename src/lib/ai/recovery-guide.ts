import Anthropic from "@anthropic-ai/sdk";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  collectGuideTexts,
  parseRecoveryGuideJson,
  type RecoveryGuideInput,
  type RecoveryGuideJson,
} from "@/lib/guide/schema";
import { TAMURA_SAMPLE_GUIDE } from "@/lib/demo/recovery-fixtures";

const MODEL = "claude-sonnet-4-6";

export class RecoveryGuideComplianceError extends Error {
  readonly hits: string[];
  constructor(hits: string[]) {
    super(
      `生成されたガイドに使用できない表現が含まれています（${hits.join("、")}）。もう一度生成をお試しください。`,
    );
    this.name = "RecoveryGuideComplianceError";
    this.hits = hits;
  }
}

const SYSTEM_PROMPT = `あなたは背中ケア専門サロンの回復ガイド作成アシスタントです。提携クリニックの検査結果と医師コメントをもとに、お客様がスマートフォンで読む「あなた専用の回復ガイド」を日本語で作成します。

【絶対に守ること】
- 医療診断をしない。病名の断定をしない。
- 効果を断定しない。不安を煽らない。お客様を責めない。
- 専門用語は小学6年生にも分かる言葉にやさしく翻訳する。
- 「先生の方針に沿って」「〜の可能性があります」という言い回しを使う。
- 行動は具体的に書き、完璧主義にさせない。「7割できればOK」「できない日があっても大丈夫」という思想を貫く。
- 最後は必ず前向きで温かい一言で締める。
- 次の表現は絶対に使わない：「治ります」「治る」「必ず改善します」「必ず」「絶対」「病気です」「医師の指示は不要です」「これをしないと悪化します」「効く」「効果がある」「完治」。

【出力形式】
次の JSON スキーマに厳密に従い、JSON のみを出力する（前後の説明文・コードフェンス禁止）:
{
  "today_summary": string,            // 今日のまとめ。2〜3文。最初に読む一番大事な言葉
  "current_body_state": string,       // あなたの身体で起きていること。2〜3文ごとに \\n\\n で段落を分ける
  "relation_to_back_acne": string,    // 背中ニキビとの関係
  "easy_explanations": [{ "term": string, "explanation": string }],  // 専門用語のやさしい解説。各2〜3文
  "avoid_foods": string[],            // 避けた方がよいもの
  "recommended_foods": string[],      // 食べてよいもの
  "weekly_actions": string[],         // 今週やること。必ず3つだけ。具体的な行動
  "monthly_policy": string,           // 今月の方針
  "encouraging_message": string,      // 温かい応援メッセージ。プレッシャーを与えない
  "next_counseling_points": string[], // 次回カウンセリングで話すこと
  "result_mappings": [                // 「あなたの結果とつながり」3〜5件
    {
      "finding": string,   // 検査でわかったこと。例:「腸内カンジダ菌がやや多め」
      "meaning": string,   // からだで起きていること。「〜の可能性があります」「〜かもしれません」とやわらかく
      "action": string     // ためしてみること。「〜してみましょう」と具体的でやさしい一歩
    }
  ]
}

weekly_actions は必ず3つちょうどにすること。多くても少なくてもいけません。

result_mappings は検査結果メモの主要な所見から3〜5件作成すること。各行は
「検査でわかったこと → からだで起きていること → ためしてみること」が
一本の線でつながるように書く。意味づけ（meaning）は断定せず、行動（action）は
今日から試せる小さな一歩にする。ここでも禁止表現は絶対に使わない。`;

function buildUserPrompt(input: RecoveryGuideInput): string {
  return [
    "以下のお客様情報から回復ガイド JSON を作成してください。",
    "",
    `■ お名前: ${input.name}`,
    `■ 年齢: ${input.age != null ? `${input.age}歳` : "（未記入）"}`,
    `■ 主な悩み: ${input.concern || "（未記入）"}`,
    `■ 検査結果メモ（提携クリニックより）: ${input.testResultMemo || "（未記入）"}`,
    `■ 医師コメント: ${input.doctorComment || "（未記入）"}`,
    `■ サロンメモ: ${input.salonMemo || "（未記入）"}`,
    `■ 食事制限内容: ${input.dietaryRestrictions || "（未記入）"}`,
    `■ 現在困っていること: ${input.currentProblem || "（未記入）"}`,
  ].join("\n");
}

function assertCompliant(guide: RecoveryGuideJson): void {
  const hits = new Set<string>();
  for (const text of collectGuideTexts(guide)) {
    const check = containsBannedWord(text);
    for (const hit of check.hits) hits.add(hit);
  }
  if (hits.size > 0) {
    throw new RecoveryGuideComplianceError(Array.from(hits));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Strips an accidental ```json fence so the strict JSON.parse still works. */
function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

/**
 * Generates a customer-facing recovery guide from clinic + salon inputs.
 *
 * - With ANTHROPIC_API_KEY: calls claude-sonnet-4-6 with a strict
 *   gentle-expression system prompt, validates the JSON shape (zod) and runs
 *   every text field through the banned-word filter. Throws
 *   RecoveryGuideComplianceError on a hit so the caller can show retry
 *   guidance.
 * - Without the key (demo mode): returns the curated 田中太郎 sample after a
 *   simulated 1200ms generation delay.
 */
export async function generateRecoveryGuide(
  input: RecoveryGuideInput,
): Promise<RecoveryGuideJson> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    await delay(1200);
    const guide = parseRecoveryGuideJson(TAMURA_SAMPLE_GUIDE);
    assertCompliant(guide);
    return guide;
  }

  const client = new Anthropic({ apiKey });
  const result = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const block = result.content.find((c) => c.type === "text");
  const raw = block && block.type === "text" ? block.text : "";

  let parsedUnknown: unknown;
  try {
    parsedUnknown = JSON.parse(extractJson(raw));
  } catch {
    throw new Error("AI の出力が JSON として解釈できませんでした。もう一度生成をお試しください。");
  }

  const guide = parseRecoveryGuideJson(parsedUnknown);
  assertCompliant(guide);
  return guide;
}
