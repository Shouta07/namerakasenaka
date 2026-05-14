"use client";

import { useMemo, useState } from "react";
import type { TimelinePhoto } from "./photo-timeline";

export function PhotoCompare({ photos }: { photos: TimelinePhoto[] }) {
  const [leftId, setLeftId] = useState<string | null>(photos[0]?.id ?? null);
  const [rightId, setRightId] = useState<string | null>(photos[photos.length - 1]?.id ?? null);

  const byId = useMemo(() => Object.fromEntries(photos.map((p) => [p.id, p])), [photos]);
  const left = leftId ? byId[leftId] : undefined;
  const right = rightId ? byId[rightId] : undefined;

  if (photos.length < 2) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
        比較には2枚以上の写真が必要です。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <PhotoSelect value={leftId} onChange={setLeftId} photos={photos} label="左" />
        <PhotoSelect value={rightId} onChange={setRightId} photos={photos} label="右" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ComparePane label="左" photo={left} />
        <ComparePane label="右" photo={right} />
      </div>
    </div>
  );
}

function PhotoSelect({
  value,
  onChange,
  photos,
  label,
}: {
  value: string | null;
  onChange: (v: string) => void;
  photos: TimelinePhoto[];
  label: string;
}) {
  return (
    <label className="block text-sm text-stone-600">
      <span className="mb-1 block">{label}の写真</span>
      <select
        className="h-10 w-full rounded-lg border border-stone-200 bg-white px-2 text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {photos.map((p) => (
          <option key={p.id} value={p.id}>
            {new Date(p.takenAt).toLocaleString("ja-JP")}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparePane({ label, photo }: { label: string; photo?: TimelinePhoto }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="px-3 py-2 text-xs text-stone-500">{label}</div>
      {photo?.signedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.signedUrl} alt={`比較写真${label}`} className="w-full object-cover" />
      ) : (
        <div className="flex h-64 items-center justify-center bg-stone-100 text-sm text-stone-400">
          選択してください
        </div>
      )}
    </div>
  );
}
