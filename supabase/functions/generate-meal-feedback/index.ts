// Supabase Edge Function — Deno runtime.
// Triggers AI draft generation for a meal feedback record.
//
// Invocation: POST { feedbackId: string } with service-role bearer.
// On success it updates meal_feedbacks.ai_draft and sets status='awaiting_review'.

// deno-lint-ignore-file no-explicit-any

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Json = Record<string, unknown>;

const BANNED_WORDS = [
  "治る", "治す", "治癒", "改善する", "効く", "効能", "効果がある", "効果的",
  "完治", "必ず", "絶対", "が消える", "が無くなる", "がなくなる",
  "医薬品同等", "ニキビが治る", "肌荒れが治る", "の治療",
];

function containsBannedWord(text: string): { ok: boolean; hits: string[] } {
  const hits: string[] = [];
  const t = text.normalize("NFKC");
  for (const w of BANNED_WORDS) {
    if (t.includes(w)) hits.push(w);
  }
  return { ok: hits.length === 0, hits };
}

const SYSTEM = `あなたは日本の管理栄養士監修済みのアシスタントです。健康的な習慣作りを後押しする中立的なコメントを120〜200字で書きます。
治療・治る・効く・効果・改善する等の表現は絶対に使わないでください。`;

// deno-lint-ignore no-explicit-any
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }
  const { feedbackId } = await req.json().catch(() => ({} as Json));
  if (!feedbackId || typeof feedbackId !== "string") {
    return new Response(JSON.stringify({ error: "feedbackId_required" }), { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!supabaseUrl || !serviceKey || !anthropicKey) {
    return new Response(JSON.stringify({ error: "env_missing" }), { status: 500 });
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    "content-type": "application/json",
  };

  // Load the meal_log linked to the feedback.
  const fbRes = await fetch(
    `${supabaseUrl}/rest/v1/meal_feedbacks?select=meal_log_id&id=eq.${feedbackId}`,
    { headers },
  );
  const fbList = await fbRes.json();
  const mealLogId = fbList?.[0]?.meal_log_id;
  if (!mealLogId) return new Response("not_found", { status: 404 });

  const mlRes = await fetch(
    `${supabaseUrl}/rest/v1/meal_logs?select=memo,meal_type&id=eq.${mealLogId}`,
    { headers },
  );
  const mlList = await mlRes.json();
  const meal = mlList?.[0];
  if (!meal) return new Response("meal_not_found", { status: 404 });

  const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `食事ログ:\n区分: ${meal.meal_type}\nメモ: ${meal.memo ?? "(なし)"}\n\nコメント案を作成してください。`,
        },
      ],
    }),
  });

  if (!aiRes.ok) {
    const text = await aiRes.text();
    return new Response(JSON.stringify({ error: "ai_error", detail: text }), { status: 502 });
  }
  const aiJson = await aiRes.json();
  const draft = aiJson?.content?.[0]?.text ?? "";

  const filter = containsBannedWord(draft);
  const status = filter.ok ? "awaiting_review" : "rejected";

  await fetch(`${supabaseUrl}/rest/v1/meal_feedbacks?id=eq.${feedbackId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      ai_draft: draft,
      status,
      banned_word_hits: filter.hits,
    }),
  });

  return new Response(JSON.stringify({ ok: true, status, hits: filter.hits }));
});
