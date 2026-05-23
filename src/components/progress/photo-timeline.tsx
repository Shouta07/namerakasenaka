import { Badge } from "@/components/ui/badge";
import { PHOTO_TYPE_LABEL, type PhotoType } from "@/types/domain";
import {
  BackPhotoPlaceholder,
  severityFromSelfRating,
  type BackPhotoLighting,
  type BackPhotoSeverity,
} from "@/components/progress/back-photo-placeholder";

export type TimelinePhoto = {
  id: string;
  takenAt: string;
  photoType: PhotoType;
  signedUrl: string | null;
  caption?: string | null;
  selfRating?: number | null;
  severity?: BackPhotoSeverity;
  lighting?: BackPhotoLighting;
};

export function PhotoTimeline({ photos }: { photos: TimelinePhoto[] }) {
  if (photos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
        まだ写真がありません。
      </p>
    );
  }

  return (
    <ol className="space-y-6">
      {photos.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-sm text-stone-600">
              {new Date(p.takenAt).toLocaleString("ja-JP")}
            </p>
            <Badge tone={p.photoType === "before" ? "neutral" : "brand"}>
              {PHOTO_TYPE_LABEL[p.photoType]}
            </Badge>
          </div>
          {p.signedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.signedUrl}
              alt={p.caption ?? "進捗写真"}
              className="w-full bg-stone-100 object-cover"
            />
          ) : (
            <div className="aspect-[3/4] w-full bg-stone-100">
              <BackPhotoPlaceholder
                severity={p.severity ?? severityFromSelfRating(p.selfRating)}
                lighting={p.lighting ?? "warm"}
                caption={p.caption ?? "進捗写真"}
              />
            </div>
          )}
          {p.caption ? (
            <p className="px-4 py-3 text-sm text-stone-700">{p.caption}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
