"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DailyCheckRecord } from "@/lib/guide/source";
import type { DailyCheckActionLevel } from "@/lib/demo/store";
import { computeCheckStats, MILESTONE_DAYS } from "@/lib/guide/milestones";
import { cn } from "@/lib/utils/cn";

const MILESTONE_STREAKS = new Set<number>(Object.values(MILESTONE_DAYS));

const ACTION_OPTIONS: { value: DailyCheckActionLevel; label: string; done: boolean }[] = [
  { value: "yes", label: "はい", done: true },
  { value: "mostly", label: "だいたい", done: true },
  { value: "rest", label: "今日はおやすみ", done: false },
];

const FACES = ["😣", "😕", "😐", "🙂", "😊"] as const;

export type DailyCheckSubmit = {
  date: string;
  actionDone: boolean;
  actionLevel: DailyCheckActionLevel;
  skinCondition: number | null;
  bodyCondition: number | null;
  memo: string | null;
};

export function DailyCheckCard({
  today,
  existing,
  checks = [],
  onSubmit,
}: {
  /** YYYY-MM-DD for today's check. */
  today: string;
  /** Today's already-recorded check, if any. */
  existing: DailyCheckRecord | null;
  /** Full check history — マイルストーン到達のお祝いトースト判定に使う。 */
  checks?: DailyCheckRecord[];
  /** Persists the check (demo store or API). Resolves when saved. */
  onSubmit: (input: DailyCheckSubmit) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<DailyCheckActionLevel | null>(null);
  const [skin, setSkin] = useState<number | null>(null);
  const [body, setBody] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Pre-fill the form from the recorded state when entering edit mode.
  useEffect(() => {
    if (editing && existing) {
      setAction(existing.actionLevel ?? (existing.actionDone ? "yes" : "rest"));
      setSkin(existing.skinCondition);
      setBody(existing.bodyCondition);
      setMemo(existing.memo ?? "");
    }
  }, [editing, existing]);

  async function handleSubmit() {
    if (!action) return;
    const actionDone = ACTION_OPTIONS.find((o) => o.value === action)?.done ?? false;
    const wasAlreadyRecorded = existing != null;
    setSaving(true);
    try {
      await onSubmit({
        date: today,
        actionDone,
        actionLevel: action,
        skinCondition: skin,
        bodyCondition: body,
        memo: memo.trim() || null,
      });
      setJustSaved(true);
      setEditing(false);

      // 達成と祝福: 今日の記録で連続日数が 3/7/14/28 に到達したら特別トースト。
      // 修正（既存記録の上書き）では連続日数が変わらないので鳴らさない。
      if (!wasAlreadyRecorded) {
        const merged = checks
          .filter((c) => c.date !== today)
          .map((c) => ({ date: c.date, actionDone: c.actionDone }));
        merged.push({ date: today, actionDone });
        const { currentStreak } = computeCheckStats(merged);
        if (MILESTONE_STREAKS.has(currentStreak)) {
          toast.success(`🌱 ${currentStreak}日連続で記録できました！`, {
            duration: 6000,
          });
        }
      }
    } finally {
      setSaving(false);
    }
  }

  // Recorded state — gentle confirmation + edit affordance.
  if (existing && !editing) {
    const level = existing.actionLevel ?? (existing.actionDone ? "yes" : "rest");
    const levelLabel = ACTION_OPTIONS.find((o) => o.value === level)?.label ?? "—";
    return (
      <div className="space-y-3">
        {justSaved ? (
          <p className="rounded-2xl bg-[#eaf3ea] px-4 py-3 text-base font-medium text-[#3c6347]">
            今日も記録できました 🌱
          </p>
        ) : (
          <p className="text-base text-[#3c6347]">今日の分は記録済みです 🌱</p>
        )}
        <div className="space-y-1.5 rounded-2xl bg-[#f6f9f6] px-4 py-3 text-base leading-relaxed text-stone-700">
          <p>
            アクション：<span className="font-medium">{levelLabel}</span>
          </p>
          <p>
            肌の調子：
            <span className="font-medium">
              {existing.skinCondition != null ? FACES[existing.skinCondition - 1] : "—"}
            </span>
            　体調：
            <span className="font-medium">
              {existing.bodyCondition != null ? FACES[existing.bodyCondition - 1] : "—"}
            </span>
          </p>
          {existing.memo ? <p className="text-sm text-stone-500">「{existing.memo}」</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-[#587f63] underline underline-offset-2"
        >
          今日の記録を直す
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-base font-medium text-stone-800">今日のアクション、できましたか？</p>
        <div className="flex flex-wrap gap-2">
          {ACTION_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setAction(o.value)}
              className={cn(
                "min-h-[44px] rounded-full border px-4 text-base transition-colors",
                action === o.value
                  ? "border-[#7da589] bg-[#eaf3ea] font-medium text-[#3c6347]"
                  : "border-stone-200 bg-white text-stone-600",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <FaceScale label="肌の調子" value={skin} onChange={setSkin} />
      <FaceScale label="体調" value={body} onChange={setBody} />

      <div className="space-y-2">
        <p className="text-base font-medium text-stone-800">
          ひとことメモ <span className="text-sm font-normal text-stone-400">（任意）</span>
        </p>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="気づいたことがあれば、ひとことだけでも"
          className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-base leading-relaxed focus:border-[#7da589] focus:outline-none focus:ring-2 focus:ring-[#cfe3cf]"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!action || saving}
        className={cn(
          "h-14 w-full rounded-2xl text-base font-semibold text-white transition-colors",
          !action || saving ? "bg-[#a9c4b1]" : "bg-[#5d8a6c] hover:bg-[#4f7a5e]",
        )}
      >
        {saving ? "記録しています…" : "今日の分を記録する"}
      </button>
      {editing ? (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="w-full text-center text-sm text-stone-400 underline underline-offset-2"
        >
          直さずに戻る
        </button>
      ) : null}
      <p className="text-center text-sm text-stone-400">
        おやすみの日があっても大丈夫。記録するだけで十分です。
      </p>
    </div>
  );
}

function FaceScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-base font-medium text-stone-800">{label}</p>
      <div className="flex gap-2">
        {FACES.map((face, i) => {
          const score = i + 1;
          return (
            <button
              key={score}
              type="button"
              aria-label={`${label} ${score}/5`}
              onClick={() => onChange(score)}
              className={cn(
                "flex h-12 flex-1 items-center justify-center rounded-2xl border text-2xl transition-colors",
                value === score
                  ? "border-[#7da589] bg-[#eaf3ea]"
                  : "border-stone-200 bg-white opacity-70",
              )}
            >
              {face}
            </button>
          );
        })}
      </div>
    </div>
  );
}
