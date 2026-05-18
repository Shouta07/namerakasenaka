import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoProgressPhotos } from "@/lib/demo/fixtures";
import { PhotoCompare } from "@/components/progress/photo-compare";
import { MobileAppBar } from "@/components/ui/app-bar";
import { Badge } from "@/components/ui/badge";
import type { TimelinePhoto } from "@/components/progress/photo-timeline";
import { PHOTO_TYPE_LABEL } from "@/types/domain";

export default async function ProgressComparePage() {
  if (isDemoMode()) {
    return <DemoCompare />;
  }

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
      <MobileAppBar title="比較ビュー" eyebrow="比較中" backHref="/c/progress" />
      <h1 className="hidden text-2xl font-semibold md:block">比較ビュー</h1>
      <PhotoCompare photos={photos} />
    </div>
  );
}

function DemoCompare() {
  const first = demoProgressPhotos[0];
  const last = demoProgressPhotos[demoProgressPhotos.length - 1];

  return (
    <div className="space-y-6">
      <MobileAppBar title="Before / After 比較" eyebrow="比較中" backHref="/c/progress" />
      <header className="hidden md:block">
        <h1 className="text-2xl font-semibold">Before / After 比較</h1>
        <p className="mt-1 text-sm text-stone-600">
          Week 1（初回）と Week {Math.ceil(demoProgressPhotos.length)} を並べて確認できます。
        </p>
      </header>
      <p className="text-sm text-stone-600 md:hidden">
        Week 1（初回）と Week {Math.ceil(demoProgressPhotos.length)} を縦に並べて確認できます。
      </p>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ComparePane label="初回" photo={first} />
        <ComparePane label="最新" photo={last} highlight />
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-700">
        <p className="font-semibold text-stone-900">変化の記録</p>
        <ul className="mt-3 space-y-2 text-xs">
          <li className="flex justify-between">
            <span className="text-stone-500">記録期間</span>
            <span>
              {new Date(first.takenAt).toLocaleDateString("ja-JP")} 〜{" "}
              {new Date(last.takenAt).toLocaleDateString("ja-JP")}
            </span>
          </li>
          <li className="flex justify-between">
            <span className="text-stone-500">撮影回数</span>
            <span>{demoProgressPhotos.length} 回</span>
          </li>
          <li className="flex justify-between">
            <span className="text-stone-500">セルフ評価の変化</span>
            <span>
              {first.selfRating}/5 → {last.selfRating}/5
            </span>
          </li>
        </ul>
        <p className="mt-4 text-[11px] text-stone-400">
          表示している評価はお客様ご自身が記録された主観的な記録であり、医療上の判断を行うものではありません。
        </p>
      </section>
    </div>
  );
}

function ComparePane({
  label,
  photo,
  highlight,
}: {
  label: string;
  photo: (typeof demoProgressPhotos)[number];
  highlight?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white ${
        highlight ? "border-brand-500 ring-2 ring-brand-100" : "border-stone-200"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-xs font-semibold text-stone-700">{label}</p>
        <Badge tone={photo.photoType === "before" ? "neutral" : "brand"}>
          {PHOTO_TYPE_LABEL[photo.photoType]}
        </Badge>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.signedUrl}
        alt={photo.caption}
        className="aspect-[3/4] w-full bg-stone-100 object-cover"
      />
      <div className="px-3 py-2 text-xs text-stone-600">
        <p>{new Date(photo.takenAt).toLocaleDateString("ja-JP")}</p>
        <p className="mt-1 text-stone-500">{photo.caption}</p>
      </div>
    </div>
  );
}
