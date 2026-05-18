export const dynamic = "force-dynamic";

import { addDays, format, isSameDay } from "date-fns";
import { Clock } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoAppointments } from "@/lib/demo/fixtures";
import { MonthGrid, type CalendarAppointment } from "@/components/calendar/month-grid";
import { SlotPicker, type SlotCandidate } from "@/components/calendar/slot-picker";
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
  if (isDemoMode()) {
    return <DemoTherapistCalendar />;
  }

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

const THERAPIST_NAME = "佐藤 美咲";

function DemoTherapistCalendar() {
  const anchor = new Date("2026-05-18T09:00:00+09:00");

  const myAppointments: CalendarAppointment[] = demoAppointments
    .filter((a) => a.therapistName === THERAPIST_NAME)
    .map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt,
      therapistId: a.therapistName,
      therapistName: a.therapistName,
      clientName: a.clientName,
      status: a.status,
      durationMin: a.durationMinutes,
    }));

  const todays = myAppointments
    .filter((a) => isSameDay(new Date(a.scheduledAt), anchor))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const candidates: SlotCandidate[] = [
    {
      scheduledAt: new Date(anchor.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      label: "18:00",
    },
    {
      scheduledAt: new Date(addDays(anchor, 1).getTime() + 5 * 60 * 60 * 1000).toISOString(),
      label: "翌日 14:00",
      recommended: true,
    },
    {
      scheduledAt: new Date(addDays(anchor, 1).getTime() + 7 * 60 * 60 * 1000).toISOString(),
      label: "翌日 16:00",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{THERAPIST_NAME} さんの予定</h1>
        <p className="mt-1 text-sm text-stone-500">
          月次グリッドと本日の予定、予定移動の候補枠を確認できます。
        </p>
      </header>

      <Card>
        <CardContent>
          <MonthGrid
            year={anchor.getFullYear()}
            month={anchor.getMonth()}
            appointments={myAppointments}
          />
        </CardContent>
      </Card>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <Clock className="h-4 w-4 text-brand-700" />
          {format(anchor, "M月d日(EEE)")} の予定
        </h2>
        <ul className="mt-3 space-y-2">
          {todays.length === 0 ? (
            <li className="text-sm text-stone-500">本日の予約はありません。</li>
          ) : null}
          {todays.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-900">
                  {format(new Date(a.scheduledAt), "HH:mm")} ・ {a.clientName} 様
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  所要 {a.durationMin}分 ・ ステータス {a.status}
                </p>
              </div>
              <span className="text-xs text-stone-400">タップで移動</span>
            </li>
          ))}
        </ul>
      </section>

      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">予定を移動</p>
          <p className="mt-1 text-xs text-stone-500">
            既存予約を別の枠に移したい場合、ワンタップで次の 3 つの候補を提示します。
            お客様と相談しながらその場で決定できます。
          </p>
          <div className="mt-4">
            <SlotPicker candidates={candidates} heading="次の3スロット候補" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
