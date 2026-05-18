import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { PhotoTimeline, type TimelinePhoto } from "@/components/progress/photo-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type VideoRow = {
  id: string;
  taken_at: string;
  storage_path: string;
  duration_seconds: number | null;
};

export default async function ClientProgressPage() {
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
