export const dynamic = "force-dynamic";

import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoAppointments, demoTherapistPerformance } from "@/lib/demo/fixtures";
import { MonthGrid, type CalendarAppointment } from "@/components/calendar/month-grid";
import { Card, CardContent } from "@/components/ui/card";
import type { AppointmentStatus } from "@/types/domain";

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: AppointmentStatus;
  therapist_id: string | null;
  client_id: string;
};

type TherapistRow = {
  id: string;
  user_id: string;
};

type ProfileRow = {
  user_id: string;
  name: string;
};

// Pre-defined palette; will be assigned to therapists in stable order.
const THERAPIST_PALETTE = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-violet-500",
];

export default async function AdminCalendarPage() {
  if (isDemoMode()) {
    return <DemoAdminCalendar />;
  }

  const supabase = await getServerSupabase();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString();

  const [{ data: apptData }, { data: therapistData }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, scheduled_at, duration_min, status, therapist_id, client_id")
      .gte("scheduled_at", start)
      .lt("scheduled_at", end)
      .order("scheduled_at", { ascending: true }),
    supabase.from("therapists").select("id, user_id"),
  ]);

  const rows = (apptData ?? []) as unknown as AppointmentRow[];
  const therapists = (therapistData ?? []) as unknown as TherapistRow[];

  const userIds = therapists.map((t) => t.user_id);
  const { data: profileData } = userIds.length
    ? await supabase.from("profiles").select("user_id, name").in("user_id", userIds)
    : { data: [] };
  const profiles = (profileData ?? []) as unknown as ProfileRow[];
  const nameByUserId = new Map(profiles.map((p) => [p.user_id, p.name]));

  const therapistDisplay = therapists.map((t) => ({
    id: t.id,
    display_name: nameByUserId.get(t.user_id) ?? `セラピスト ${t.id.slice(0, 6)}`,
  }));

  const colorByTherapist: Record<string, string> = {};
  therapistDisplay.forEach((t, idx) => {
    colorByTherapist[t.id] = THERAPIST_PALETTE[idx % THERAPIST_PALETTE.length];
  });
  const nameById = new Map(therapistDisplay.map((t) => [t.id, t.display_name]));

  const appointments: CalendarAppointment[] = rows.map((r) => ({
    id: r.id,
    scheduledAt: r.scheduled_at,
    therapistId: r.therapist_id,
    therapistName: r.therapist_id ? (nameById.get(r.therapist_id) ?? null) : null,
    status: r.status,
    durationMin: r.duration_min,
  }));

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">カレンダー</h1>
        <p className="mt-1 text-sm text-stone-500">
          サロン全体の予定をセラピストごとに色分けして表示します。
        </p>
      </header>

      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">月次オーバービュー</p>
          <ul className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
            {therapistDisplay.map((t) => (
              <li key={t.id} className="flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${colorByTherapist[t.id]}`} />
                {t.display_name}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <MonthGrid
              year={today.getFullYear()}
              month={today.getMonth()}
              appointments={appointments}
              accentColorByTherapist={colorByTherapist}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
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
                {therapistDisplay.map((t) => (
                  <tr key={t.id}>
                    <th className="border border-stone-200 bg-white px-2 py-1 text-left text-stone-900">
                      {t.display_name}
                    </th>
                    {weekDays.map((d) => {
                      const appts = rows
                        .filter(
                          (a) =>
                            a.therapist_id === t.id && isSameDay(new Date(a.scheduled_at), d),
                        )
                        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
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
                                  className={`rounded px-1.5 py-0.5 text-[10px] text-white ${colorByTherapist[t.id]}`}
                                >
                                  {format(new Date(a.scheduled_at), "HH:mm")}
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
    </div>
  );
}

// Color-coded by therapist name for demo.
const DEMO_THERAPIST_COLORS: Record<string, string> = {
  "佐藤 美咲": "bg-brand-500",
  "高橋 葵": "bg-emerald-500",
  "中村 真奈": "bg-amber-500",
};

function DemoAdminCalendar() {
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">サロン全体スケジュール</h1>
        <p className="mt-1 text-sm text-stone-500">
          サロン全体の予定をセラピストごとに色分けして表示します。
        </p>
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
                    DEMO_THERAPIST_COLORS[t.name] ?? "bg-stone-400"
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
              accentColorByTherapist={DEMO_THERAPIST_COLORS}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
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
                                    DEMO_THERAPIST_COLORS[t.name] ?? "bg-stone-400"
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
    </div>
  );
}
