"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreatmentDayCameraModal } from "@/components/progress/treatment-day-camera-modal";

export type TreatmentDayCameraLauncherProps = {
  clientId: string;
  appointmentId: string;
  /** If true, the launcher opens the modal in demo mode (no real upload). */
  demo?: boolean;
};

/**
 * Prominent capture button shown next to each scheduled appointment on the
 * therapist today view. Opens the camera modal.
 */
export function TreatmentDayCameraLauncher({
  clientId,
  appointmentId,
  demo,
}: TreatmentDayCameraLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto"
      >
        <Camera className="h-4 w-4" />
        施術前を撮影
      </Button>
      <TreatmentDayCameraModal
        open={open}
        onClose={() => setOpen(false)}
        realUpload={demo ? undefined : { clientId, appointmentId }}
        forceShowDriveBanner={demo}
      />
    </>
  );
}
