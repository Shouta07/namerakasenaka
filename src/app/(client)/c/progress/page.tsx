import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { PhotoTimeline, type TimelinePhoto } from "@/components/progress/photo-timeline";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">進捗タイムライン</h1>
        <Link href="/c/progress/compare">
          <Button variant="secondary">比較ビュー</Button>
        </Link>
      </header>
      <PhotoTimeline photos={withUrls} />
    </div>
  );
}
