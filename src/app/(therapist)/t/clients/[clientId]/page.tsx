import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoClient } from "@/lib/demo/fixtures";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MealLogWithCommentsList,
  type MealLogWithComments,
  type SalonComment,
} from "@/components/meals/meal-log-with-comments";
import { DemoTherapistClientDetail } from "@/components/clients/demo-therapist-client-detail";
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
