"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import { isDemoMode } from "@/lib/demo";
import {
  addStoredSalonNote,
  useStoredSalonNotes,
  type SalonNoteTargetType,
} from "@/lib/demo/store";

export type SalonNoteComposerProps = {
  clientId: string;
  targetType: SalonNoteTargetType;
  targetId: string;
  authorRole?: "therapist" | "salon_admin";
  authorName?: string;
  /** Compact heading shown above the list, e.g. "サロンメモ". */
  heading?: string;
  /** Hide the heading text — useful when embedded inside a parent that already has a label. */
  hideHeading?: boolean;
};

/**
 * Generic inline composer for salon-side notes against any client artifact:
 * photos, self-logs, treatment records, meal logs, Q&A threads.
 *
 * - Lists existing notes above the composer.
 * - Banned-word filter runs before submission (§8.2).
 * - In demo mode, writes to localStorage via `addStoredSalonNote`.
 * - In production, POSTs to `/api/clients/[clientId]/notes`.
 */
export function SalonNoteComposer({
  clientId,
  targetType,
  targetId,
  authorRole = "salon_admin",
  authorName = "サロン担当者",
  heading = "サロンメモ",
  hideHeading = false,
}: SalonNoteComposerProps) {
  const notes = useStoredSalonNotes(targetType, targetId);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const demo = isDemoMode();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const check = containsBannedWord(trimmed);
      if (!check.ok) {
        toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
        return;
      }
      if (demo) {
        addStoredSalonNote({
          clientId,
          targetType,
          targetId,
          authorRole,
          authorName,
          body: trimmed,
        });
        setBody("");
        toast.success("サロンメモを保存しました");
        return;
      }
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType, targetId, body: trimmed }),
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
      toast.success("サロンメモを保存しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
      {!hideHeading ? (
        <p className="text-xs font-semibold text-stone-500">{heading}</p>
      ) : null}
      {notes.length > 0 ? (
        <ul className="space-y-2">
          {notes
            .slice()
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((n) => (
              <li
                key={n.id}
                className="rounded-md bg-brand-50/60 px-3 py-2 text-xs"
              >
                <p className="font-medium text-stone-700">
                  {n.authorRole === "therapist" ? "セラピスト" : "サロン管理者"}
                  <span className="ml-2 text-stone-400">
                    {new Date(n.createdAt).toLocaleString("ja-JP")}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-stone-700">{n.body}</p>
              </li>
            ))}
        </ul>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="サロン内部メモを入力（薬機法に注意）"
          rows={2}
          inputMode="text"
          autoComplete="off"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !body.trim()}
          >
            投稿
          </Button>
        </div>
      </form>
    </div>
  );
}
