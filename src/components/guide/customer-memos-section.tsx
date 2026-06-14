"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  useDailyChecksFor,
  useGuideMessagesFor,
} from "@/lib/guide/source";
import {
  addStoredGuideMessage,
  type GuideMessage,
} from "@/lib/demo/store";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import { isDemoMode } from "@/lib/demo";
import { relativeTimeJa } from "@/lib/demo/time";
import type { DailyCheckRecord } from "@/lib/guide/source";

const MAX_REPLY_LEN = 200;

/**
 * /admin/customers/[id] 用の「お客さまの気づきメモ」+ 伴走返信セクション。
 *
 * - 直近14日のうち memo が入っているチェックを新着順で並べる。
 * - 各行にインライン「ひとこと返信」コンポーザ（banned-word filter + sonner）。
 * - 自由形式「メッセージを送る」コンポーザを上に。
 * - これまでに送ったお返事を thin list で 5件まで。
 */
export function CustomerMemosSection({ guideCustomerId }: { guideCustomerId: string }) {
  const checks = useDailyChecksFor(guideCustomerId);
  const messages = useGuideMessagesFor(guideCustomerId);

  // Last 14 days, memo non-empty, newest first.
  const today = new Date();
  const cutoffMs = today.getTime() - 14 * 24 * 60 * 60 * 1000;
  const memoChecks = checks
    .filter((c) => c.memo && c.memo.trim().length > 0)
    .filter((c) => new Date(c.date + "T00:00:00").getTime() >= cutoffMs)
    .sort((a, b) => b.date.localeCompare(a.date));

  const recentSent = messages.slice(0, 5);

  return (
    <Card>
      <CardContent className="space-y-4">
        <header>
          <h2 className="text-sm font-semibold text-stone-900">お客さまの気づきメモ</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
            直近2週間に届いた、お客さまからのひとことです。返信は §8.2 + §17 の禁止表現を自動でチェックします。
          </p>
        </header>

        {/* 自由形式コンポーザ */}
        <FreeFormComposer guideCustomerId={guideCustomerId} />

        {/* メモごとの返信 */}
        {memoChecks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 px-3 py-4 text-center text-xs text-stone-500">
            まだ気づきメモは届いていません。
          </p>
        ) : (
          <ul className="space-y-3">
            {memoChecks.map((c) => (
              <MemoRow
                key={c.id}
                check={c}
                guideCustomerId={guideCustomerId}
                hasReplied={messages.some(
                  (m) => m.respondingToCheckDate === c.date,
                )}
              />
            ))}
          </ul>
        )}

        {/* これまでに送ったお返事 */}
        {recentSent.length > 0 ? (
          <section className="space-y-2 border-t border-stone-100 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
              これまでに送ったお返事
            </p>
            <ul className="space-y-1.5">
              {recentSent.map((m) => (
                <li key={m.id} className="text-xs text-stone-600">
                  <span className="text-stone-400">
                    {relativeTimeJa(m.createdAt)}
                    {m.respondingToCheckDate
                      ? ` ・ ${formatJaDate(m.respondingToCheckDate)}のメモへ`
                      : ""}
                    {m.readAt === null ? " ・ 未読" : ""}
                  </span>
                  <span className="ml-2">{m.body}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MemoRow({
  check,
  guideCustomerId,
  hasReplied,
}: {
  check: DailyCheckRecord;
  guideCustomerId: string;
  hasReplied: boolean;
}) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
        <span>{formatJaDate(check.date)}</span>
        <span className="flex items-center gap-2">
          <ActionBadge done={check.actionDone} />
          <ConditionIcons
            skin={check.skinCondition}
            body={check.bodyCondition}
          />
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{check.memo}</p>
      {hasReplied ? (
        <p className="mt-2 text-[11px] text-[#587f63]">返信済み</p>
      ) : null}
      <ReplyComposer
        guideCustomerId={guideCustomerId}
        respondingToCheckDate={check.date}
      />
    </li>
  );
}

function ActionBadge({ done }: { done: boolean }) {
  return (
    <span
      className={
        "rounded-full px-1.5 py-0.5 text-[10px] font-medium " +
        (done
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-500")
      }
    >
      {done ? "実践" : "おやすみ"}
    </span>
  );
}

function ConditionIcons({
  skin,
  body,
}: {
  skin: number | null;
  body: number | null;
}) {
  return (
    <span className="text-[10px] text-stone-500">
      肌 {faceFor(skin)} ・ からだ {faceFor(body)}
    </span>
  );
}

function faceFor(score: number | null): string {
  if (score == null) return "—";
  if (score >= 5) return "◎";
  if (score >= 4) return "○";
  if (score >= 3) return "△";
  if (score >= 2) return "▽";
  return "×";
}

function FreeFormComposer({ guideCustomerId }: { guideCustomerId: string }) {
  return (
    <ComposerBase
      label="メッセージを送る"
      placeholder="自由に一言（例：今週もよく続いていますね）"
      onSend={(body) =>
        sendCompanionMessage({
          guideCustomerId,
          body,
          respondingToCheckDate: null,
        })
      }
    />
  );
}

function ReplyComposer({
  guideCustomerId,
  respondingToCheckDate,
}: {
  guideCustomerId: string;
  respondingToCheckDate: string;
}) {
  return (
    <ComposerBase
      compact
      label="ひとこと返信"
      placeholder="やさしいひとことを…"
      onSend={(body) =>
        sendCompanionMessage({
          guideCustomerId,
          body,
          respondingToCheckDate,
        })
      }
    />
  );
}

function ComposerBase({
  label,
  placeholder,
  compact = false,
  onSend,
}: {
  label: string;
  placeholder: string;
  compact?: boolean;
  onSend: (body: string) => Promise<boolean>;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const ok = await onSend(trimmed);
      if (ok) {
        setBody("");
        toast.success("お返事を送りました");
      }
    } finally {
      setSending(false);
    }
  }

  const remaining = MAX_REPLY_LEN - body.length;

  return (
    <form onSubmit={submit} className={compact ? "mt-2 space-y-1.5" : "space-y-2"}>
      {!compact ? (
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}
        </label>
      ) : null}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, MAX_REPLY_LEN))}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-stone-400">残り {remaining}文字</span>
        <Button
          type="submit"
          size="sm"
          disabled={sending || body.trim().length === 0}
        >
          <Send className="h-3.5 w-3.5" />
          送信
        </Button>
      </div>
    </form>
  );
}

/**
 * Demo: writes to localStorage. Prod: POST to /api/guide/messages.
 * Returns true on success so the composer can clear; false on filter hit.
 */
async function sendCompanionMessage(input: {
  guideCustomerId: string;
  body: string;
  respondingToCheckDate: string | null;
}): Promise<boolean> {
  const check = containsBannedWord(input.body);
  if (!check.ok) {
    toast.error(`NGワードが含まれています: ${check.hits.join(", ")}`);
    return false;
  }
  if (isDemoMode()) {
    const next: Omit<GuideMessage, "id" | "createdAt" | "readAt"> = {
      guideCustomerId: input.guideCustomerId,
      direction: "salon_to_customer",
      body: input.body,
      respondingToCheckDate: input.respondingToCheckDate,
    };
    addStoredGuideMessage(next);
    return true;
  }
  const res = await fetch("/api/guide/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as {
      error?: string;
      hits?: string[];
    };
    if (j.error === "banned_word" && j.hits) {
      toast.error(`NGワードが含まれています: ${j.hits.join(", ")}`);
    } else {
      toast.error("送信できませんでした。もう一度お試しください。");
    }
    return false;
  }
  return true;
}

function formatJaDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}月${Number(d)}日`;
}
