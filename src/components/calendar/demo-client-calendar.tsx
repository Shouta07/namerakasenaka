"use client";

import { useMemo } from "react";
import { addDays, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  MonthGrid,
  type CalendarAppointment,
} from "@/components/calendar/month-grid";
import { SlotPicker, type SlotCandidate } from "@/components/calendar/slot-picker";
import { demoAppointments, demoClient } from "@/lib/demo/fixtures";
import { useStoredAppointments } from "@/lib/demo/store";

const ANCHOR = new Date("2026-05-18T09:00:00+09:00");

export function DemoClientCalendar() {
  const stored = useStoredAppointments();

  const myAppointments = useMemo<CalendarAppointment[]>(() => {
    const fixtures: CalendarAppointment[] = demoAppointments
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
    const mine: CalendarAppointment[] = stored
      .filter((a) => a.clientId === demoClient.id)
      .map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        therapistId: a.therapistId ?? a.therapistName,
        therapistName: a.therapistName,
        clientName: a.clientName,
        status: a.status,
        durationMin: a.durationMin,
      }));
    return [...fixtures, ...mine];
  }, [stored]);

  const recommended = addDays(ANCHOR, 28);
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
            year={ANCHOR.getFullYear()}
            month={ANCHOR.getMonth()}
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
            <SlotPicker
              candidates={candidates}
              demoMeta={{
                clientId: demoClient.id,
                clientName: demoClient.displayName,
                therapistId: demoClient.primaryTherapistName,
                therapistName: demoClient.primaryTherapistName,
                durationMin: 90,
                menuName: "背中トリートメント 90 分",
                redirectTo: "/c/appointments",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">翌月以降</p>
          <div className="mt-3">
            <MonthGrid
              year={addDays(ANCHOR, 60).getFullYear()}
              month={addDays(ANCHOR, 60).getMonth()}
              appointments={myAppointments}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
