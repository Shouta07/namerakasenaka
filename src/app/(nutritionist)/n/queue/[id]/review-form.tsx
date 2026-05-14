"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackReviewForm({
  id,
  defaultText,
}: {
  id: string;
  defaultText: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(defaultText);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setSubmitting(true);
    setError(null);
    try {
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
      router.push("/n/queue");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <Button onClick={approve} disabled={submitting}>
          承認して送信
        </Button>
      </div>
    </div>
  );
}
