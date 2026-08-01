import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isMealLogEnabledForClient } from "@/lib/billing/feature-flags";
import { isDemoMode } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DemoMealList } from "@/components/meals/demo-meal-list";
import { MEAL_TYPE_LABEL, type MealType } from "@/types/domain";

type MealLogRow = {
  id: string;
  meal_type: MealType;
  memo: string | null;
  logged_at: string;
};

type SalonCommentRow = {
  id: string;
  meal_log_id: string;
  body: string;
  author_role: "therapist" | "salon_admin";
  created_at: string;
};

type NutritionistFeedbackRow = {
  id: string;
  meal_log_id: string;
  final_text: string | null;
  status: string;
  sent_at: string | null;
};

export default async function ClientMealsPage() {
  if (isDemoMode()) {
    return <DemoMealList />;
  }
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clientFeatureFlag = false;
  if (user) {
    const { data: client } = await supabase
      .from("clients")
      .select("feature_meal_log")
      .eq("user_id", user.id)
      .maybeSingle();
    clientFeatureFlag = ((client as { feature_meal_log?: boolean } | null)?.feature_meal_log) ?? false;
  }

  const enabled = isMealLogEnabledForClient({ clientFeatureFlag });
  if (!enabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">食事へのコメント</h1>
        <Card>
          <CardContent>
            <p className="text-sm text-stone-600">
              食事ログ・栄養士フィードバックは上位プラン（¥5,000/月）でご利用いただけます。
            </p>
            <p className="mt-2 text-xs text-stone-500">
              ご興味があればサロン受付までお声がけください。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = await supabase
    .from("meal_logs")
    .select("id, meal_type, memo, logged_at")
    .order("logged_at", { ascending: false })
    .limit(30);

  const rows = (data ?? []) as unknown as MealLogRow[];
  const ids = rows.map((r) => r.id);

  let comments: SalonCommentRow[] = [];
  let feedbacks: NutritionistFeedbackRow[] = [];
  if (ids.length > 0) {
    const [{ data: cs }, { data: fs }] = await Promise.all([
      supabase
        .from("meal_log_comments")
        .select("id, meal_log_id, body, author_role, created_at")
        .in("meal_log_id", ids)
        .order("created_at", { ascending: false }),
      supabase
        .from("meal_feedbacks")
        .select("id, meal_log_id, final_text, status, sent_at")
        .in("meal_log_id", ids),
    ]);
    comments = (cs ?? []) as unknown as SalonCommentRow[];
    feedbacks = (fs ?? []) as unknown as NutritionistFeedbackRow[];
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">食事へのコメント</h1>
        <Link href="/c/meals/new">
          <Button variant="secondary">写真を送る（任意）</Button>
        </Link>
      </header>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm leading-relaxed text-stone-500">
            まだコメントは届いていません。食事の記録は必須ではありません
            — 気が向いたときに写真を1枚送っていただければ、管理栄養士が見て返します。
          </p>
        ) : (
          rows.map((m) => {
            const myComments = comments.filter((c) => c.meal_log_id === m.id);
            const myFeedbacks = feedbacks.filter(
              (f) => f.meal_log_id === m.id && f.status === "sent" && f.final_text,
            );
            return (
              <Card key={m.id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge tone="brand">{MEAL_TYPE_LABEL[m.meal_type]}</Badge>
                    <span className="text-xs text-stone-500">
                      {new Date(m.logged_at).toLocaleString("ja-JP")}
                    </span>
                  </div>
                  {m.memo ? (
                    <p className="mt-2 text-sm text-stone-700">{m.memo}</p>
                  ) : null}

                  {myFeedbacks.length > 0 ? (
                    <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
                      {myFeedbacks.map((f) => (
                        <div
                          key={f.id}
                          className="rounded-md bg-brand-50 px-3 py-2 text-xs"
                        >
                          <p className="font-medium text-brand-800">
                            管理栄養士からのフィードバック
                            {f.sent_at ? (
                              <span className="ml-2 text-stone-500">
                                {new Date(f.sent_at).toLocaleString("ja-JP")}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-stone-700">
                            {f.final_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {myComments.length > 0 ? (
                    <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
                      {myComments.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-md bg-stone-50 px-3 py-2 text-xs"
                        >
                          <p className="font-medium text-stone-700">
                            サロンからのコメント（
                            {c.author_role === "therapist"
                              ? "セラピスト"
                              : "サロン管理者"}
                            ）
                            <span className="ml-2 text-stone-400">
                              {new Date(c.created_at).toLocaleString("ja-JP")}
                            </span>
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-stone-600">
                            {c.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

