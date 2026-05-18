"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type Slot = { iso: string; label: string };

function buildDefaultSlots(days = 7): Slot[] {
  const slots: Slot[] = [];
  const start = new Date();
  start.setMinutes(0, 0, 0);
  for (let d = 1; d <= days; d++) {
    for (const hour of [10, 13, 16, 19]) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + d);
      dt.setHours(hour, 0, 0, 0);
      slots.push({
        iso: dt.toISOString(),
        label: `${dt.getMonth() + 1}/${dt.getDate()} ${String(hour).padStart(2, "0")}:00`,
      });
    }
  }
  return slots;
}

export function SlotPicker({
  onSubmit,
  submitting,
  slots,
}: {
  onSubmit: (iso: string) => Promise<void> | void;
  submitting?: boolean;
  slots?: Slot[];
}) {
  const allSlots = useMemo(() => slots ?? buildDefaultSlots(), [slots]);
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {allSlots.map((s) => {
          const active = picked === s.iso;
          return (
            <button
              key={s.iso}
              type="button"
              onClick={() => setPicked(s.iso)}
              className={cn(
                "min-h-11 rounded-lg border px-3 py-2 text-sm",
                active
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-stone-200 bg-white text-stone-700 hover:border-brand-200",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <Button
        size="lg"
        className="w-full"
        disabled={!picked || submitting}
        onClick={() => picked && onSubmit(picked)}
      >
        この時間で予約する
      </Button>
    </div>
  );
}
