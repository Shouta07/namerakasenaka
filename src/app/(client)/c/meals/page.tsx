import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isMealLogEnabledForClient } from "@/lib/billing/feature-flags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEAL_TYPE_LABEL, type MealType } from "@/types/domain";

type MealLogRow = {
  id: string;
  meal_type: MealType;
  memo: string | null;
  logged_at: string;
};

export default async function ClientMealsPage() {
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
        <h1 className="text-2xl font-semibold">食事ログ</h1>
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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">食事ログ</h1>
        <Link href="/c/meals/new">
          <Button>記録する</Button>
        </Link>
      </header>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">まだ記録はありません。</p>
        ) : (
          rows.map((m) => (
            <Card key={m.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{MEAL_TYPE_LABEL[m.meal_type]}</Badge>
                  <span className="text-xs text-stone-500">
                    {new Date(m.logged_at).toLocaleString("ja-JP")}
                  </span>
                </div>
                {m.memo ? <p className="mt-2 text-sm text-stone-700">{m.memo}</p> : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
