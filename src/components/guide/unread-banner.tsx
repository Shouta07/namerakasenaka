"use client";

import Link from "next/link";
import { MessageCircleHeart } from "lucide-react";
import {
  useGuideCustomerByClientId,
  useGuideMessagesFor,
} from "@/lib/guide/source";
import { COMPANION_MESSAGES_ANCHOR_ID } from "./companion-messages-card";

/**
 * /c/progress に出す、未読のサロンメッセージ通知バナー。
 *
 * 未読が 0 件のときは何も描かない（沈黙が標準）。
 * クリックで /c/guide#companion-messages へジャンプ — そこで自動既読化される。
 */
export function UnreadCompanionBanner({ clientId }: { clientId: string }) {
  const customer = useGuideCustomerByClientId(clientId);
  const messages = useGuideMessagesFor(customer?.id ?? null);
  const unread = messages.filter((m) => m.readAt === null).length;

  if (unread === 0) return null;

  return (
    <Link
      href={`/c/guide#${COMPANION_MESSAGES_ANCHOR_ID}`}
      className="flex items-center gap-3 rounded-2xl border-2 border-[#cfe3cf] bg-gradient-to-r from-[#f3f8f3] to-white p-4 shadow-sm transition hover:shadow-md"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#eaf3ea]">
        <MessageCircleHeart className="h-5 w-5 text-[#587f63]" aria-hidden />
      </span>
      <span className="flex-1 text-sm font-medium leading-snug text-stone-800">
        サロンから新しいお返事が届いています
        {unread > 1 ? (
          <span className="ml-1.5 text-xs text-stone-500">（{unread}件）</span>
        ) : null}
      </span>
      <span aria-hidden className="flex-none text-base text-[#587f63]">
        →
      </span>
    </Link>
  );
}
