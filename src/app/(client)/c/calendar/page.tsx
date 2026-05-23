export const dynamic = "force-dynamic";

import { addDays, format } from "date-fns";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { MonthGrid, type CalendarAppointment } from "@/components/calendar/month-grid";
import { DemoClientCalendar } from "@/components/calendar/demo-client-calendar";
import { Button } from "@/components/ui/button";
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

export default async function ClientCalendarPage() {
  if (isDemoMode()) {
    return <DemoClientCalendar />;
  }

  const supabase = await getServerSupabase();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString();

  const { data: apptData } = await supabase
    .from("appointments")
    .select("id, scheduled_at, duration_min, status, therapist_id, client_id")
    .gte("scheduled_at", start)
    .lt("scheduled_at", end)
    .order("scheduled_at", { ascending: true });

  const rows = (apptData ?? []) as unknown as AppointmentRow[];

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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">カレンダー</h1>
          <p className="mt-1 text-sm text-stone-500">
            ご来店スケジュールと次回推奨枠を確認できます。
          </p>
        </div>
        <Link href="/c/appointments/new">
          <Button>新しい予約 →</Button>
        </Link>
      </header>

      <Card>
        <CardContent>
          <MonthGrid
            year={today.getFullYear()}
            month={today.getMonth()}
            appointments={appointments}
            recommendedDate={recommendedIso}
            hrefForDate={(iso) => {
              const d = new Date(iso);
              const t = new Date();
              t.setHours(0, 0, 0, 0);
              if (d.getTime() < t.getTime()) return null;
              return `/c/appointments/new?date=${iso}`;
            }}
          />
          <p className="mt-3 text-[11px] text-stone-500">
            日付をタップすると、その日の空き枠から予約できます。
          </p>
        </CardContent>
      </Card>

      <Card className="border-brand-100 bg-brand-50/30">
        <CardContent>
          <p className="text-xs text-brand-700">
            次回ご来店の推奨日:{" "}
            <span className="font-semibold">
              {format(recommended, "yyyy年M月d日(EEE)")}
            </span>
          </p>
          <p className="mt-1 text-xs text-stone-500">
            ご契約コースの推奨間隔をもとに自動算出しています（コース理解型推奨）。
          </p>
          <div className="mt-3">
            <Link href={`/c/appointments/new?date=${recommendedIso}`}>
              <Button variant="secondary">推奨日で予約する</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
