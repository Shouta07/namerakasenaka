"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import {
  addStoredMessage,
  useStoredMessages,
  type StoredMessage,
} from "@/lib/demo/store";
import { ThreadView, type ThreadMessage } from "@/components/qa/thread-view";
import { cn } from "@/lib/utils/cn";

export type SeedMessage = ThreadMessage;

export function InteractiveQaThread({
  conversationId,
  seed,
  viewerLabel = "あなた",
}: {
  conversationId: string;
  seed: SeedMessage[];
  viewerLabel?: string;
}) {
  const stored = useStoredMessages(conversationId);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = useMemo<ThreadMessage[]>(() => {
    const fromStore: ThreadMessage[] = stored.map((m: StoredMessage) => ({
      id: m.id,
      body: m.body,
      imageUrl: null,
      createdAt: m.createdAt,
      isMine: m.isMine,
      isAutoReply: m.isAutoReply,
    }));
    return [...seed, ...fromStore].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }, [seed, stored]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function autosize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }

  function isAfterHours(): boolean {
    const hour = new Date().getHours();
    return hour < 10 || hour >= 19;
  }

  function send() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    const check = containsBannedWord(trimmed);
    if (!check.ok) {
      toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
      return;
    }
    setSending(true);
    try {
      addStoredMessage({
        conversationId,
        body: trimmed,
        isMine: true,
        isAutoReply: false,
      });
      setBody("");
      if (taRef.current) taRef.current.style.height = "auto";

      // Auto-reply outside business hours.
      if (isAfterHours()) {
        setTimeout(() => {
          addStoredMessage({
            conversationId,
            body: "次の営業日にお返事します。お問い合わせありがとうございます。",
            isMine: false,
            isAutoReply: true,
          });
        }, 800);
      }
      toast.success("送信しました");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-2 pr-1 md:mt-4">
        <ThreadView messages={messages} />
        <div ref={endRef} aria-hidden />
      </div>
      <div
        className="sticky -mx-4 mt-3 border-t border-stone-200 bg-white/95 px-4 pt-2 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0"
        style={{
          bottom: "calc(64px + max(var(--safe-bottom), 0px))",
          paddingBottom: "max(var(--safe-bottom), 8px)",
        }}
      >
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
              placeholder={`${viewerLabel}としてメッセージを入力...`}
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
        </div>
      </div>
    </>
  );
}
