"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_TYPE_LABEL, type MealType } from "@/types/domain";
import { isDemoMode } from "@/lib/demo";
import { demoClient } from "@/lib/demo/fixtures";
import { containsBannedWord, DISCLAIMER } from "@/lib/compliance/banned-words";
import {
  addStoredMealFeedback,
  addStoredMealLog,
  fileToResizedDataUrl,
  newId,
  updateStoredMealFeedback,
} from "@/lib/demo/store";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const AI_DRAFT_BY_TYPE: Record<MealType, string> = {
  breakfast:
    "タンパク質と食物繊維をバランスよく組み合わせた朝食ですね。一般的な栄養バランスの観点では、午前中の活動エネルギーを支える整った構成です。健康的な習慣作りをサポートする選択です。",
  lunch:
    "野菜とタンパク質を意識した昼食です。一般的な栄養バランスの観点では、午後の集中力を保ちやすい構成と言えます。健康的な習慣作りに役立つ選び方ですね。",
  dinner:
    "和食を中心とした夕食で、一般的な栄養バランスの観点では落ち着いた構成です。塩分が気になる場合は、出汁を効かせると満足感を保ちやすくなります。",
  snack:
    "間食として、糖質や脂質に配慮された選択です。一般的な栄養バランスの観点では、無理のない量で続けやすい習慣ですね。",
};

function buildAiDraft(mealType: MealType): string {
  return AI_DRAFT_BY_TYPE[mealType];
}

export default function NewMealLogPage() {
  const router = useRouter();
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = isDemoMode();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (demo) {
        // Banned-word check on memo.
        if (memo) {
          const check = containsBannedWord(memo);
          if (!check.ok) {
            setError(`NGワードが含まれています: ${check.hits.join(", ")}`);
            toast.error("メモにNGワードが含まれています");
            return;
          }
        }
        const photoUrl = photo
          ? await fileToResizedDataUrl(photo, 900, 0.8)
          : `https://picsum.photos/seed/meal-${Date.now()}/700/500`;
        const log = addStoredMealLog({
          clientId: demoClient.id,
          mealType,
          memo: memo || "（メモなし）",
          photoUrl,
          loggedAt: new Date().toISOString(),
        });

        // Create initial "AI 下書き中…" feedback.
        const feedbackId = newId();
        addStoredMealFeedback({
          id: feedbackId,
          mealLogId: log.id,
          status: "ai_drafting",
          aiDraft: "",
          finalText: null,
          monitorName: null,
          licenseNumber: null,
          approvedAt: null,
          rejectReason: null,
        });
        // After 1.5s, transition to awaiting_review with a sanitized AI draft.
        setTimeout(() => {
          const draft = buildAiDraft(mealType);
          updateStoredMealFeedback(feedbackId, {
            status: "awaiting_review",
            aiDraft: draft,
            finalText: `${draft}\n\n— ${DISCLAIMER}`,
          });
        }, 1500);
        toast.success("食事を記録しました");
        router.push("/c/meals");
        return;
      }

      const res = await fetch("/api/meal-logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mealType, memo }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "保存に失敗しました");
        return;
      }
      toast.success("食事を記録しました");
      router.push("/c/meals");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">食事を記録</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Card>
          <CardContent>
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block text-base">区分</Label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      aria-pressed={mealType === t}
                      className={`flex min-h-11 items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium ${
                        mealType === t
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-stone-200 bg-white text-stone-700"
                      }`}
                    >
                      {MEAL_TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="photo" className="text-base">写真</Label>
                <label
                  htmlFor="photo"
                  className="flex min-h-32 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-600 active:bg-stone-100"
                >
                  <Camera className="h-5 w-5 text-stone-500" />
                  {photo ? photo.name : "タップして撮影 / 選択"}
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="memo" className="text-base">メモ</Label>
                <Textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例: 玄米と焼き魚、味噌汁、サラダ"
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </CardContent>
        </Card>
        <StickyActionBar>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "送信中…" : "送信"}
          </Button>
        </StickyActionBar>
      </form>
    </div>
  );
}
