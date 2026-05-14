"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { use } from "react";
import type { PhotoType } from "@/types/domain";

export default function NewPhotoPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>("before");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
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
      router.push(`/t/clients/${clientId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">進捗写真を撮影</h1>
      <Card>
        <CardContent>
          {/* TODO(phase-0): replace this with a real getUserMedia camera UI with
              distance/angle guide overlay (§4.2.1). For now we accept any file from
              the device camera or library. */}
          <div className="mb-4 grid place-items-center rounded-lg border-2 border-dashed border-brand-200 bg-brand-50 p-6 text-center text-xs text-brand-700">
            撮影ガイド（実装予定）: 距離マーク・角度ガイドラインをここに表示
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="file">写真</Label>
              <input
                id="file"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>写真種別</Label>
              <div className="flex gap-2">
                {(["before", "after", "reference"] as PhotoType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPhotoType(t)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
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
                className="h-10 w-full rounded-lg border border-stone-200 px-3 text-sm"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              アップロード
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
