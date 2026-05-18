export const dynamic = "force-dynamic";

import { format, isSameDay } from "date-fns";
import { getServerSupabase } from "@/lib/supabase/server";
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

export default async function TherapistCalendarPage() {
  const supabase = await getServerSupabase();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, duration_min, status, therapist_id, client_id")
    .gte("scheduled_at", start)
    .lt("scheduled_at", end)
    .order("scheduled_at", { ascending: true });

  const rows = (data ?? []) as unknown as AppointmentRow[];
  const appointments: CalendarAppointment[] = rows.map((r) => ({
    id: r.id,
    scheduledAt: r.scheduled_at,
    therapistId: r.therapist_id,
    status: r.status,
    durationMin: r.duration_min,
  }));

  const todays = rows
    .filter((r) => isSameDay(new Date(r.scheduled_at), today))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">カレンダー</h1>
        <p className="mt-1 text-sm text-stone-500">
          月次グリッドと本日の予定をまとめて確認できます。
        </p>
      </header>

      <Card>
        <CardContent>
          <MonthGrid
            year={today.getFullYear()}
            month={today.getMonth()}
            appointments={appointments}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-stone-900">
            {format(today, "M月d日(EEE)")} の予定
          </h2>
          {todays.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">本日の予約はありません。</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {todays.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900">
                      {format(new Date(a.scheduled_at), "HH:mm")}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      所要 {a.duration_min} 分 ・ {a.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
