"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CheckCircle2, FileEdit, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEAL_TYPE_LABEL, type MealType } from "@/types/domain";
import {
  demoApprovedExample,
  demoMealLogs,
  demoPendingDrafts,
} from "@/lib/demo/fixtures";
import {
  useStoredMealFeedbacks,
  useStoredMealLogs,
  type StoredMealFeedback,
  type StoredMealLog,
} from "@/lib/demo/store";
import { demoClient } from "@/lib/demo/fixtures";

type QueueItem = {
  id: string;
  clientName: string;
  loggedAt: string;
  mealType: MealType;
  memo: string;
  photoUrl: string | null;
  aiDraft: string;
  approved: boolean;
  rejected: boolean;
};

export function DemoNutritionistQueue() {
  const storedLogs = useStoredMealLogs(demoClient.id);
  const storedFb = useStoredMealFeedbacks();

  const items = useMemo<QueueItem[]>(() => {
    const fromFixtures: QueueItem[] = demoPendingDrafts.map((d) => {
      const decision = storedFb.find((f: StoredMealFeedback) => f.id === d.id);
      return {
        id: d.id,
        clientName: d.clientName,
        loggedAt: d.loggedAt,
        mealType: d.mealType,
        memo: d.memo,
        photoUrl: d.photoUrl,
        aiDraft: decision?.finalText ?? d.aiDraft,
        approved: decision?.status === "approved" || decision?.status === "sent",
        rejected: decision?.status === "rejected",
      };
    });
    const fromStored: QueueItem[] = storedLogs.map((m: StoredMealLog) => {
      const fb = storedFb.find((f) => f.mealLogId === m.id);
      return {
        id: fb?.id ?? m.id,
        clientName: demoClient.displayName,
        loggedAt: m.loggedAt,
        mealType: m.mealType,
        memo: m.memo,
        photoUrl: m.photoUrl,
        aiDraft: fb?.finalText ?? fb?.aiDraft ?? "AI 下書き準備中…",
        approved: fb?.status === "approved" || fb?.status === "sent",
        rejected: fb?.status === "rejected",
      };
    });
    return [...fromStored, ...fromFixtures];
  }, [storedFb, storedLogs]);

  const pending = items.filter((i) => !i.approved && !i.rejected);
  const decided = items.filter((i) => i.approved || i.rejected);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-stone-500">栄養士監修キュー</p>
          <h1 className="text-2xl font-bold text-stone-900">AI 下書きレビュー</h1>
        </div>
      </header>

      <p className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900">
        AI が生成した食事フィードバックの下書きを管理栄養士が監修・承認するワークフローです。
        薬機法・健康増進法に配慮した文言ガイドが組み込まれ、最終的な定型免責文も自動付与されます。
      </p>

      <section>
        <h2 className="text-base font-semibold text-stone-900">
          未レビュー（{pending.length} 件）
        </h2>
        <ul className="mt-3 space-y-4">
          {pending.map((d) => (
            <li key={d.id}>
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-stone-900">
                      {d.clientName} 様
                    </p>
                    <Badge tone="warning">
                      {MEAL_TYPE_LABEL[d.mealType]} ・ 未レビュー
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500">
                    {new Date(d.loggedAt).toLocaleString("ja-JP")}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                    {d.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.photoUrl}
                        alt="食事の写真"
                        className="aspect-[7/5] w-full rounded-lg bg-stone-100 object-cover sm:aspect-square"
                      />
                    ) : (
                      <div className="flex aspect-[7/5] w-full items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-amber-50 text-[10px] text-stone-500 sm:aspect-square">
                        食事ログ
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
                        <p className="font-semibold text-stone-900">顧客メモ</p>
                        <p className="mt-1 whitespace-pre-wrap">{d.memo}</p>
                      </div>
                      <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-900">
                        <p className="font-semibold">AI 下書き</p>
                        <p className="mt-1 whitespace-pre-line">{d.aiDraft}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Link href={`/n/queue/${d.id}?edit=1`}>
                      <Button size="sm" variant="secondary">
                        <FileEdit className="h-3.5 w-3.5" />
                        編集して承認
                      </Button>
                    </Link>
                    <Link href={`/n/queue/${d.id}`}>
                      <Button size="sm" variant="primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        レビュー
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {decided.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-stone-900">
            レビュー済み（{decided.length} 件）
          </h2>
          <ul className="mt-3 space-y-3">
            {decided.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-stone-200 bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-stone-900">{d.clientName} 様</p>
                  <Badge tone={d.approved ? "success" : "neutral"}>
                    {d.approved ? "承認済み" : "差戻し"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {new Date(d.loggedAt).toLocaleString("ja-JP")}
                </p>
                <p className="mt-2 text-xs text-stone-700 whitespace-pre-line">
                  {d.aiDraft}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-base font-semibold text-stone-900">直近の承認済み</h2>
        <Card className="mt-3 border-emerald-200 bg-emerald-50/30">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-emerald-900">
                {demoApprovedExample.clientName} 様
              </p>
              <Badge tone="success">承認済み</Badge>
            </div>

            <div className="rounded-lg bg-white p-3 text-xs text-stone-700">
              <p className="font-semibold text-stone-900">AI 下書き（オリジナル）</p>
              <p className="mt-1 whitespace-pre-line text-stone-600">
                {demoApprovedExample.originalAiDraft}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50/80 p-3 text-xs text-emerald-900">
              <p className="font-semibold">最終承認テキスト（顧客へ送信）</p>
              <p className="mt-1 whitespace-pre-line">{demoApprovedExample.finalText}</p>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-white p-3 text-[11px] text-stone-600">
              <p className="font-semibold text-stone-900">監査ログ</p>
              <ul className="mt-1 space-y-0.5">
                <li>
                  承認者: {demoApprovedExample.approvedBy}（{demoApprovedExample.licenseNumber}）
                </li>
                <li>
                  承認日時:{" "}
                  {new Date(demoApprovedExample.approvedAt).toLocaleString("ja-JP")}
                </li>
                <li>レビュー所要: 約 2 分</li>
              </ul>
            </div>

            <div className="text-[11px] text-stone-400">
              直近の食事ログ {demoMealLogs.length} 件。
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
