import { addDays, format, isSameDay } from "date-fns";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { MonthGrid, type CalendarAppointment } from "@/components/calendar/month-grid";
import { SlotPicker, type SlotCandidate } from "@/components/calendar/slot-picker";
import { Card, CardContent } from "@/components/ui/card";
import { demoAppointments } from "@/lib/demo/fixtures";

const THERAPIST_NAME = "佐藤 美咲";

/**
 * Demo Therapist calendar — full day view + month grid.
 * "予定を移動" affordance reveals a "次の3スロット候補" panel (visual only).
 */
export default function DemoTherapistCalendarPage() {
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

  // Sample "next 3 candidate slots" for the move-affordance demo.
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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
            セラピストカレンダー
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-stone-900">
            <CalendarDays className="h-5 w-5 text-brand-700" />
            {THERAPIST_NAME} さんの予定
          </h1>
        </div>
        <Link
          href="/demo/therapist"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> セラピストトップへ
        </Link>
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

      <section className="mt-6">
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

      <Card className="mt-5">
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
    </main>
  );
}
