import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  demoClient,
  demoMealLogs,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";

type PageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function DemoTherapistClientPage({ params }: PageProps) {
  const { clientId } = await params;
  if (clientId !== demoClient.id) notFound();

  const photos = demoProgressPhotos.slice(-4);
  const records = demoTreatmentRecords;
  const recentSalonComments = demoMealLogs
    .filter((m) => m.feedback.salonComment)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/demo/therapist"
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        本日の予約へ戻る
      </Link>

      <section className="mt-3 flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={demoClient.avatarUrl}
          alt={demoClient.displayName}
          className="h-16 w-16 flex-none rounded-full bg-stone-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-stone-500">{demoClient.furigana}</p>
          <h1 className="text-xl font-bold text-stone-900">
            {demoClient.displayName} 様
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{demoClient.ageRange}</Badge>
            <Badge tone="neutral">{demoClient.skinType}</Badge>
            <Badge tone="brand">
              {demoClient.sessionsCompleted}/{demoClient.sessionsTotal} 回
            </Badge>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-stone-900">直近 4 回の進捗写真</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.signedUrl}
                alt={p.caption}
                className="aspect-[3/4] w-full bg-stone-100 object-cover"
              />
              <p className="px-2 py-1 text-[10px] text-stone-500">
                {new Date(p.takenAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">施術カルテ</h2>
          <Button size="sm" variant="primary">
            <Timer className="h-3.5 w-3.5" />
            90 秒で記録する
          </Button>
        </div>

        <Card className="mt-3 border-brand-200 bg-brand-50/40">
          <CardContent>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              下書き（プレビュー）
            </p>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-stone-500">施術メニュー</p>
                <p className="rounded-md border border-brand-100 bg-white px-3 py-2 text-stone-900">
                  クレイトリートメント + 保湿パック
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-stone-500">所要時間</p>
                <p className="rounded-md border border-brand-100 bg-white px-3 py-2 text-stone-900">
                  90 分
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-stone-500">所見メモ（音声入力可）</p>
                <p className="rounded-md border border-brand-100 bg-white px-3 py-2 text-stone-900">
                  前回比で背中上部のコンディションが落ち着いた印象。肩甲骨周りの張りが残るため重点ケア。
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-stone-500">ホームケア推奨</p>
                <p className="rounded-md border border-brand-100 bg-white px-3 py-2 text-stone-900">
                  保湿ジェル朝晩 2 回、1 時間に 1 度の伸びストレッチ。
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-stone-500">
              ※ デモのため保存はできません。本番では 90 秒で記録が完了します。
            </p>
          </CardContent>
        </Card>

        <ul className="mt-4 space-y-3">
          {records.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">
                  {new Date(r.performedAt).toLocaleDateString("ja-JP")} ・ {r.menu}
                </p>
                {r.hasVideo ? (
                  <Badge tone="warning">[動画あり]</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {r.therapistName} ・ {r.durationMinutes} 分
              </p>
              <p className="mt-2 text-sm text-stone-700">{r.observations}</p>
              <p className="mt-1 text-xs text-stone-500">
                ホームケア: {r.homeCareNotes}
              </p>
              {r.hasVideo ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
                  <PlayCircle className="h-6 w-6 flex-none" />
                  <div>
                    <p className="font-semibold">施術動画 (00:42)</p>
                    <p className="text-[11px]">
                      タップして確認できます（デモでは再生されません）
                    </p>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-stone-900">
          直近の食事ログへのサロンコメント
        </h2>
        <ul className="mt-3 space-y-2">
          {recentSalonComments.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-stone-200 bg-white p-3 text-xs"
            >
              <p className="text-stone-500">
                {new Date(m.loggedAt).toLocaleDateString("ja-JP")}
              </p>
              <p className="mt-1 text-stone-700">
                {m.feedback.salonComment?.body}
              </p>
              <p className="mt-1 text-[11px] text-stone-400">
                — {m.feedback.salonComment?.therapistName}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
