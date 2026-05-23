import Link from "next/link";
import { CalendarClock, Camera, GitCompare, Utensils } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import {
  demoAppointments,
  demoClient,
  demoMealLogs,
} from "@/lib/demo/fixtures";
import { PhotoTimeline, type TimelinePhoto } from "@/components/progress/photo-timeline";
import { DemoProgressTimeline } from "@/components/progress/demo-progress-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerAvatar } from "@/components/ui/customer-avatar";
import { MEAL_TYPE_LABEL } from "@/types/domain";

type VideoRow = {
  id: string;
  taken_at: string;
  storage_path: string;
  duration_seconds: number | null;
};

export default async function ClientProgressPage() {
  if (isDemoMode()) {
    return <DemoClientProgress />;
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("id, taken_at, photo_type, storage_path, caption, self_rating")
    .order("taken_at", { ascending: false })
    .limit(50);

  const photos: TimelinePhoto[] = error
    ? []
    : ((data ?? []) as unknown as Array<{
        id: string;
        taken_at: string;
        photo_type: TimelinePhoto["photoType"];
        storage_path: string;
        caption: string | null;
        self_rating: number | null;
      }>).map((row) => ({
        id: row.id,
        takenAt: row.taken_at,
        photoType: row.photo_type,
        signedUrl: null,
        caption: row.caption,
        selfRating: row.self_rating,
      }));

  // Resolve signed URLs in parallel (15-min expiry — §4.2 acceptance criterion).
  const withUrls = await Promise.all(
    photos.map(async (p) => {
      const row = (data ?? []).find((r) => (r as { id: string }).id === p.id) as
        | { storage_path: string }
        | undefined;
      if (!row) return p;
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(row.storage_path, 60 * 15);
      return { ...p, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  const { data: videos } = await supabase
    .from("treatment_videos")
    .select("id, taken_at, storage_path, duration_seconds")
    .order("taken_at", { ascending: false })
    .limit(20);
  const videoRows = (videos ?? []) as unknown as VideoRow[];
  const videosWithUrls = await Promise.all(
    videoRows.map(async (v) => {
      const { data: signed } = await supabase.storage
        .from("progress-videos")
        .createSignedUrl(v.storage_path, 60 * 15);
      return { ...v, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">進捗タイムライン</h1>
        <Link href="/c/progress/compare">
          <Button variant="secondary">比較ビュー</Button>
        </Link>
      </header>

      {videosWithUrls.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-stone-700">施術動画</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {videosWithUrls.map((v) => (
              <li
                key={v.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="flex items-center justify-between px-4 py-2">
                  <p className="text-sm text-stone-600">
                    {new Date(v.taken_at).toLocaleString("ja-JP")}
                  </p>
                  <Badge tone="brand">動画</Badge>
                </div>
                {v.signedUrl ? (
                  <video
                    src={v.signedUrl}
                    controls
                    preload="metadata"
                    className="w-full bg-stone-900"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-stone-100 text-xs text-stone-400">
                    署名URL未取得
                  </div>
                )}
                {v.duration_seconds != null ? (
                  <p className="px-4 py-2 text-xs text-stone-500">
                    {v.duration_seconds}秒
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PhotoTimeline photos={withUrls} />
    </div>
  );
}

function DemoClientProgress() {
  const nextAppointment = demoAppointments
    .filter((a) => a.clientId === demoClient.id && a.status === "confirmed")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .find((a) => new Date(a.scheduledAt).getTime() > Date.now()) ??
    demoAppointments.find((a) => a.clientId === demoClient.id);

  const latestMeal = demoMealLogs[0];

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <CustomerAvatar name={demoClient.displayName} size="lg" role="customer" />
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
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
            <Camera className="h-4 w-4 text-brand-700" />
            進捗フォトタイムライン
          </h2>
          <Link href="/c/progress/compare">
            <Button size="sm" variant="secondary">
              <GitCompare className="h-3.5 w-3.5" />
              比較する
            </Button>
          </Link>
        </div>
        <DemoProgressTimeline />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
            <Utensils className="h-4 w-4 text-brand-700" />
            最新の食事フィードバック
          </h2>
          <Link
            href="/c/meals"
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
    </div>
  );
}
