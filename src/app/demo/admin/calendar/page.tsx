import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { MonthGrid, type CalendarAppointment } from "@/components/calendar/month-grid";
import { Card, CardContent } from "@/components/ui/card";
import { demoAppointments, demoTherapistPerformance } from "@/lib/demo/fixtures";

// Color-coded by therapist.
const THERAPIST_COLORS: Record<string, string> = {
  "佐藤 美咲": "bg-brand-500",
  "高橋 葵": "bg-emerald-500",
  "中村 真奈": "bg-amber-500",
};

/**
 * Demo SalonAdmin calendar — org-wide. Compact week view per therapist
 * + month overview color-coded by therapist.
 */
export default function DemoAdminCalendarPage() {
  const anchor = new Date("2026-05-18T09:00:00+09:00");
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allAppointments: CalendarAppointment[] = demoAppointments.map((a) => ({
    id: a.id,
    scheduledAt: a.scheduledAt,
    therapistId: a.therapistName,
    therapistName: a.therapistName,
    clientName: a.clientName,
    status: a.status,
    durationMin: a.durationMinutes,
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
            運営カレンダー
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-stone-900">
            <CalendarDays className="h-5 w-5 text-brand-700" />
            サロン全体スケジュール
          </h1>
        </div>
        <Link
          href="/demo/admin"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 経営者トップへ
        </Link>
      </header>

      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">月次オーバービュー</p>
          <p className="mt-1 text-xs text-stone-500">セラピストごとに色分けして表示します。</p>
          <ul className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
            {demoTherapistPerformance.map((t) => (
              <li key={t.name} className="flex items-center gap-1">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    THERAPIST_COLORS[t.name] ?? "bg-stone-400"
                  }`}
                />
                {t.name}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <MonthGrid
              year={anchor.getFullYear()}
              month={anchor.getMonth()}
              appointments={allAppointments}
              accentColorByTherapist={THERAPIST_COLORS}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">
            週次ビュー（{format(weekStart, "M月d日")} 〜 {format(addDays(weekStart, 6), "M月d日")}）
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[640px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-stone-200 bg-stone-50 px-2 py-1 text-left font-medium text-stone-600">
                    セラピスト
                  </th>
                  {weekDays.map((d) => (
                    <th
                      key={d.toISOString()}
                      className="border border-stone-200 bg-stone-50 px-2 py-1 text-center font-medium text-stone-600"
                    >
                      {format(d, "M/d (EEE)")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoTherapistPerformance.map((t) => (
                  <tr key={t.name}>
                    <th className="border border-stone-200 bg-white px-2 py-1 text-left text-stone-900">
                      {t.name}
                    </th>
                    {weekDays.map((d) => {
                      const appts = allAppointments
                        .filter(
                          (a) =>
                            a.therapistName === t.name &&
                            isSameDay(new Date(a.scheduledAt), d),
                        )
                        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
                      return (
                        <td
                          key={d.toISOString()}
                          className="border border-stone-200 bg-white px-1 py-1 align-top"
                        >
                          <div className="space-y-1">
                            {appts.length === 0 ? (
                              <span className="text-stone-300">—</span>
                            ) : (
                              appts.map((a) => (
                                <div
                                  key={a.id}
                                  className={`rounded px-1.5 py-0.5 text-[10px] text-white ${
                                    THERAPIST_COLORS[t.name] ?? "bg-stone-400"
                                  }`}
                                >
                                  {format(new Date(a.scheduledAt), "HH:mm")} {a.clientName}
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
