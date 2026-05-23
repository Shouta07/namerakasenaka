"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DateSlotPicker,
  combineDateTimeToIso,
} from "@/components/appointments/date-slot-picker";
import type { DayAvailability } from "@/lib/demo/fixtures";
import { addStoredAppointment } from "@/lib/demo/store";

export type NewAppointmentFlowProps = {
  availability: DayAvailability[];
  recommendedDate?: string;
  recommendedTime?: string;
  clientId: string;
  clientName: string;
  therapistId: string;
  therapistName: string;
  /** Initial selected date — useful when arriving from a day-tap. */
  initialDate?: string;
  /** When true, send the booking through the demo store; otherwise POST it. */
  demoMode: boolean;
  /** Where to redirect after a successful booking. */
  redirectTo?: string;
};

export function NewAppointmentFlow({
  availability,
  recommendedDate,
  recommendedTime = "14:00",
  clientId,
  clientName,
  therapistId,
  therapistName,
  initialDate,
  demoMode,
  redirectTo = "/c/appointments",
}: NewAppointmentFlowProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(
    initialDate ?? recommendedDate ?? null,
  );
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  async function handleConfirm({ date, time }: { date: string; time: string }) {
    setSubmitting(true);
    setError(null);
    try {
      const iso = combineDateTimeToIso(date, time);
      if (demoMode) {
        addStoredAppointment({
          clientId,
          therapistId,
          scheduledAt: iso,
          durationMin: 90,
          status: "confirmed",
          menuName: "背中トリートメント 90 分",
          clientName,
          therapistName,
        });
        toast.success("ご予約を確定しました");
        router.push(redirectTo);
        return;
      }
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scheduledAt: iso,
          durationMin: 90,
          therapistId,
          clientId,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "予約に失敗しました");
        return;
      }
      toast.success("ご予約を確定しました");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "予約に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <DateSlotPicker
        availability={availability}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        selectedTime={selectedTime}
        onSelectTime={setSelectedTime}
        recommendedDate={recommendedDate}
        recommendedTime={recommendedTime}
        therapistName={therapistName}
        onConfirm={handleConfirm}
        submitting={submitting}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
