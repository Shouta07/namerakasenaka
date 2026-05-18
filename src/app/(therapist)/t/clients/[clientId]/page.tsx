import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle, Timer } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import {
  demoClient,
  demoMealLogs,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MealLogWithCommentsList,
  type MealLogWithComments,
  type SalonComment,
} from "@/components/meals/meal-log-with-comments";
import type { MealType } from "@/types/domain";

type TreatmentRecordRow = {
  id: string;
  treatment_at: string;
  treatment_type: string;
  next_plan: string | null;
};

type TreatmentVideoRow = {
  id: string;
  taken_at: string;
  storage_path: string;
  duration_seconds: number | null;
};

type MealLogRow = {
  id: string;
  client_id: string;
  meal_type: MealType;
  memo: string | null;
  logged_at: string;
};

type CommentRow = {
  id: string;
  meal_log_id: string;
  body: string;
  author_role: "therapist" | "salon_admin";
  created_at: string;
};

export default async function TherapistClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  if (isDemoMode()) {
    if (clientId !== demoClient.id) notFound();
    return <DemoTherapistClientDetail />;
  }

  const supabase = await getServerSupabase();

  const { data: client } = await supabase
    .from("clients")
    .select("id, skin_type, concerns")
    .eq("id", clientId)
    .maybeSingle();

  const { data: records } = await supabase
    .from("treatment_records")
    .select("id, treatment_at, treatment_type, next_plan")
    .eq("client_id", clientId)
    .order("treatment_at", { ascending: false })
    .limit(20);

  const rows = (records ?? []) as unknown as TreatmentRecordRow[];

  const { data: meals } = await supabase
    .from("meal_logs")
    .select("id, client_id, meal_type, memo, logged_at")
    .eq("client_id", clientId)
    .order("logged_at", { ascending: false })
    .limit(10);

  const mealRows = (meals ?? []) as unknown as MealLogRow[];
  const mealIds = mealRows.map((m) => m.id);

  let comments: CommentRow[] = [];
  if (mealIds.length > 0) {
    const { data: c } = await supabase
      .from("meal_log_comments")
      .select("id, meal_log_id, body, author_role, created_at")
      .in("meal_log_id", mealIds)
      .order("created_at", { ascending: false });
    comments = (c ?? []) as unknown as CommentRow[];
  }

  const mealsWithComments: MealLogWithComments[] = mealRows.map((m) => ({
    id: m.id,
    meal_type: m.meal_type,
    memo: m.memo,
    logged_at: m.logged_at,
    comments: comments
      .filter((c) => c.meal_log_id === m.id)
      .map<SalonComment>((c) => ({
        id: c.id,
        body: c.body,
        author_role: c.author_role,
        created_at: c.created_at,
      })),
  }));

  const { data: videos } = await supabase
    .from("treatment_videos")
    .select("id, taken_at, storage_path, duration_seconds")
    .eq("client_id", clientId)
    .order("taken_at", { ascending: false })
    .limit(10);
  const videoRows = (videos ?? []) as unknown as TreatmentVideoRow[];

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
      <header>
        <h1 className="text-2xl font-semibold">顧客カルテ</h1>
        <p className="mt-1 text-sm text-stone-600">
          肌タイプ: {(client as { skin_type?: string | null } | null)?.skin_type ?? "—"} ・ 悩み:{" "}
          {(client as { concerns?: string | null } | null)?.concerns ?? "—"}
        </p>
      </header>

      <div className="flex gap-2">
        <Link href={`/t/clients/${clientId}/records/new`}>
          <Button>施術記録を追加</Button>
        </Link>
        <Link href={`/t/clients/${clientId}/photos/new`}>
          <Button variant="secondary">進捗写真を追加</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>過去の施術記録</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-stone-500">記録はまだありません。</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {rows.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="text-sm font-medium">{r.treatment_type}</p>
                  <p className="text-xs text-stone-500">
                    {new Date(r.treatment_at).toLocaleString("ja-JP")}
                  </p>
                  {r.next_plan ? (
                    <p className="mt-1 text-xs text-stone-700">次回: {r.next_plan}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>施術動画</CardTitle>
        </CardHeader>
        <CardContent>
          {videosWithUrls.length === 0 ? (
            <p className="text-sm text-stone-500">動画はまだありません。</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {videosWithUrls.map((v) => (
                <li
                  key={v.id}
                  className="overflow-hidden rounded-lg border border-stone-200"
                >
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
                  <div className="px-3 py-2 text-xs text-stone-600">
                    {new Date(v.taken_at).toLocaleString("ja-JP")}
                    {v.duration_seconds != null
                      ? ` ・ ${v.duration_seconds}秒`
                      : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>食事ログ</CardTitle>
        </CardHeader>
        <CardContent>
          <MealLogWithCommentsList rows={mealsWithComments} composer />
        </CardContent>
      </Card>
    </div>
  );
}

function DemoTherapistClientDetail() {
  const photos = demoProgressPhotos.slice(-4);
  const records = demoTreatmentRecords;
  const recentSalonComments = demoMealLogs
    .filter((m) => m.feedback.salonComment)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
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

      <section>
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

      <section>
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
              ※ サンプル表示のため保存はできません。本番では 90 秒で記録が完了します。
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
                {r.hasVideo ? <Badge tone="warning">[動画あり]</Badge> : null}
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
                      タップして確認できます（サンプル表示では再生されません）
                    </p>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
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
    </div>
  );
}
