import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoOrganization } from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubscriptionRow = {
  id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
};

export default async function AdminBillingPage() {
  if (isDemoMode()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">請求・サブスクリプション</h1>
        <Card>
          <CardHeader>
            <CardTitle>現在のプラン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                プラン: <span className="font-medium">{demoOrganization.planName}</span>
              </p>
              <Badge tone="success">active</Badge>
              <p className="text-xs text-stone-500">
                次回更新日 2026年6月18日 ・ 支払方法: クレジットカード
              </p>
            </div>
            <Button type="button" disabled className="mt-4">
              Stripeでチェックアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select("id, plan, status, current_period_end")
    .eq("subject_type", "organization");

  const rows = (data ?? []) as unknown as SubscriptionRow[];
  const active = rows.find((r) => r.status === "active" || r.status === "trialing");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">請求・サブスクリプション</h1>
      <Card>
        <CardHeader>
          <CardTitle>現在のプラン</CardTitle>
        </CardHeader>
        <CardContent>
          {active ? (
            <div className="space-y-2">
              <p className="text-sm">
                プラン: <span className="font-medium">{active.plan}</span>
              </p>
              <Badge tone={active.status === "active" ? "success" : "warning"}>
                {active.status}
              </Badge>
              {active.current_period_end ? (
                <p className="text-xs text-stone-500">
                  次回更新: {new Date(active.current_period_end).toLocaleDateString("ja-JP")}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-stone-500">アクティブなサブスクリプションがありません。</p>
          )}
          <form action="/api/stripe/checkout" method="post" className="mt-4">
            <input type="hidden" name="plan" value="starter" />
            <Button type="submit">Stripeでチェックアウト</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
