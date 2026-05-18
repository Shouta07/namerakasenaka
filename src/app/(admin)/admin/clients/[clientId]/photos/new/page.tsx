"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MobileAppBar } from "@/components/ui/app-bar";
import { CameraCapture } from "@/components/progress/camera-capture";
import { isDemoMode } from "@/lib/demo";
import {
  addStoredProgressPhoto,
  fileToResizedDataUrl,
} from "@/lib/demo/store";
import type { PhotoType } from "@/types/domain";

/**
 * Salon-admin parallel to the therapist's /t/clients/[id]/photos/new page.
 * Same demo store + API. Kept as a standalone fallback in addition to the
 * bottom-sheet launcher on the unified customer detail page.
 */
export default function AdminNewPhotoPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>("after");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = isDemoMode();

  function setSelectedFile(f: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("写真を撮影またはファイル選択してください");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (demo) {
        const dataUrl = await fileToResizedDataUrl(file, 1024, 0.82);
        addStoredProgressPhoto({
          clientId,
          photoType,
          caption: caption || null,
          signedUrl: dataUrl,
          takenAt: new Date().toISOString(),
        });
        toast.success("写真をアップロードしました");
        router.push(`/admin/clients/${clientId}`);
        return;
      }
      const form = new FormData();
      form.append("clientId", clientId);
      form.append("photoType", photoType);
      form.append("caption", caption);
      form.append("file", file);
      const res = await fetch("/api/photos/upload", { method: "POST", body: form });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "アップロードに失敗しました");
        return;
      }
      toast.success("写真をアップロードしました");
      router.push(`/admin/clients/${clientId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <MobileAppBar
        title="進捗写真を撮影"
        eyebrow="SalonAdmin"
        backHref={`/admin/clients/${clientId}`}
      />
      <h1 className="hidden text-2xl font-semibold md:block">進捗写真を撮影</h1>
      <Card>
        <CardContent className="space-y-5">
          {previewUrl ? (
            <div className="space-y-3">
              <div className="aspect-[3/4] overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
              </div>
              <Button type="button" variant="secondary" onClick={() => setSelectedFile(null)}>
                撮り直す
              </Button>
            </div>
          ) : (
            <CameraCapture onCapture={setSelectedFile} disabled={submitting} />
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fallback">カメラが使えない場合（ファイルから選択）</Label>
            <input
              id="fallback"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>写真種別</Label>
              <div className="flex gap-2">
                {(["before", "after", "reference"] as PhotoType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPhotoType(t)}
                    className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm ${
                      photoType === t
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="caption">キャプション（任意）</Label>
              <input
                id="caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                autoComplete="off"
                inputMode="text"
                className="h-11 w-full rounded-lg border border-stone-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={submitting || !file}>
              アップロード
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
