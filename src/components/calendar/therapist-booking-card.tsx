"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  DateSlotPicker,
  combineDateTimeToIso,
} from "@/components/appointments/date-slot-picker";
import {
  demoClientRoster,
  getAvailability,
  getAvailabilityForSalon,
  type DayAvailability,
  type DemoClient,
  type DemoTherapist,
} from "@/lib/demo/fixtures";
import { addStoredAppointment, useStoredAppointments } from "@/lib/demo/store";

export type TherapistBookingCardProps = {
  /** When set, locks the picker to one therapist. */
  fixedTherapistName?: string;
  /** Visible to admins who can pick the therapist. */
  therapists?: DemoTherapist[];
  /** Heading override. */
  heading?: string;
  description?: string;
};

export function TherapistBookingCard({
  fixedTherapistName,
  therapists,
  heading = "新しい予約を追加",
  description = "お客様の代わりに予約枠を確保できます。",
}: TherapistBookingCardProps) {
  const stored = useStoredAppointments();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [therapistName, setTherapistName] = useState<string | "all">(
    fixedTherapistName ?? therapists?.[0]?.name ?? "all",
  );
  const [clientId, setClientId] = useState<string>(demoClientRoster[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availability: DayAvailability[] = useMemo(() => {
    const extra = stored.map((a) => ({
      scheduledAt: a.scheduledAt,
      durationMinutes: a.durationMin,
      therapistName: a.therapistName,
      appointmentId: a.id,
    }));
    if (therapistName === "all") {
      return getAvailabilityForSalon({ daysAhead: 14, extraBookings: extra });
    }
    return getAvailability({
      therapistName,
      daysAhead: 14,
      extraBookings: extra,
    });
  }, [stored, therapistName]);

  const selectedClient: DemoClient | undefined = demoClientRoster.find(
    (c) => c.id === clientId,
  );

  const onConfirm = ({ date, time }: { date: string; time: string }) => {
    if (!selectedClient) {
      toast.error("お客様を選択してください");
      return;
    }
    const usedTherapist =
      therapistName === "all"
        ? selectedClient.primaryTherapistName
        : therapistName;
    setSubmitting(true);
    try {
      addStoredAppointment({
        clientId: selectedClient.id,
        therapistId: usedTherapist,
        scheduledAt: combineDateTimeToIso(date, time),
        durationMin: 90,
        status: "confirmed",
        menuName: "背中トリートメント 90 分",
        clientName: selectedClient.displayName,
        therapistName: usedTherapist,
      });
      toast.success(`${selectedClient.displayName} 様の予約を確定しました`);
      setSelectedDate(null);
      setSelectedTime(null);
      setTimeout(() => setSheetOpen(false), 300);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "store_error";
      toast.error(`予約の保存に失敗しました（${msg}）`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-900">{heading}</p>
              <p className="mt-1 text-xs text-stone-500">{description}</p>
            </div>
            <Button onClick={() => setSheetOpen(true)}>予約を追加</Button>
          </div>
        </CardContent>
      </Card>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="新規予約"
      >
        {!fixedTherapistName && therapists && therapists.length > 1 ? (
          <div className="mb-3">
            <p className="mb-1 text-[11px] font-medium text-stone-500">担当セラピスト</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTherapistName("all")}
                className={
                  therapistName === "all"
                    ? "rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                    : "rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-700"
                }
              >
                サロン全体
              </button>
              {therapists.map((t) => {
                const active = therapistName === t.name;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTherapistName(t.name)}
                    className={
                      active
                        ? "rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                        : "rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-700"
                    }
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <label htmlFor="booking-client" className="mb-1 block text-[11px] font-medium text-stone-500">
            お客様
          </label>
          <select
            id="booking-client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800"
          >
            {demoClientRoster.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}（{c.courseName}）
              </option>
            ))}
          </select>
        </div>

        <DateSlotPicker
          availability={availability}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setSelectedTime(null);
          }}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
          recommendedDate={availability.find((d) => d.isRecommended)?.date}
          recommendedTime="14:00"
          therapistName={therapistName === "all" ? undefined : therapistName}
          onConfirm={onConfirm}
          submitting={submitting}
        />
      </BottomSheet>
    </>
  );
}
