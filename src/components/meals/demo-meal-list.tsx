"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEAL_TYPE_LABEL } from "@/types/domain";
import { demoClient, demoMealLogs } from "@/lib/demo/fixtures";
import {
  useStoredMealFeedbacks,
  useStoredMealLogs,
  useStoredSalonComments,
  type StoredMealFeedback,
  type StoredMealLog,
  type StoredSalonComment,
} from "@/lib/demo/store";

type FixtureMeal = (typeof demoMealLogs)[number];

type MergedMeal = {
  id: string;
  loggedAt: string;
  mealType: FixtureMeal["mealType"];
  memo: string;
  photoUrl: string | null;
  feedback: {
    status: string;
    finalText: string | null;
    aiDraft: string | null;
    nutritionistName: string | null;
    licenseNumber: string | null;
  };
};

export function DemoMealList() {
  const stored = useStoredMealLogs(demoClient.id);
  const feedbacks = useStoredMealFeedbacks();

  const merged = useMemo<MergedMeal[]>(() => {
    const fixtureItems: MergedMeal[] = demoMealLogs
      .filter((m) => m.clientId === demoClient.id)
      .map((m) => ({
      id: m.id,
      loggedAt: m.loggedAt,
      mealType: m.mealType,
      memo: m.memo,
      photoUrl: m.photoUrl,
      feedback: {
        status: m.feedback.status,
        finalText: m.feedback.approvedText,
        aiDraft: m.feedback.aiDraft,
        nutritionistName: m.feedback.nutritionistName,
        licenseNumber: m.feedback.nutritionistLicenseNumber,
      },
    }));
    const storedItems: MergedMeal[] = stored.map((m: StoredMealLog) => {
      const fb = feedbacks.find((f: StoredMealFeedback) => f.mealLogId === m.id);
      return {
        id: m.id,
        loggedAt: m.loggedAt,
        mealType: m.mealType,
        memo: m.memo,
        photoUrl: m.photoUrl,
        feedback: {
          status: fb?.status ?? "ai_drafting",
          finalText: fb?.finalText ?? null,
          aiDraft: fb?.aiDraft ?? null,
          nutritionistName: fb?.monitorName ?? null,
          licenseNumber: fb?.licenseNumber ?? null,
        },
      };
    });
    return [...storedItems, ...fixtureItems].sort((a, b) =>
      b.loggedAt.localeCompare(a.loggedAt),
    );
  }, [stored, feedbacks]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">食事ログとフィードバック</h1>
          <p className="mt-1 text-sm text-stone-600">
            AI 下書き → 管理栄養士の監修・承認 → サロン担当者のコメント、の 3 層構成です。
          </p>
        </div>
        <Link href="/c/meals/new">
          <Button>記録する</Button>
        </Link>
      </header>
      <section className="space-y-5">
        {merged.map((log) => (
          <MealCard key={log.id} log={log} />
        ))}
      </section>
    </div>
  );
}

function MealCard({ log }: { log: MergedMeal }) {
  const comments = useStoredSalonComments(log.id);
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500">
            {new Date(log.loggedAt).toLocaleString("ja-JP", {
              month: "long",
              day: "numeric",
              weekday: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <Badge tone="brand">{MEAL_TYPE_LABEL[log.mealType]}</Badge>
        </div>

        {log.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={log.photoUrl}
            alt="お食事の写真"
            className="aspect-[7/5] w-full rounded-xl bg-stone-100 object-cover"
          />
        ) : (
          <div className="flex aspect-[7/5] w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 text-xs text-stone-500">
            食事の記録
          </div>
        )}

        <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
          <p className="font-semibold text-stone-900">あなたのメモ</p>
          <p className="mt-1 whitespace-pre-wrap">{log.memo}</p>
        </div>

        <FeedbackPanel feedback={log.feedback} />

        {comments.length > 0 ? (
          <div className="space-y-2 border-t border-stone-100 pt-3">
            {comments
              .slice()
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map((c: StoredSalonComment) => (
                <div
                  key={c.id}
                  className="rounded-lg bg-brand-50/70 p-3 text-xs text-brand-900"
                >
                  <p className="font-semibold">
                    サロンからのコメント（{c.authorName}）
                    <span className="ml-2 text-[10px] text-brand-700">
                      {new Date(c.createdAt).toLocaleString("ja-JP")}
                    </span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FeedbackPanel({ feedback }: { feedback: MergedMeal["feedback"] }) {
  if (feedback.status === "ai_drafting") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
        <p className="font-semibold">AI 下書き中…</p>
        <p className="mt-1">
          少々お待ちください。AI が下書きを準備しています（自動的に表示が切り替わります）。
        </p>
      </div>
    );
  }
  if (feedback.status === "awaiting_review") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
        <p className="font-semibold">栄養士監修待ち</p>
        {feedback.aiDraft ? (
          <p className="mt-1 whitespace-pre-line">{feedback.aiDraft}</p>
        ) : null}
        <p className="mt-2 text-[11px] text-amber-700">
          管理栄養士の最終承認後にお届けします。
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-900">
      <p className="font-semibold">管理栄養士からのフィードバック</p>
      {feedback.nutritionistName ? (
        <p className="mt-0.5 text-[11px] text-emerald-700">
          {feedback.nutritionistName}
          {feedback.licenseNumber ? `・${feedback.licenseNumber}` : ""}
        </p>
      ) : null}
      <p className="mt-2 whitespace-pre-line">
        {feedback.finalText ?? feedback.aiDraft}
      </p>
    </div>
  );
}
