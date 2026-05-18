"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { addStoredAppointment } from "@/lib/demo/store";

export type SlotCandidate = {
  /** ISO datetime */
  scheduledAt: string;
  /** Display label, e.g. "10:00" */
  label: string;
  /** Whether this slot is the recommended one. */
  recommended?: boolean;
};

export type SlotPickerProps = {
  candidates: SlotCandidate[];
  /** When provided, the picker POSTs to /api/appointments on confirm. */
  realPost?: { therapistId?: string; clientId?: string; durationMin?: number };
  /** Demo metadata — client / therapist labels written to the local store. */
  demoMeta?: {
    clientId: string;
    clientName: string;
    therapistId: string;
    therapistName: string;
    durationMin?: number;
    menuName?: string;
    /** Where to redirect after the booking. */
    redirectTo?: string;
  };
  onConfirm?: (slot: SlotCandidate) => void;
  /** Label for the heading. */
  heading?: string;
};

export function SlotPicker({
  candidates,
  realPost,
  demoMeta,
  onConfirm,
  heading = "次の3スロット候補",
}: SlotPickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(
    candidates.find((c) => c.recommended)?.scheduledAt ?? candidates[0]?.scheduledAt ?? null,
  );
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    const slot = candidates.find((c) => c.scheduledAt === selected);
    if (!slot) return;

    if (realPost) {
      startTransition(async () => {
        try {
          const res = await fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scheduledAt: slot.scheduledAt,
              durationMin: realPost.durationMin ?? 90,
              therapistId: realPost.therapistId,
              clientId: realPost.clientId,
            }),
          });
          if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(body.error ?? "request_failed");
          }
          toast.success("予約申請を受け付けました");
          onConfirm?.(slot);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "request_failed";
          toast.error(`予約申請に失敗しました（${msg}）`);
        }
      });
      return;
    }

    // Demo persistence path.
    if (demoMeta) {
      try {
        addStoredAppointment({
          clientId: demoMeta.clientId,
          therapistId: demoMeta.therapistId,
          scheduledAt: slot.scheduledAt,
          durationMin: demoMeta.durationMin ?? 90,
          status: "confirmed",
          menuName: demoMeta.menuName ?? "背中トリートメント 90 分",
          clientName: demoMeta.clientName,
          therapistName: demoMeta.therapistName,
        });
        toast.success("ご予約を確定しました");
        onConfirm?.(slot);
        if (demoMeta.redirectTo) {
          setTimeout(() => router.push(demoMeta.redirectTo!), 400);
        }
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "store_error";
        toast.error(`予約の保存に失敗しました（${msg}）`);
        return;
      }
    }

    toast.success("予約候補を確定しました");
    onConfirm?.(slot);
  };

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        この日に空き枠はありません。別の日を選んでください。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-stone-900">{heading}</p>
      <div className="grid grid-cols-3 gap-2">
        {candidates.map((c) => {
          const isSelected = c.scheduledAt === selected;
          return (
            <button
              key={c.scheduledAt}
              type="button"
              onClick={() => setSelected(c.scheduledAt)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-stone-200 bg-white text-stone-700 hover:border-brand-300",
              )}
            >
              <span>{c.label}</span>
              {c.recommended ? (
                <span className="ml-1 rounded bg-brand-500 px-1 text-[9px] font-semibold text-white">
                  推奨
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <Button type="button" onClick={handleConfirm} disabled={pending} className="w-full">
        {pending ? "送信中…" : "確定"}
      </Button>
    </div>
  );
}
