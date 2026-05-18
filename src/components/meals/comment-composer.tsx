"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentComposer({ mealLogId }: { mealLogId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/meal-logs/${mealLogId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
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
