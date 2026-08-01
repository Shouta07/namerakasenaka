import Link from "next/link";
import {
  CalendarClock,
  GitCompare,
  Heart,
  Sparkles,
} from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import {
  demoAppointments,
  demoClient,
  demoProgressPhotos,
  demoTherapistCheer,
} from "@/lib/demo/fixtures";
import { HypothesisCard } from "@/components/guide/hypothesis-card";
import { PhotoTimeline, type TimelinePhoto } from "@/components/progress/photo-timeline";
import { BeforeAfter } from "@/components/progress/before-after";
import { LineRecordCard } from "@/components/guide/line-record-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerAvatar } from "@/components/ui/customer-avatar";

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

  // 歩みの物語 — 日数・折り返し・自己実感の推移をデモデータから組み立てる。
  const journeyDays = Math.max(
    1,
    Math.ceil(
      (Date.now() - new Date(demoClient.startedOn).getTime()) / 86_400_000,
    ),
  );
  const progressRatio = demoClient.sessionsCompleted / demoClient.sessionsTotal;
  const milestoneLabel =
    progressRatio >= 1
      ? "🎉 コースを完走しました"
      : progressRatio >= 0.5
        ? "🎉 折り返し地点に到着"
        : "🌱 歩みはじめの季節";
  const myPhotos = demoProgressPhotos
    .filter((p) => p.clientId === demoClient.id && p.selfRating != null)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  const firstRating = myPhotos[0]?.selfRating ?? null;
  const latestRating = myPhotos[myPhotos.length - 1]?.selfRating ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <CustomerAvatar name={demoClient.displayName} size="lg" role="customer" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-stone-500">{demoClient.furigana}</p>
            <h1 className="text-xl font-bold text-stone-900">
              {demoClient.displayName} さん
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              {demoClient.courseName} ・ 担当 {demoClient.primaryTherapistName}
            </p>
          </div>
          <div className="flex-none text-right">
            <p className="text-[11px] text-stone-400">はじめてから</p>
            <p className="text-lg font-bold tabular-nums text-brand-700">
              {journeyDays}
              <span className="ml-0.5 text-xs font-semibold text-stone-500">日目</span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full bg-brand-500"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-stone-600">
            {demoClient.sessionsCompleted}/{demoClient.sessionsTotal} 回
          </span>
        </div>
        <p className="mt-2 text-xs font-semibold text-brand-700">{milestoneLabel}</p>
      </section>

      {/* ここまでの歩み — 記録を「小さな勝ちのお祝い」に翻訳する */}
      {firstRating != null && latestRating != null ? (
        <section className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Sparkles className="h-4 w-4 text-brand-700" />
            ここまでの歩み
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <RatingDots value={firstRating} label="はじめた頃" />
            <span className="text-stone-400" aria-hidden>
              →
            </span>
            <RatingDots value={latestRating} label="いちばん最近" highlight />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-stone-600">
            ご自身でつけた「実感の点数」が {firstRating} → {latestRating}{" "}
            に変わりました。数字は評価ではなく、
            {demoClient.displayName.split(" ")[0]}
            さんご自身の感覚の記録です。感じ方が変わってきたこと自体が、続けてきた証です。
          </p>
        </section>
      ) : null}

      {/* 担当からのひとこと — 画面の向こうに人がいることを伝える */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <Heart className="h-4 w-4 text-rose-500" />
          {demoTherapistCheer.therapistName} からのひとこと
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          {demoTherapistCheer.body}
        </p>
        <p className="mt-2 text-[11px] text-stone-400">
          {new Date(demoTherapistCheer.writtenAt).toLocaleDateString("ja-JP", {
            month: "long",
            day: "numeric",
          })}
        </p>
      </section>

      {/* 伴走ループ — サロンから未読のお返事があるときだけ表示 */}
      {/* 状態仮説カード — 回復ガイドがある顧客にだけ表示（なければ静かにスキップ） */}
      <HypothesisCard clientId={demoClient.id} />

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

      <BeforeAfter />

      <Link
        href="/c/skin"
        className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white text-[13px] font-semibold text-brand-700"
      >
        <GitCompare className="h-4 w-4" />
        背中ケアの記録をすべて見る →
      </Link>

      <LineRecordCard />

      <footer className="pb-2 pt-4 text-center text-[11px] text-stone-400">
        Powered by Accord — 美容・ウェルネス店舗の現場CXを創る
      </footer>
    </div>
  );
}

/** 自己実感（1〜5）を5つのドットで見せる小さな表示。 */
function RatingDots({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[11px] text-stone-500">{label}</span>
      <div className="flex items-center gap-1" aria-label={`${label}: 実感 ${value}/5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            aria-hidden
            className={`h-2.5 w-2.5 rounded-full ${
              i <= value
                ? highlight
                  ? "bg-brand-500"
                  : "bg-stone-400"
                : "bg-stone-200"
            }`}
          />
        ))}
        <span
          className={`ml-1 text-xs font-bold tabular-nums ${
            highlight ? "text-brand-700" : "text-stone-500"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
