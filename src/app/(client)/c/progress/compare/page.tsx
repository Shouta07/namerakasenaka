import { getServerSupabase } from "@/lib/supabase/server";
import { PhotoCompare } from "@/components/progress/photo-compare";
import type { TimelinePhoto } from "@/components/progress/photo-timeline";

export default async function ProgressComparePage() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("progress_photos")
    .select("id, taken_at, photo_type, storage_path, caption, self_rating")
    .order("taken_at", { ascending: true });

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    taken_at: string;
    photo_type: TimelinePhoto["photoType"];
    storage_path: string;
    caption: string | null;
    self_rating: number | null;
  }>;

  const photos = await Promise.all(
    rows.map(async (r) => {
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(r.storage_path, 60 * 15);
      return {
        id: r.id,
        takenAt: r.taken_at,
        photoType: r.photo_type,
        signedUrl: signed?.signedUrl ?? null,
        caption: r.caption,
        selfRating: r.self_rating,
      } as TimelinePhoto;
    }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">比較ビュー</h1>
      <PhotoCompare photos={photos} />
    </div>
  );
}
