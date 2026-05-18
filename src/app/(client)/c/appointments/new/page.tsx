"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SlotPicker } from "@/components/appointments/slot-picker";
import { isDemoMode } from "@/lib/demo";
import { demoClient } from "@/lib/demo/fixtures";
import { addStoredAppointment } from "@/lib/demo/store";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const demo = isDemoMode();

  async function submit(iso: string) {
    setSubmitting(true);
    setError(null);
    try {
      if (demo) {
        addStoredAppointment({
          clientId: demoClient.id,
          therapistId: "佐藤 美咲",
          scheduledAt: iso,
          durationMin: 90,
          status: "confirmed",
          menuName: "背中トリートメント 90 分",
          clientName: demoClient.displayName,
          therapistName: demoClient.primaryTherapistName,
        });
        toast.success("ご予約を確定しました");
        router.push("/c/appointments");
        return;
      }
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scheduledAt: iso, durationMin: 60 }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "予約に失敗しました");
        return;
      }
      toast.success("ご予約を確定しました");
      router.push("/c/appointments");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">新規予約</h1>
      <p className="text-sm text-stone-600">ご希望の日時を選択してください。</p>
      <SlotPicker onSubmit={submit} submitting={submitting} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
