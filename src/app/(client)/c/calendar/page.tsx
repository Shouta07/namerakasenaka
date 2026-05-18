export const dynamic = "force-dynamic";

import { addDays, format } from "date-fns";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoAppointments, demoClient } from "@/lib/demo/fixtures";
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

type ClientRow = {
  id: string;
  primary_therapist_id: string | null;
};

export default async function ClientCalendarPage() {
  if (isDemoMode()) {
    return <DemoClientCalendar />;
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString();

  const [{ data: apptData }, { data: clientData }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, scheduled_at, duration_min, status, therapist_id, client_id")
      .gte("scheduled_at", start)
      .lt("scheduled_at", end)
      .order("scheduled_at", { ascending: true }),
    user
      ? supabase
          .from("clients")
          .select("id, primary_therapist_id")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows = (apptData ?? []) as unknown as AppointmentRow[];
  const meClient = clientData as ClientRow | null;

  const appointments: CalendarAppointment[] = rows.map((r) => ({
    id: r.id,
    scheduledAt: r.scheduled_at,
    therapistId: r.therapist_id,
    status: r.status,
    durationMin: r.duration_min,
  }));

  // Recommended: 4 weeks after the latest confirmed appointment, defaulting to today + 28d.
  const lastConfirmed = rows
    .filter((r) => r.status === "confirmed" || r.status === "completed")
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))[0];
  const baseDate = lastConfirmed ? new Date(lastConfirmed.scheduled_at) : new Date();
  const recommended = addDays(baseDate, 28);
  recommended.setHours(15, 0, 0, 0);
  const recommendedIso = format(recommended, "yyyy-MM-dd");

  const candidates: SlotCandidate[] = [
    { scheduledAt: recommended.toISOString(), label: "15:00", recommended: true },
    {
      scheduledAt: new Date(recommended.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      label: "17:00",
    },
    {
      scheduledAt: new Date(recommended.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      label: "13:00",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">カレンダー</h1>
        <p className="mt-1 text-sm text-stone-500">
          ご来店スケジュールと次回推奨枠を確認できます。
        </p>
      </header>

      <Card>
        <CardContent>
          <MonthGrid
            year={today.getFullYear()}
            month={today.getMonth()}
            appointments={appointments}
            recommendedDate={recommendedIso}
          />
        </CardContent>
      </Card>

      <Card className="border-brand-100 bg-brand-50/30">
        <CardContent>
          <p className="text-xs text-brand-700">
            次回ご来店の推奨日:{" "}
            <span className="font-semibold">
              {format(recommended, "yyyy年M月d日(EEE) HH:mm")}
            </span>
          </p>
          <p className="mt-1 text-xs text-stone-500">
            ご契約コースの推奨間隔をもとに自動算出しています（コース理解型推奨）。
          </p>
          <div className="mt-4">
            <SlotPicker
              candidates={candidates}
              realPost={{
                therapistId: meClient?.primary_therapist_id ?? undefined,
                clientId: meClient?.id,
                durationMin: 90,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DemoClientCalendar() {
  const anchor = new Date("2026-05-18T09:00:00+09:00");

  const myAppointments: CalendarAppointment[] = demoAppointments
    .filter((a) => a.clientId === demoClient.id)
    .map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt,
      therapistId: a.therapistName,
      therapistName: a.therapistName,
      clientName: a.clientName,
      status: a.status,
      durationMin: a.durationMinutes,
    }));

  // §4.3.2 コース理解型推奨: 4 週間後の同曜日の 15:00 を推奨。
  const recommended = addDays(anchor, 28);
  recommended.setHours(15, 0, 0, 0);
  const recommendedIso = format(recommended, "yyyy-MM-dd");

  const candidates: SlotCandidate[] = [
    { scheduledAt: new Date(recommended).toISOString(), label: "15:00", recommended: true },
    {
      scheduledAt: new Date(recommended.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      label: "17:00",
    },
    {
      scheduledAt: new Date(recommended.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      label: "13:00",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">来店スケジュール</h1>
        <p className="mt-1 text-sm text-stone-500">
          月次カレンダーと次回推奨枠をひと目で確認できます。
        </p>
      </header>

      <Card>
        <CardContent>
          <MonthGrid
            year={anchor.getFullYear()}
            month={anchor.getMonth()}
            appointments={myAppointments}
            recommendedDate={recommendedIso}
          />
        </CardContent>
      </Card>

      <Card className="border-brand-100 bg-brand-50/30">
        <CardContent>
          <p className="text-xs text-brand-700">
            次回ご来店の推奨日:{" "}
            <span className="font-semibold">
              {format(recommended, "yyyy年M月d日(EEE) HH:mm")}
            </span>
          </p>
          <p className="mt-1 text-xs text-stone-500">
            ご契約コースの推奨間隔をもとに自動算出しています（コース理解型推奨）。
            ご都合に合わせて時間帯をお選びください。
          </p>
          <div className="mt-4">
            <SlotPicker candidates={candidates} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">翌月以降</p>
          <div className="mt-3">
            <MonthGrid
              year={addDays(anchor, 60).getFullYear()}
              month={addDays(anchor, 60).getMonth()}
              appointments={myAppointments}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
