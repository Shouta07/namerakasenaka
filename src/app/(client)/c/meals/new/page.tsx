"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_TYPE_LABEL, type MealType } from "@/types/domain";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function NewMealLogPage() {
  const router = useRouter();
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
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
      router.push("/c/meals");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">食事を記録</h1>
      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <Label className="mb-2 block">区分</Label>
              <div className="flex gap-2">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMealType(t)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
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
              <Label htmlFor="memo">メモ</Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例: 玄米と焼き魚、味噌汁、サラダ"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              送信
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
