import Link from "next/link";
import { CalendarCheck, ClipboardList, Users } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import {
  demoAppointments,
  demoClient,
  demoClientRoster,
} from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TreatmentDayCameraLauncher } from "@/components/progress/treatment-day-camera-launcher";
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from "@/types/domain";

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: AppointmentStatus;
  client_id: string;
};

export default async function TherapistTodayPage() {
  if (isDemoMode()) {
    return <DemoTherapistToday />;
  }

  const supabase = await getServerSupabase();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const dayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, duration_min, status, client_id")
    .gte("scheduled_at", dayStart)
    .lt("scheduled_at", dayEnd)
    .order("scheduled_at", { ascending: true });

  const rows = (data ?? []) as unknown as AppointmentRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">本日の予約</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">本日の予約はありません。</p>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between sm:flex-1">
                  <div>
                    <p className="text-lg font-medium">
                      {new Date(a.scheduled_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-stone-500">所要 {a.duration_min}分</p>
                  </div>
                  <Badge tone={a.status === "confirmed" ? "success" : "neutral"}>
                    {APPOINTMENT_STATUS_LABEL[a.status]}
                  </Badge>
                </div>
                <div className="sm:flex-none">
                  <TreatmentDayCameraLauncher
                    clientId={a.client_id}
                    appointmentId={a.id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const THERAPIST_NAME = "佐藤 美咲";

function DemoTherapistToday() {
  const todayAppointments = demoAppointments
    .filter(
      (a) =>
        new Date(a.scheduledAt).toDateString() === new Date("2026-05-18").toDateString(),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const myClients = demoClientRoster.filter(
    (c) => c.primaryTherapistName === THERAPIST_NAME,
  );

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">本日の予約</h1>
          <p className="mt-0.5 text-xs text-stone-500">
            2026年5月18日（月）・ 担当 {THERAPIST_NAME}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 text-stone-500">
              <Users className="h-4 w-4" />
              <p className="text-xs">担当顧客数</p>
            </div>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {myClients.length} 名
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 text-stone-500">
              <CalendarCheck className="h-4 w-4" />
              <p className="text-xs">今日の施術数</p>
            </div>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {todayAppointments.filter((a) => a.therapistName === THERAPIST_NAME).length}{" "}
              件
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <CalendarCheck className="h-4 w-4 text-brand-700" />
          本日の予約
        </h2>
        <ul className="mt-3 space-y-2">
          {todayAppointments.map((appt) => (
            <li
              key={appt.id}
              className="rounded-xl border border-stone-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {new Date(appt.scheduledAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ・ {appt.clientName} 様
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {appt.menuName} ・ {appt.therapistName}
                  </p>
                </div>
                <Badge
                  tone={
                    appt.status === "completed"
                      ? "success"
                      : appt.status === "confirmed"
                        ? "brand"
                        : "neutral"
                  }
                >
                  {APPOINTMENT_STATUS_LABEL[appt.status]}
                </Badge>
              </div>
              {appt.status !== "completed" ? (
                <div className="mt-3">
                  <TreatmentDayCameraLauncher
                    clientId={appt.clientId}
                    appointmentId={appt.id}
                    demo
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
          <ClipboardList className="h-4 w-4 text-brand-700" />
          担当顧客
        </h2>
        <ul className="mt-3 space-y-2">
          {myClients.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-stone-200 bg-white p-3"
            >
              <Link
                href={
                  c.id === demoClient.id
                    ? `/t/clients/${c.id}`
                    : "/t/today"
                }
                className="flex items-center gap-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatarUrl}
                  alt={c.displayName}
                  className="h-10 w-10 flex-none rounded-full bg-stone-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {c.displayName}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {c.courseName} ・ {c.sessionsCompleted}/{c.sessionsTotal} 回
                  </p>
                </div>
                {c.id === demoClient.id ? (
                  <Badge tone="brand">詳細を見る</Badge>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
