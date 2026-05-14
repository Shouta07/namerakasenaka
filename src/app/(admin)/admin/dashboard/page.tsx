import { getServerSupabase } from "@/lib/supabase/server";
import { KpiCards } from "@/components/admin/kpi-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  status: string;
};

export default async function AdminDashboardPage() {
  const supabase = await getServerSupabase();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const dayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ count: clientCount }, { count: monthAppts }, { count: pendingQa }, today] =
    await Promise.all([
      supabase.from("clients").select("*", { head: true, count: "exact" }),
      supabase
        .from("appointments")
        .select("*", { head: true, count: "exact" })
        .gte("scheduled_at", monthStart),
      supabase
        .from("messages")
        .select("*", { head: true, count: "exact" })
        .is("read_at", null),
      supabase
        .from("appointments")
        .select("id, scheduled_at, status")
        .gte("scheduled_at", dayStart)
        .lt("scheduled_at", dayEnd)
        .order("scheduled_at", { ascending: true }),
    ]);

  const todays = (today.data ?? []) as unknown as AppointmentRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">ダッシュボード</h1>
      <KpiCards
        kpis={[
          { label: "顧客数", value: clientCount ?? 0 },
          { label: "今月の予約", value: monthAppts ?? 0 },
          { label: "未読Q&A", value: pendingQa ?? 0, hint: "要対応" },
          { label: "本日来店", value: todays.length },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>本日の来店</CardTitle>
        </CardHeader>
        <CardContent>
          {todays.length === 0 ? (
            <p className="text-sm text-stone-500">本日の予約はありません。</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {todays.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {new Date(a.scheduled_at).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-stone-500">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
