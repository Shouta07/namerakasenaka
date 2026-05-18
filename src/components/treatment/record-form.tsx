"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBrowserSupabase } from "@/lib/supabase/client";

export type RecordFormDefaults = {
  treatmentType?: string;
  productsUsed?: string;
  nextPlan?: string;
};

export function RecordForm({
  clientId,
  appointmentId,
  defaults,
}: {
  clientId: string;
  appointmentId: string;
  defaults?: RecordFormDefaults;
}) {
  const router = useRouter();
  const [treatmentType, setTreatmentType] = useState(defaults?.treatmentType ?? "");
  const [productsUsed, setProductsUsed] = useState(defaults?.productsUsed ?? "");
  const [skinFindings, setSkinFindings] = useState("");
  const [nextPlan, setNextPlan] = useState(defaults?.nextPlan ?? "");
  const [cautions, setCautions] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const { data: u } = await supabase.auth.getUser();
      const { data: therapist } = await supabase
        .from("therapists")
        .select("id")
        .eq("user_id", u.user?.id ?? "")
        .maybeSingle();
      if (!therapist) {
        setError("セラピストレコードが見つかりません");
        return;
      }
      const { data: inserted, error: insertError } = await supabase
        .from("treatment_records")
        .insert({
          appointment_id: appointmentId,
          client_id: clientId,
          therapist_id: (therapist as { id: string }).id,
          treatment_type: treatmentType,
          products_used: productsUsed || null,
          skin_findings: skinFindings || null,
          next_plan: nextPlan || null,
          cautions: cautions || null,
        })
        .select("id")
        .single();
      if (insertError) {
        setError(insertError.message);
        return;
      }
      const recordId = (inserted as { id: string } | null)?.id ?? null;

      if (videoFile && recordId) {
        const form = new FormData();
        form.append("clientId", clientId);
        form.append("treatmentRecordId", recordId);
        form.append("file", videoFile);
        const res = await fetch("/api/videos/upload", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          toast.error(`動画アップロード失敗: ${j.error ?? "unknown"}`);
        } else {
          toast.success("施術記録と動画を保存しました");
        }
      } else {
        toast.success("施術記録を保存しました");
      }

      router.push(`/t/clients/${clientId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="treatmentType">施術内容（必須）</Label>
        <Input
          id="treatmentType"
          required
          value={treatmentType}
          onChange={(e) => setTreatmentType(e.target.value)}
          placeholder="例: 背中ケアコース 2回目"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="productsUsed">使用製品</Label>
        <Input
          id="productsUsed"
          value={productsUsed}
          onChange={(e) => setProductsUsed(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="skinFindings">肌コンディション所見</Label>
        <Textarea
          id="skinFindings"
          value={skinFindings}
          onChange={(e) => setSkinFindings(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="nextPlan">次回プラン</Label>
        <Input
          id="nextPlan"
          value={nextPlan}
          onChange={(e) => setNextPlan(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cautions">注意事項</Label>
        <Textarea
          id="cautions"
          value={cautions}
          onChange={(e) => setCautions(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="video">動画（任意、MP4/MOV/WebM・最大300MB）</Label>
        <input
          id="video"
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
        {videoFile ? (
          <p className="text-xs text-stone-500">
            {videoFile.name}（{Math.round(videoFile.size / 1024 / 1024)}MB）
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        記録を保存
      </Button>
    </form>
  );
}
