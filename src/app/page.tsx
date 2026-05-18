import Link from "next/link";
import { ArrowRight, AlertCircle, Camera, Search } from "lucide-react";
import { RoleTopBar } from "@/components/ui/role-top-bar";
import { KpiStrip, type KpiStripItem } from "@/components/admin/kpi-strip";
import { Badge } from "@/components/ui/badge";
import { DemoBanner } from "@/components/demo-banner";
import {
  demoAppointments,
  demoClientRoster,
  demoKpiSnapshot,
  demoOrganization,
  demoQaThreads,
  demoTherapistPerformance,
  formatJpy,
} from "@/lib/demo/fixtures";

const today = new Date();

const weekday = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];
const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日(${weekday})`;

const todaysAppointments = demoAppointments.slice(0, 5);
const recentClients = demoClientRoster.slice(0, 5);
const unreadThreads = demoQaThreads.filter((t) => t.unreadCount > 0);

const kpis: KpiStripItem[] = [
  { label: "本日来店", value: demoKpiSnapshot.todayAppointments },
  { label: "今月新規", value: demoKpiSnapshot.monthlyNewClients },
  { label: "今月完遂率", value: `${demoKpiSnapshot.monthlyCompletionRate}%`, tone: "brand" },
  {
    label: "未対応Q&A",
    value: demoKpiSnapshot.pendingQa,
    tone: demoKpiSnapshot.pendingQa > 0 ? "warning" : "neutral",
  },
];

function appointmentTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-stone-50">
      <RoleTopBar role="経営者" persona="salon" eyebrow={demoOrganization.name} />
      <DemoBanner />

      <main
        className="mx-auto max-w-6xl px-4 sm:px-6"
        style={{ paddingBottom: "max(var(--safe-bottom), 24px)" }}
      >
        <section className="flex items-baseline justify-between gap-3 pt-5">
          <div>
            <p className="text-[11px] text-stone-500">{formattedDate}</p>
            <h2 className="mt-0.5 text-base font-semibold text-stone-900">
              本日 {todaysAppointments.length} 件の予約があります
            </h2>
          </div>
          <p className="text-[11px] text-stone-500">
            売上見込 <span className="font-semibold text-stone-900">{formatJpy(demoKpiSnapshot.monthlyRevenueJpy)}</span>
          </p>
        </section>

        <section className="mt-4">
          <KpiStrip items={kpis} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-stone-200 bg-white">
            <header className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5">
              <h3 className="text-sm font-semibold text-stone-900">本日の予約</h3>
              <Link
                href="/admin/calendar"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:underline"
              >
                全件
                <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            <ul className="divide-y divide-stone-100">
              {todaysAppointments.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/clients/${a.clientId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50"
                  >
                    <span className="w-12 flex-none text-sm font-semibold tabular-nums text-stone-900">
                      {appointmentTime(a.scheduledAt)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900">
                        {a.clientName}
                      </span>
                      <span className="block truncate text-[11px] text-stone-500">
                        {a.menuName} · {a.therapistName}
                      </span>
                    </span>
                    <Badge tone={a.status === "completed" ? "neutral" : "brand"}>
                      {a.status === "completed"
                        ? "完了"
                        : a.status === "confirmed"
                          ? "確定"
                          : a.status === "cancelled"
                            ? "キャンセル"
                            : "予定"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white">
            <header className="flex items-center gap-2 border-b border-stone-200 px-4 py-2.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              <h3 className="text-sm font-semibold text-stone-900">要対応</h3>
            </header>
            <ul className="divide-y divide-stone-100">
              {unreadThreads.length === 0 ? (
                <li className="px-4 py-6 text-center text-[11px] text-stone-400">
                  未対応はありません
                </li>
              ) : (
                unreadThreads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href="/admin/clients"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-stone-50"
                    >
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                        {t.unreadCount}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-stone-900">
                          {t.clientName}
                        </span>
                        <span className="block truncate text-[11px] text-stone-500">
                          {t.lastMessage}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-stone-900">顧客</h3>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  placeholder="顧客を検索"
                  className="h-8 w-44 rounded-md border border-stone-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <Link
                href="/admin/invites/new"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-500 px-2.5 text-[11px] font-medium text-white hover:bg-brand-700"
              >
                顧客を追加
              </Link>
            </div>
          </header>
          <ul className="divide-y divide-stone-100">
            {recentClients.map((c) => {
              const progress = Math.round((c.sessionsCompleted / c.sessionsTotal) * 100);
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="h-9 w-9 flex-none rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900">
                        {c.displayName}
                      </span>
                      <span className="block truncate text-[11px] text-stone-500">
                        {c.courseName} · {c.sessionsCompleted}/{c.sessionsTotal} 回
                      </span>
                    </span>
                    <span className="hidden w-32 flex-none sm:block">
                      <span className="block h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <span
                          className="block h-full bg-brand-500"
                          style={{ width: `${progress}%` }}
                        />
                      </span>
                      <span className="mt-1 block text-right text-[10px] text-stone-400">
                        {progress}%
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 flex-none text-stone-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white">
          <header className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-stone-900">セラピスト実績（今月）</h3>
            <Link
              href="/admin/staff"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:underline"
            >
              詳細
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">セラピスト</th>
                  <th className="px-4 py-2 text-right font-medium">担当数</th>
                  <th className="px-4 py-2 text-right font-medium">今月完遂</th>
                  <th className="px-4 py-2 text-right font-medium">満足度</th>
                  <th className="px-4 py-2 text-right font-medium">返信時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {demoTherapistPerformance.map((t) => (
                  <tr key={t.name}>
                    <td className="px-4 py-2.5 font-medium text-stone-900">{t.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{t.activeClients}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-brand-700">
                      {t.monthlyCompletions}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {t.averageRating.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {t.responseHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 flex items-center justify-between rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-stone-600">
            <Camera className="h-3.5 w-3.5 text-stone-500" />
            施術日には顧客詳細から進捗写真をアップロードできます
          </span>
          <Link
            href="/admin/clients"
            className="font-medium text-brand-700 hover:underline"
          >
            顧客一覧へ
          </Link>
        </section>
      </main>
    </div>
  );
}
