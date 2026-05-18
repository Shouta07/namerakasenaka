"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import {
  containsBannedWord,
  DISCLAIMER,
} from "@/lib/compliance/banned-words";
import {
  addStoredMealFeedback,
  updateStoredMealFeedback,
  readStoredSnapshotClient,
} from "@/lib/demo/store";

const DEFAULT_MONITOR = "栄養士 木村 沙織";
const DEFAULT_LICENSE = "管理栄養士 第123456号";

export function FeedbackReviewForm({
  id,
  defaultText,
  demo = false,
}: {
  id: string;
  defaultText: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState(defaultText);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function ensureDisclaimer(s: string): string {
    return s.includes(DISCLAIMER) ? s : `${s.trimEnd()}\n\n— ${DISCLAIMER}`;
  }

  async function approve(edited: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const finalText = ensureDisclaimer(text);
      const check = containsBannedWord(finalText);
      if (!check.ok) {
        setError(`NGワードが含まれています: ${check.hits.join(", ")}`);
        toast.error("NGワードが含まれています");
        return;
      }
      if (demo) {
        // Find existing feedback or upsert one with this id.
        const snap = readStoredSnapshotClient();
        const existing = snap?.mealFeedbacks.find((f) => f.id === id);
        if (existing) {
          updateStoredMealFeedback(id, {
            status: "approved",
            finalText,
            monitorName: DEFAULT_MONITOR,
            licenseNumber: DEFAULT_LICENSE,
            approvedAt: new Date().toISOString(),
          });
        } else {
          addStoredMealFeedback({
            id,
            mealLogId: id,
            status: "approved",
            aiDraft: defaultText,
            finalText,
            monitorName: DEFAULT_MONITOR,
            licenseNumber: DEFAULT_LICENSE,
            approvedAt: new Date().toISOString(),
            rejectReason: null,
          });
        }
        toast.success(edited ? "編集して承認しました" : "承認しました");
        router.push("/n/queue");
        return;
      }
      const res = await fetch(`/api/meal-feedbacks/${id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ finalText: text }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string; hits?: string[] };
        setError(
          j.hits && j.hits.length > 0
            ? `禁止語が含まれています: ${j.hits.join(", ")}`
            : j.error ?? "承認に失敗しました",
        );
        return;
      }
      toast.success("承認しました");
      router.push("/n/queue");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function reject() {
    if (!demo) {
      toast.error("差戻し機能は本番接続後にご利用いただけます");
      return;
    }
    const reason = window.prompt("差戻し理由を入力してください") ?? "";
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const snap = readStoredSnapshotClient();
      const existing = snap?.mealFeedbacks.find((f) => f.id === id);
      if (existing) {
        updateStoredMealFeedback(id, {
          status: "rejected",
          rejectReason: reason,
        });
      } else {
        addStoredMealFeedback({
          id,
          mealLogId: id,
          status: "rejected",
          aiDraft: defaultText,
          finalText: null,
          monitorName: DEFAULT_MONITOR,
          licenseNumber: DEFAULT_LICENSE,
          approvedAt: null,
          rejectReason: reason,
        });
      }
      toast.success("差し戻しました");
      router.push("/n/queue");
    } finally {
      setSubmitting(false);
    }
  }

  const edited = text.trim() !== defaultText.trim();

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[240px]"
      />
      <p className="text-[11px] text-stone-500">
        承認時、定型免責文が自動付与されます。
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <StickyActionBar>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => approve(edited)}
            disabled={submitting}
            size="lg"
            className="flex-1"
          >
            {submitting ? "送信中…" : edited ? "編集して承認" : "そのまま承認"}
          </Button>
          {demo ? (
            <Button
              type="button"
              variant="secondary"
              onClick={reject}
              disabled={submitting}
              size="lg"
              className="flex-1"
            >
              差戻し
            </Button>
          ) : null}
        </div>
      </StickyActionBar>
    </div>
  );
}
