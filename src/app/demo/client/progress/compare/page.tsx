import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { demoProgressPhotos } from "@/lib/demo/fixtures";
import { PHOTO_TYPE_LABEL } from "@/types/domain";

export default function DemoClientComparePage() {
  const first = demoProgressPhotos[0];
  const last = demoProgressPhotos[demoProgressPhotos.length - 1];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/demo/client"
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        進捗タイムラインへ戻る
      </Link>

      <header className="mt-3">
        <h1 className="text-2xl font-bold text-stone-900">Before / After 比較</h1>
        <p className="mt-1 text-sm text-stone-600">
          Week 1（初回）と Week {Math.ceil(demoProgressPhotos.length)} を並べて確認できます。
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <ComparePane label="初回" photo={first} />
        <ComparePane label="最新" photo={last} highlight />
      </section>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-700">
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
    </main>
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
