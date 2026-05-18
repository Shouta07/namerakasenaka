"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isDemoMode } from "@/lib/demo";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import { addStoredSalonComment } from "@/lib/demo/store";

export function CommentComposer({
  mealLogId,
  authorRole = "therapist",
  authorName = "サロン担当者",
}: {
  mealLogId: string;
  authorRole?: "therapist" | "salon_admin";
  authorName?: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const demo = isDemoMode();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const trimmed = body.trim();
      if (demo) {
        const check = containsBannedWord(trimmed);
        if (!check.ok) {
          toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
          return;
        }
        addStoredSalonComment({
          mealLogId,
          authorRole,
          authorName,
          body: trimmed,
        });
        setBody("");
        toast.success("コメントを送信しました");
        return;
      }
      const res = await fetch(`/api/meal-logs/${mealLogId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          hits?: string[];
        };
        if (j.error === "banned_words" && j.hits?.length) {
          toast.error(`NGワードが含まれています: ${j.hits.join(", ")}`);
        } else {
          toast.error(j.error ?? "送信に失敗しました");
        }
        return;
      }
      setBody("");
      toast.success("コメントを送信しました");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="サロンからのコメントを入力（薬機法に注意）"
        rows={2}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
          送信
        </Button>
      </div>
    </form>
  );
}
