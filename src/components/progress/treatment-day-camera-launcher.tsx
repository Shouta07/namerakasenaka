"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreatmentDayCameraModal } from "@/components/progress/treatment-day-camera-modal";
import { useStoredCapturedAppts } from "@/lib/demo/store";

export type TreatmentDayCameraLauncherProps = {
  clientId: string;
  appointmentId: string;
  /** If true, the launcher persists captures to localStorage instead of /api. */
  demo?: boolean;
};

/**
 * Capture button shown next to each scheduled appointment on the
 * therapist today view. Opens the camera modal and shows a 撮影済み badge
 * once the appointment has been captured in the local store.
 */
export function TreatmentDayCameraLauncher({
  clientId,
  appointmentId,
  demo,
}: TreatmentDayCameraLauncherProps) {
  const [open, setOpen] = useState(false);
  const captured = useStoredCapturedAppts();
  const isCaptured = captured.some((c) => c.appointmentId === appointmentId);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto"
      >
        <Camera className="h-4 w-4" />
        施術前を撮影
      </Button>
      {isCaptured ? (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          📷 撮影済み
        </span>
      ) : null}
      <TreatmentDayCameraModal
        open={open}
        onClose={() => setOpen(false)}
        realUpload={demo ? undefined : { clientId, appointmentId }}
        demoMeta={demo ? { clientId, appointmentId } : undefined}
        forceShowDriveBanner={demo}
      />
    </div>
  );
}
