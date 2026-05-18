import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MealLogWithCommentsList,
  type MealLogWithComments,
  type SalonComment,
} from "@/components/meals/meal-log-with-comments";
import type { MealType } from "@/types/domain";

type MealLogRow = {
  id: string;
  client_id: string;
  meal_type: MealType;
  memo: string | null;
  logged_at: string;
};

type CommentRow = {
  id: string;
  meal_log_id: string;
  body: string;
  author_role: "therapist" | "salon_admin";
  created_at: string;
};

export default async function AdminClientMealsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  if (isDemoMode()) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">食事ログ</h1>
          <p className="mt-1 text-sm text-stone-600">
            顧客ID: <span className="font-mono">{clientId.slice(0, 8)}</span>
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>サロンからのコメント</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-500">
              現在登録されているコメントはありません。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const supabase = await getServerSupabase();

  const { data: meals } = await supabase
    .from("meal_logs")
    .select("id, client_id, meal_type, memo, logged_at")
    .eq("client_id", clientId)
    .order("logged_at", { ascending: false })
    .limit(50);

  const mealRows = (meals ?? []) as unknown as MealLogRow[];
  const mealIds = mealRows.map((m) => m.id);

  let comments: CommentRow[] = [];
  if (mealIds.length > 0) {
    const { data: c } = await supabase
      .from("meal_log_comments")
      .select("id, meal_log_id, body, author_role, created_at")
      .in("meal_log_id", mealIds)
      .order("created_at", { ascending: false });
    comments = (c ?? []) as unknown as CommentRow[];
  }

  const rows: MealLogWithComments[] = mealRows.map((m) => ({
    id: m.id,
    meal_type: m.meal_type,
    memo: m.memo,
    logged_at: m.logged_at,
    comments: comments
      .filter((c) => c.meal_log_id === m.id)
      .map<SalonComment>((c) => ({
        id: c.id,
        body: c.body,
        author_role: c.author_role,
        created_at: c.created_at,
      })),
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">食事ログ</h1>
        <p className="mt-1 text-sm text-stone-600">
          顧客ID: <span className="font-mono">{clientId.slice(0, 8)}</span>
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>サロンからのコメント</CardTitle>
        </CardHeader>
        <CardContent>
          <MealLogWithCommentsList rows={rows} composer />
        </CardContent>
      </Card>
    </div>
  );
}
