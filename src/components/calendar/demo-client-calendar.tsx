"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  MonthGrid,
  type CalendarAppointment,
} from "@/components/calendar/month-grid";
import { NewAppointmentFlow } from "@/components/appointments/new-appointment-flow";
import {
  demoAppointments,
  demoClient,
  getAvailability,
  type DayAvailability,
} from "@/lib/demo/fixtures";
import { useStoredAppointments } from "@/lib/demo/store";

const ANCHOR = new Date("2026-05-18T09:00:00+09:00");

function parseDateKey(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function DemoClientCalendar() {
  const stored = useStoredAppointments();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string | null>(null);

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

  const availability: DayAvailability[] = useMemo(
    () =>
      getAvailability({
        therapistName: demoClient.primaryTherapistName,
        daysAhead: 14,
        extraBookings: stored.map((a) => ({
          scheduledAt: a.scheduledAt,
          durationMinutes: a.durationMin,
          therapistName: a.therapistName,
          appointmentId: a.id,
        })),
      }),
    [stored],
  );

  const recommendedDate = availability.find((d) => d.isRecommended)?.date;
  const recommendedJa = recommendedDate
    ? format(parseDateKey(recommendedDate), "yyyy年M月d日(EEE)")
    : null;

  const openBookingWith = (date: string | null) => {
    setInitialDate(date);
    setBookingOpen(true);
  };

  // Anchor the month view to the recommended date if present, else to today.
  const monthAnchor = recommendedDate ? parseDateKey(recommendedDate) : ANCHOR;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">来店スケジュール</h1>
          <p className="mt-1 text-sm text-stone-500">
            月次カレンダーと空き枠をひと目で確認できます。
          </p>
        </div>
        <Button onClick={() => openBookingWith(recommendedDate ?? null)}>
          新しい予約 →
        </Button>
      </header>

      <Card>
        <CardContent>
          <MonthGrid
            year={monthAnchor.getFullYear()}
            month={monthAnchor.getMonth()}
            appointments={myAppointments}
            recommendedDate={recommendedDate}
            hrefForDate={(iso) => {
              // Past dates: no link.
              const d = parseDateKey(iso);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (d.getTime() < today.getTime()) return null;
              return `/c/appointments/new?date=${iso}`;
            }}
          />
          <p className="mt-3 text-[11px] text-stone-500">
            日付をタップすると、その日の空き枠から予約できます。
          </p>
        </CardContent>
      </Card>

      {recommendedJa ? (
        <Card className="border-brand-100 bg-brand-50/30">
          <CardContent>
            <p className="text-xs text-brand-700">
              次回ご来店の推奨日:{" "}
              <span className="font-semibold">{recommendedJa}</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">
              ご契約コースの推奨間隔をもとに自動算出しています（コース理解型推奨）。
              ご都合に合わせて時間帯をお選びください。
            </p>
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={() => openBookingWith(recommendedDate ?? null)}
              >
                推奨日で予約する
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent>
          <p className="text-sm font-semibold text-stone-900">翌月以降</p>
          <div className="mt-3">
            <MonthGrid
              year={addDays(monthAnchor, 30).getFullYear()}
              month={addDays(monthAnchor, 30).getMonth()}
              appointments={myAppointments}
            />
          </div>
        </CardContent>
      </Card>

      <BottomSheet
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="新しい予約"
      >
        <NewAppointmentFlow
          availability={availability}
          recommendedDate={recommendedDate}
          recommendedTime="14:00"
          clientId={demoClient.id}
          clientName={demoClient.displayName}
          therapistId={demoClient.primaryTherapistName}
          therapistName={demoClient.primaryTherapistName}
          initialDate={initialDate ?? recommendedDate}
          demoMode
          redirectTo="/c/appointments"
        />
        <p className="mt-3 text-[11px] text-stone-500">
          別ページで開きたい場合は
          <Link
            href={`/c/appointments/new${initialDate ? `?date=${initialDate}` : ""}`}
            className="ml-1 underline"
          >
            こちら
          </Link>
        </p>
      </BottomSheet>
    </div>
  );
}
