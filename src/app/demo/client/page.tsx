import Link from "next/link";
import { CalendarClock, Camera, GitCompare, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoTimeline, type TimelinePhoto } from "@/components/progress/photo-timeline";
import {
  demoAppointments,
  demoClient,
  demoMealLogs,
  demoProgressPhotos,
} from "@/lib/demo/fixtures";
import { MEAL_TYPE_LABEL } from "@/types/domain";

export default function DemoClientPage() {
  const photos: TimelinePhoto[] = demoProgressPhotos.map((p) => ({
    id: p.id,
    takenAt: p.takenAt,
    photoType: p.photoType,
    signedUrl: p.signedUrl,
    caption: p.caption,
    selfRating: p.selfRating,
  }));

  const nextAppointment = demoAppointments
    .filter((a) => a.clientId === demoClient.id && a.status === "confirmed")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .find((a) => new Date(a.scheduledAt).getTime() > Date.now()) ??
    demoAppointments.find((a) => a.clientId === demoClient.id);

  const latestMeal = demoMealLogs[0];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <section className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={demoClient.avatarUrl}
          alt={demoClient.displayName}
          className="h-16 w-16 flex-none rounded-full bg-stone-100 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-stone-500">{demoClient.furigana}</p>
          <h1 className="text-xl font-bold text-stone-900">
            {demoClient.displayName} さん
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            {demoClient.courseName} ・ 担当 {demoClient.primaryTherapistName}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full bg-brand-500"
                style={{
                  width: `${Math.round(
                    (demoClient.sessionsCompleted / demoClient.sessionsTotal) * 100,
                  )}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-stone-600">
              {demoClient.sessionsCompleted}/{demoClient.sessionsTotal} 回
            </span>
          </div>
        </div>
      </section>

      {nextAppointment ? (
        <section className="mt-5">
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 flex-none text-brand-700" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500">次回のご予約</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">
                    {new Date(nextAppointment.scheduledAt).toLocaleString("ja-JP", {
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {nextAppointment.menuName} ・ {nextAppointment.therapistName}
                  </p>
                </div>
                <Badge tone="brand">確定</Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
            <Camera className="h-4 w-4 text-brand-700" />
            進捗フォトタイムライン
          </h2>
          <Link href="/demo/client/progress/compare">
            <Button size="sm" variant="secondary">
              <GitCompare className="h-3.5 w-3.5" />
              比較する
            </Button>
          </Link>
        </div>
        <PhotoTimeline photos={photos} />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
            <Utensils className="h-4 w-4 text-brand-700" />
            最新の食事フィードバック
          </h2>
          <Link
            href="/demo/client/meals"
            className="text-xs font-medium text-brand-700 hover:text-brand-500"
          >
            すべて見る →
          </Link>
        </div>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500">
                {new Date(latestMeal.loggedAt).toLocaleString("ja-JP", {
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <Badge tone="brand">{MEAL_TYPE_LABEL[latestMeal.mealType]}</Badge>
            </div>
            <p className="mt-2 text-sm text-stone-700">{latestMeal.memo}</p>
            <div className="mt-3 rounded-lg bg-emerald-50/60 p-3 text-xs text-emerald-900">
              <p className="font-semibold">
                管理栄養士からのフィードバック（{latestMeal.feedback.nutritionistName}・
                {latestMeal.feedback.nutritionistLicenseNumber}）
              </p>
              <p className="mt-1 whitespace-pre-line">
                {latestMeal.feedback.approvedText}
              </p>
            </div>
            {latestMeal.feedback.salonComment ? (
              <div className="mt-2 rounded-lg bg-brand-50/60 p-3 text-xs text-brand-900">
                <p className="font-semibold">
                  サロンからのコメント（{latestMeal.feedback.salonComment.therapistName}）
                </p>
                <p className="mt-1">{latestMeal.feedback.salonComment.body}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
