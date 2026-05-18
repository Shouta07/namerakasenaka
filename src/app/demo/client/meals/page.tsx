import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoMealLogs } from "@/lib/demo/fixtures";
import { MEAL_TYPE_LABEL } from "@/types/domain";

export default function DemoClientMealsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/demo/client"
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        マイページへ戻る
      </Link>

      <header className="mt-3">
        <h1 className="text-2xl font-bold text-stone-900">食事ログとフィードバック</h1>
        <p className="mt-1 text-sm text-stone-600">
          AI 下書き → 管理栄養士の監修・承認 → サロン担当者のコメント、の 3
          層構成でお届けします。
        </p>
      </header>

      <section className="mt-6 space-y-5">
        {demoMealLogs.map((log) => (
          <Card key={log.id}>
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

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={log.photoUrl}
                alt="お食事の写真"
                className="aspect-[7/5] w-full rounded-xl bg-stone-100 object-cover"
              />

              <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
                <p className="font-semibold text-stone-900">あなたのメモ</p>
                <p className="mt-1">{log.memo}</p>
              </div>

              <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-900">
                <p className="font-semibold">
                  管理栄養士からのフィードバック
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  {log.feedback.nutritionistName}・
                  {log.feedback.nutritionistLicenseNumber}
                </p>
                <p className="mt-2 whitespace-pre-line">
                  {log.feedback.approvedText}
                </p>
              </div>

              {log.feedback.salonComment ? (
                <div className="rounded-lg bg-brand-50/70 p-3 text-xs text-brand-900">
                  <p className="font-semibold">サロンからのコメント</p>
                  <p className="mt-0.5 text-[11px] text-brand-700">
                    {log.feedback.salonComment.therapistName}（担当）
                  </p>
                  <p className="mt-2">{log.feedback.salonComment.body}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
