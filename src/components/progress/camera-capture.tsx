"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onCapture: (file: File) => void;
  disabled?: boolean;
};

type Status = "idle" | "starting" | "ready" | "denied" | "unavailable";

export function CameraCapture({ onCapture, disabled }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus("ready");
    } catch (err) {
      const name = (err as { name?: string } | null)?.name ?? "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
      } else {
        setStatus("unavailable");
      }
      setError(err instanceof Error ? err.message : "camera_error");
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `progress-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }, [onCapture]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-stone-200 bg-stone-900">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        {status === "ready" ? <GuideOverlay /> : null}
        {status !== "ready" ? (
          <div className="absolute inset-0 grid place-items-center bg-stone-900/80 p-6 text-center text-sm text-stone-100">
            {status === "idle" && (
              <div className="space-y-3">
                <p>背中全体が枠に収まる位置で撮影します。</p>
                <Button type="button" onClick={start} disabled={disabled}>
                  カメラを起動
                </Button>
              </div>
            )}
            {status === "starting" && <p>カメラを起動しています…</p>}
            {status === "denied" && (
              <div className="space-y-2">
                <p>カメラへのアクセスが拒否されました。</p>
                <p className="text-xs text-stone-300">
                  ブラウザ設定でカメラを許可するか、下のファイル選択を使ってください。
                </p>
              </div>
            )}
            {status === "unavailable" && (
              <div className="space-y-2">
                <p>このデバイスではカメラを利用できません。</p>
                {error ? <p className="text-xs text-stone-300">{error}</p> : null}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {status === "ready" ? (
        <div className="flex gap-2">
          <Button type="button" size="lg" className="flex-1" onClick={capture}>
            撮影する
          </Button>
          <Button type="button" size="lg" variant="secondary" onClick={stop}>
            停止
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function GuideOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/40" />
      <div className="absolute left-0 top-1/3 h-px w-full bg-white/30" />
      <div className="absolute left-0 top-2/3 h-px w-full bg-white/30" />
      <div className="absolute inset-x-8 inset-y-12 rounded-md border-2 border-dashed border-white/70" />
      <div className="absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
        肩〜腰が枠内に収まるように
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
        距離: 約1.5m
      </div>
    </div>
  );
}
