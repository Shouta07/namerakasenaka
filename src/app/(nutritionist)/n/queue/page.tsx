import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type FeedbackRow = {
  id: string;
  status: string;
  created_at: string;
  meal_log_id: string;
};

export default async function NutritionistQueuePage() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("meal_feedbacks")
    .select("id, status, created_at, meal_log_id")
    .in("status", ["awaiting_review", "ai_drafting"])
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as FeedbackRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">監修キュー</h1>
      <p className="text-xs text-stone-500">SLA: 食事ログ提出から48時間以内に承認してください。</p>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">キューは空です。</p>
        ) : (
          rows.map((f) => (
            <Link key={f.id} href={`/n/queue/${f.id}`} className="block">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs">{f.id.slice(0, 8)}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {new Date(f.created_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <Badge tone={f.status === "awaiting_review" ? "warning" : "neutral"}>
                    {f.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
