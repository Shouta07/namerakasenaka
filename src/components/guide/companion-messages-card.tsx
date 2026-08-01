"use client";

import { useEffect } from "react";
import { markStoredGuideMessageRead } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/demo";
import { demoOrganization } from "@/lib/demo/fixtures";
import { relativeTimeJa } from "@/lib/demo/time";
import type { GuideMessageRecord } from "@/lib/guide/source";
import { Eyebrow, SoftCard } from "./guide-content";

/**
 * /share/[token] と /c/guide の両方で、サロンからのお返事を表示する。
 * 「あなたは一人ではない」を伝える伴走ループの顧客側エンドポイント。
 *
 * - 新着順、チャットバブル風。pale-green の SoftCard。
 * - respondingToCheckDate が付いていれば「{M月D日}のメモへのお返事」を上に小さく。
 * - マウント時に未読を既読化（demo: store、prod: token を渡して API を叩く）。
 * - 空の状態はやさしいメッセージ — 沈黙でも責められないコピー。
 */
export const COMPANION_MESSAGES_ANCHOR_ID = "companion-messages";

export function CompanionMessagesCard({
  messages,
  /** /share/[token] からの呼び出しのみ渡される — prod API の認証に使う。 */
  shareToken,
}: {
  messages: GuideMessageRecord[];
  shareToken?: string;
}) {
  const demo = isDemoMode();

  useEffect(() => {
    const unread = messages.filter((m) => m.readAt === null);
    if (unread.length === 0) return;
    if (demo) {
      for (const m of unread) markStoredGuideMessageRead(m.id);
      return;
    }
    if (!shareToken) return;
    // Fire-and-forget — keep the UI quiet on transient errors.
    for (const m of unread) {
      void fetch("/api/guide/messages/read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: shareToken, messageId: m.id }),
      }).catch(() => undefined);
    }
  }, [messages, demo, shareToken]);

  return (
    <SoftCard id={COMPANION_MESSAGES_ANCHOR_ID}>
      <Eyebrow>サロンからのお返事</Eyebrow>
      {messages.length === 0 ? (
        <p className="text-base leading-relaxed text-stone-600">
          サロンからのメッセージはまだありません。次回までゆっくりで大丈夫です。
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="space-y-1">
              {m.respondingToCheckDate ? (
                <p className="text-xs text-stone-400">
                  {formatRespondsTo(m.respondingToCheckDate)}のメモへのお返事
                </p>
              ) : null}
              <div
                className={
                  "rounded-2xl bg-[#eaf3ea] px-4 py-3 shadow-sm ring-1 " +
                  (m.readAt === null ? "ring-[#7da589]" : "ring-[#dce8dc]")
                }
              >
                <p className="text-base leading-relaxed text-stone-700">{m.body}</p>
                <p className="mt-2 text-right text-xs text-[#587f63]">
                  {relativeTimeJa(m.createdAt)} ・ {demoOrganization.shortName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SoftCard>
  );
}

function formatRespondsTo(date: string): string {
  // date is YYYY-MM-DD; render as M月D日 in Japanese.
  const [, m, d] = date.split("-");
  const month = Number(m);
  const day = Number(d);
  if (!month || !day) return date;
  return `${month}月${day}日`;
}
