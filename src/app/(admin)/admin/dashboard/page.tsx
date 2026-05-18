import { AlertCircle, Building2, TrendingUp } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import {
  demoAppointments,
  demoKpiSnapshot,
  demoOrganization,
  demoQaThreads,
  demoTherapistPerformance,
  formatJpy,
} from "@/lib/demo/fixtures";
import { KpiCards, type Kpi } from "@/components/admin/kpi-cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPOINTMENT_STATUS_LABEL } from "@/types/domain";

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  status: string;
};

export default async function AdminDashboardPage() {
  if (isDemoMode()) {
    return <DemoAdminDashboard />;
  }

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

function DemoAdminDashboard() {
  const kpis: Kpi[] = [
    {
      label: "本日来店",
      value: demoKpiSnapshot.todayAppointments,
      hint: "予約確定 + 完了",
    },
    {
      label: "今月新規",
      value: demoKpiSnapshot.monthlyNewClients,
      hint: "前月比 +2",
    },
    {
      label: "完遂率",
      value: `${demoKpiSnapshot.monthlyCompletionRate}%`,
      hint: "6 ヶ月コース基準",
    },
    {
      label: "要対応 Q&A",
      value: demoKpiSnapshot.pendingQa,
      hint: "24h 以内未回答",
    },
  ];

  const todayAppointments = demoAppointments
    .filter(
      (a) =>
        new Date(a.scheduledAt).toDateString() === new Date("2026-05-18").toDateString(),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const maxClients = Math.max(...demoTherapistPerformance.map((t) => t.activeClients));

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-stone-500">{demoOrganization.name}</p>
          <h1 className="text-2xl font-bold text-stone-900">経営ダッシュボード</h1>
        </div>
      </header>

      <section>
        <KpiCards kpis={kpis} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-stone-500">今月売上（見込）</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {formatJpy(demoKpiSnapshot.monthlyRevenueJpy)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              前月比 +12%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-stone-500">アクティブ顧客</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {demoKpiSnapshot.activeClients} 名
            </p>
            <p className="mt-1 text-[11px] text-stone-500">うちコース進行中 31 名</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-stone-500">プラン</p>
            <p className="mt-1 text-base font-semibold text-stone-900">
              {demoOrganization.planName}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">課金モード DUAL</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-stone-900">本日の予約</h2>
          <ul className="mt-3 space-y-2">
            {todayAppointments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900">
                    {new Date(a.scheduledAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ・ {a.clientName} 様
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {a.therapistName} ・ {a.menuName}
                  </p>
                </div>
                <Badge
                  tone={
                    a.status === "completed"
                      ? "success"
                      : a.status === "confirmed"
                        ? "brand"
                        : "neutral"
                  }
                >
                  {APPOINTMENT_STATUS_LABEL[a.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-stone-900">
            未対応 Q&A アラート
          </h2>
          <ul className="mt-3 space-y-2">
            {demoQaThreads.map((q) => (
              <li
                key={q.id}
                className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-amber-700" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    {q.clientName} 様
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800">{q.lastMessage}</p>
                  <p className="mt-1 text-[11px] text-amber-700">
                    {new Date(q.lastMessageAt).toLocaleString("ja-JP")} ・ 未読{" "}
                    {q.unreadCount} 件
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-stone-900">
          セラピスト パフォーマンス
        </h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">セラピスト</th>
                <th className="px-4 py-2 text-right font-medium">担当顧客</th>
                <th className="px-4 py-2 text-right font-medium">今月完遂</th>
                <th className="px-4 py-2 text-right font-medium">平均評価</th>
                <th className="px-4 py-2 text-right font-medium">Q&A 初動</th>
              </tr>
            </thead>
            <tbody>
              {demoTherapistPerformance.map((t) => (
                <tr key={t.name} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900">{t.name}</span>
                      <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-stone-100 sm:block">
                        <div
                          className="h-full bg-brand-500"
                          style={{
                            width: `${Math.round((t.activeClients / maxClients) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700">
                    {t.activeClients}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700">
                    {t.monthlyCompletions}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700">
                    {t.averageRating.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-700">
                    {t.responseHours.toFixed(1)} h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
