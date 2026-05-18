import Link from "next/link";
import { CalendarCheck, ClipboardList, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TreatmentDayCameraLauncher } from "@/components/progress/treatment-day-camera-launcher";
import {
  demoAppointments,
  demoClient,
  demoClientRoster,
} from "@/lib/demo/fixtures";
import { APPOINTMENT_STATUS_LABEL } from "@/types/domain";

const THERAPIST_NAME = "佐藤 美咲";

export default function DemoTherapistPage() {
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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
          セラピストビュー
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">
          {THERAPIST_NAME} さん、本日もよろしくお願いします
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          2026 年 5 月 18 日（月）
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
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

      <section className="mt-8">
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

      <section className="mt-8">
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
                    ? `/demo/therapist/clients/${c.id}`
                    : "/demo/therapist"
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
    </main>
  );
}
