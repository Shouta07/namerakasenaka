"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/progress/camera-capture";
import {
  addStoredProgressPhoto,
  fileToResizedDataUrl,
  markAppointmentCaptured,
} from "@/lib/demo/store";
import { cn } from "@/lib/utils/cn";
import type { PhotoType } from "@/types/domain";

export type TreatmentDayCameraModalProps = {
  open: boolean;
  onClose: () => void;
  /** Real-mode metadata. When omitted, modal runs in demo (no upload). */
  realUpload?: {
    clientId: string;
    appointmentId: string;
  };
  /** When in demo mode, identifies which appointment / client to attach to. */
  demoMeta?: {
    clientId: string;
    appointmentId: string;
  };
  /** Initial photo type — defaults to 'before'. */
  initialPhotoType?: PhotoType;
  /** Always show the Google Drive banner unconditionally — used by demo. */
  forceShowDriveBanner?: boolean;
};

export function TreatmentDayCameraModal({
  open,
  onClose,
  realUpload,
  demoMeta,
  initialPhotoType = "before",
  forceShowDriveBanner = false,
}: TreatmentDayCameraModalProps) {
  const [photoType, setPhotoType] = useState<PhotoType>(initialPhotoType);
  const [captured, setCaptured] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!captured) {
      toast.error("撮影が完了していません");
      return;
    }

    if (!realUpload) {
      // Demo mode — persist to local store.
      setUploading(true);
      try {
        const dataUrl = await fileToResizedDataUrl(captured, 1024, 0.82);
        if (demoMeta) {
          addStoredProgressPhoto({
            clientId: demoMeta.clientId,
            photoType,
            caption: `${photoType === "before" ? "施術前" : "施術後"}（${new Date().toLocaleDateString("ja-JP")}）`,
            signedUrl: dataUrl,
            takenAt: new Date().toISOString(),
            appointmentId: demoMeta.appointmentId,
          });
          markAppointmentCaptured(demoMeta.appointmentId);
        }
        toast.success("撮影を保存しました");
        setCaptured(null);
        onClose();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "save_failed";
        toast.error(`保存に失敗しました（${msg}）`);
      } finally {
        setUploading(false);
      }
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", captured);
      form.append("clientId", realUpload.clientId);
      form.append("photoType", photoType);
      form.append("appointmentId", realUpload.appointmentId);
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "upload_failed");
      }
      toast.success("保存しました");
      setCaptured(null);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "upload_failed";
      toast.error(`保存に失敗しました（${msg}）`);
    } finally {
      setUploading(false);
    }
  };

  // Banner visibility: forced (demo) or env-flagged dual-write enabled.
  const showDriveBanner =
    forceShowDriveBanner ||
    process.env.NEXT_PUBLIC_PHOTO_STORAGE_MODE === "dual" ||
    process.env.NEXT_PUBLIC_PHOTO_STORAGE_MODE === "gdrive_only";

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center gap-2 pb-2">
        <Camera className="h-5 w-5 text-brand-700" />
        <h2 className="text-base font-semibold text-stone-900">施術写真の撮影</h2>
      </div>

      <div className="flex gap-2">
        {(["before", "after"] as PhotoType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setPhotoType(t)}
            className={cn(
              "min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              photoType === t
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-stone-200 bg-white text-stone-700 hover:border-brand-300",
            )}
          >
            {t === "before" ? "施術前" : "施術後"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <CameraCapture onCapture={setCaptured} disabled={uploading} />
      </div>

      <div className="mt-3">
        <label className="block text-xs text-stone-600">
          ファイルから選択（カメラが使えない場合）
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setCaptured(f);
            }}
          />
        </label>
      </div>

      {captured ? (
        <p className="mt-2 text-xs text-stone-600">
          撮影済み: {captured.name} ({Math.round(captured.size / 1024)} KB)
        </p>
      ) : null}

      {showDriveBanner ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Google ドライブにも自動保存されます。
        </p>
      ) : null}

      <div className="mt-4 flex gap-2 pb-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={uploading}
          className="flex-1"
        >
          キャンセル
        </Button>
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!captured || uploading}
          className="flex-1"
        >
          {uploading ? "保存中…" : "保存"}
        </Button>
      </div>
    </BottomSheet>
  );
}
