"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { FieldCxCustomer } from "@/lib/field-cx/fixtures";
import {
  addFollowNote,
  getFollowNotes,
  getLineSends,
  recordLineSend,
  removeFollowNote,
  removeLineSend,
  type StoredFollowNote,
  type StoredLineSend,
} from "@/lib/field-cx/store";

function fmt(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * LINE経過共有 + フォローメモ（クライアント永続化）。
 * 同意が無い顧客には送信ボタン自体を出さない — 同意ファーストの設計。
 */
export function CustomerActions({ customer }: { customer: FieldCxCustomer }) {
  const [sends, setSends] = useState<StoredLineSend[]>([]);
  const [notes, setNotes] = useState<StoredFollowNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    const sync = () => {
      setSends(getLineSends(customer.id));
      setNotes(getFollowNotes(customer.id));
    };
    sync();
    window.addEventListener("field-cx-store", sync);
    return () => window.removeEventListener("field-cx-store", sync);
  }, [customer.id]);

  function sendLine(label: string) {
    const send = recordLineSend(customer.id, label);
    toast.success(`${customer.name} 様の LINE に「${label}」を送信しました（デモ）`, {
      action: {
        label: "取り消す",
        onClick: () => {
          removeLineSend(send.id);
          toast("送信を取り消しました");
        },
      },
    });
  }

  function saveNote() {
    const body = noteInput.trim();
    if (!body) return;
    const note = addFollowNote(customer.id, body);
    setNoteInput("");
    toast.success("フォローメモを記録しました", {
      action: {
        label: "取り消す",
        onClick: () => {
          removeFollowNote(note.id);
          setNoteInput(body);
          toast("メモを取り消しました");
        },
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* LINE共有 */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-stone-900">💬 LINE経過共有</p>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
              customer.lineConsent
                ? "bg-emerald-50 text-emerald-700"
                : "bg-stone-100 text-stone-500",
            )}
          >
            {customer.lineConsent ? "✓ 共有に同意済み" : "未同意 — 送信不可"}
          </span>
        </div>
        {customer.lineConsent ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {["経過写真（before/after）", "検査結果のわかりやすい解説", "再検査・次回予約のご案内"].map(
                (label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => sendLine(label)}
                    className="min-h-11 rounded-full border border-brand-100 bg-brand-50 px-4 text-[12px] font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    {label} を送る
                  </button>
                ),
              )}
            </div>
            {sends.length > 0 ? (
              <ul className="mt-3 space-y-1 border-t border-stone-100 pt-2.5">
                {sends.slice(0, 5).map((s) => (
                  <li key={s.id} className="text-[12px] text-stone-500">
                    <span className="tabular-nums text-stone-400">{fmt(s.at)}</span>
                    　「{s.label}」を送信
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-[12.5px] leading-relaxed text-stone-500">
            ご本人の同意が記録されていないため、LINE送信はできません。同意はカウンセリング時に口頭＋チェックで取得し、いつでも取り消せることを伝えます。
          </p>
        )}
      </section>

      {/* フォローメモ */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <p className="text-[13px] font-bold text-stone-900">📝 フォローメモを追加</p>
        <div className="mt-2 flex gap-2">
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) saveNote();
            }}
            placeholder="気づき・次に話したいこと…"
            className="h-11 flex-1 rounded-xl border border-stone-200 px-3 text-[13px] focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={saveNote}
            disabled={!noteInput.trim()}
            className="min-h-11 rounded-xl bg-brand-700 px-4 text-[13px] font-bold text-white disabled:opacity-40"
          >
            記録
          </button>
        </div>
        {notes.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-stone-50 px-3 py-2 text-[12.5px] text-stone-700">
                <span className="mr-2 tabular-nums text-[11px] text-stone-400">
                  {fmt(n.at)}
                </span>
                {n.body}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
