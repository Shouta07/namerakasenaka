import { addDays, format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { MonthGrid, type CalendarAppointment } from "@/components/calendar/month-grid";
import { SlotPicker, type SlotCandidate } from "@/components/calendar/slot-picker";
import { Card, CardContent } from "@/components/ui/card";
import { demoAppointments, demoClient } from "@/lib/demo/fixtures";

/**
 * Demo Client calendar (§4.3 + §4.3.2).
 * - Highlights days that have appointments.
 * - Shows the next-recommended slot (course-aware) in brand color with a 推奨 badge.
 * - SlotPicker is purely visual on demo (no API call).
 */
export default function DemoClientCalendarPage() {
  // Anchor: 2026-05-18 (matches the rest of the demo).
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

  // 3 candidate slots for the recommended day.
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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-700">
            顧客カレンダー
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-stone-900">
            <CalendarDays className="h-5 w-5 text-brand-700" />
            来店スケジュール
          </h1>
        </div>
        <Link
          href="/demo/client"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 顧客トップへ
        </Link>
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

      <Card className="mt-5 border-brand-100 bg-brand-50/30">
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

      <Card className="mt-5">
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
    </main>
  );
}
