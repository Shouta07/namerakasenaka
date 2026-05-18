import Link from "next/link";
import { CheckCircle2, FileEdit, ShieldCheck } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoApprovedExample, demoPendingDrafts } from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEAL_TYPE_LABEL } from "@/types/domain";

type FeedbackRow = {
  id: string;
  status: string;
  created_at: string;
  meal_log_id: string;
};

export default async function NutritionistQueuePage() {
  if (isDemoMode()) {
    return <DemoNutritionistQueue />;
  }

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("meal_feedbacks")
    .select("id, status, created_at, meal_log_id")
    .in("status", ["awaiting_review", "ai_drafting"])
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as FeedbackRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">監修キュー</h1>
      <p className="text-xs text-stone-500">SLA: 食事ログ提出から48時間以内に承認してください。</p>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">キューは空です。</p>
        ) : (
          rows.map((f) => (
            <Link key={f.id} href={`/n/queue/${f.id}`} className="block">
              <Card>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs">{f.id.slice(0, 8)}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {new Date(f.created_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <Badge tone={f.status === "awaiting_review" ? "warning" : "neutral"}>
                    {f.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function DemoNutritionistQueue() {
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
        AI が生成した食事フィードバックの下書きを管理栄養士が監修・承認するワークフローです。薬機法・健康増進法に配慮した文言ガイドが組み込まれ、最終的な定型免責文も自動付与されます。
      </p>

      <section>
        <h2 className="text-base font-semibold text-stone-900">
          未レビュー（{demoPendingDrafts.length} 件）
        </h2>
        <ul className="mt-3 space-y-4">
          {demoPendingDrafts.map((d) => (
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.photoUrl}
                      alt="食事の写真"
                      className="aspect-[7/5] w-full rounded-lg bg-stone-100 object-cover sm:aspect-square"
                    />
                    <div className="space-y-2">
                      <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-700">
                        <p className="font-semibold text-stone-900">顧客メモ</p>
                        <p className="mt-1">{d.memo}</p>
                      </div>
                      <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-900">
                        <p className="font-semibold">AI 下書き</p>
                        <p className="mt-1 whitespace-pre-line">{d.aiDraft}</p>
                        <p className="mt-2 text-[11px] text-amber-700">
                          禁止用語チェック:{" "}
                          {d.bannedWordHits.length === 0
                            ? "通過"
                            : `要修正 (${d.bannedWordHits.join(", ")})`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary">
                      <FileEdit className="h-3.5 w-3.5" />
                      編集して承認
                    </Button>
                    <Button size="sm" variant="primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      そのまま承認
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-stone-900">承認済みサンプル</h2>
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
