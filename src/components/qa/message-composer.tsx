"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function MessageComposer({
  conversationId,
  onSent,
}: {
  conversationId: string;
  onSent?: () => void;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Autosize the textarea up to ~5 lines.
  function autosize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId, body }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "送信に失敗しました");
        return;
      }
      setBody("");
      if (taRef.current) taRef.current.style.height = "auto";
      onSent?.();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            autosize();
          }}
          rows={1}
          placeholder="メッセージを入力..."
          className="min-h-11 flex-1 resize-none rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !body.trim()}
          aria-label="送信"
          className={cn(
            "inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-white transition-colors",
            !body.trim() || sending
              ? "bg-stone-300"
              : "bg-brand-500 active:bg-brand-700",
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
