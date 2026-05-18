import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoMealLogs, demoPendingDrafts } from "@/lib/demo/fixtures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackReviewForm } from "./review-form";

type FeedbackRow = {
  id: string;
  status: string;
  ai_draft: string | null;
  final_text: string | null;
  meal_log_id: string;
};

export default async function FeedbackReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (isDemoMode()) {
    // Try to find this id either in fixtures (drafts or meal-logs) or treat as
    // a stored localStorage feedback (handled client-side in the form).
    const fromDraft = demoPendingDrafts.find((d) => d.id === id);
    const fromMeal = demoMealLogs.find((m) => m.id === id);
    const mealMemo = fromDraft?.memo ?? fromMeal?.memo ?? "（メモはありません）";
    const mealType = fromDraft?.mealType ?? fromMeal?.mealType ?? "lunch";
    const loggedAt = fromDraft?.loggedAt ?? fromMeal?.loggedAt ?? new Date().toISOString();
    const aiDraft =
      fromDraft?.aiDraft ??
      fromMeal?.feedback.aiDraft ??
      "AI が下書きを準備中です。少々お待ちください。";
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">監修レビュー</h1>
        <Card>
          <CardHeader>
            <CardTitle>食事ログ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{mealMemo}</p>
            <p className="mt-1 text-xs text-stone-500">
              {mealType} ・ {new Date(loggedAt).toLocaleString("ja-JP")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI 一次案 → 監修</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackReviewForm id={id} defaultText={aiDraft} demo />
          </CardContent>
        </Card>
      </div>
    );
  }
  const supabase = await getServerSupabase();

  const { data: fb } = await supabase
    .from("meal_feedbacks")
    .select("id, status, ai_draft, final_text, meal_log_id")
    .eq("id", id)
    .maybeSingle();

  const row = (fb as FeedbackRow | null) ?? null;

  if (!row) {
    return <p className="text-sm text-stone-500">レコードが見つかりません。</p>;
  }

  const { data: meal } = await supabase
    .from("meal_logs")
    .select("memo, meal_type, logged_at")
    .eq("id", row.meal_log_id)
    .maybeSingle();

  const mealRow = (meal as { memo: string | null; meal_type: string; logged_at: string } | null) ?? null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">監修レビュー</h1>
      <Card>
        <CardHeader>
          <CardTitle>食事ログ</CardTitle>
        </CardHeader>
        <CardContent>
          {mealRow ? (
            <>
              <p className="text-sm">{mealRow.memo ?? "(メモなし)"}</p>
              <p className="mt-1 text-xs text-stone-500">
                {mealRow.meal_type} ・{" "}
                {new Date(mealRow.logged_at).toLocaleString("ja-JP")}
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-500">食事ログが見つかりません。</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI 一次案 → 監修</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackReviewForm
            id={row.id}
            defaultText={row.final_text ?? row.ai_draft ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
