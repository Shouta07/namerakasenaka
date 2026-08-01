export const dynamic = "force-dynamic";

import Link from "next/link";
import { GitCompare } from "lucide-react";
import { BeforeAfter } from "@/components/progress/before-after";
import {
  demoProgressPhotos,
  demoSkinAssessments,
  demoClient,
} from "@/lib/demo/fixtures";

export const metadata = { title: "背中ケア" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });

/**
 * 背中ケア — 施術の前後で、背中がどう変わってきたか。
 *
 * 炎症と色素沈着は別々に出す。色素は遅れて改善するので、ひとつに
 * まとめると「効いていない」に見えてしまう。
 * 評価はサロンが付ける。お客様は撮ることも記録することもしない。
 */
export default function ClientSkinPage() {
  const list = [...demoSkinAssessments].sort((a, b) =>
    a.assessedOn.localeCompare(b.assessedOn),
  );
  const first = list[0];
  const latest = list[list.length - 1];
  const latestPhoto = demoProgressPhotos.find((p) => p.id === latest.photoId);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-stone-900">背中ケア</h1>
        <p className="mt-1 text-[12.5px] leading-relaxed text-stone-500">
          {demoClient.courseName} ・ {list.length} 回ぶんの記録
        </p>
      </header>

      <BeforeAfter />

      {/* 2つの指標 — 分けて出す */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-bold text-stone-900">いまの状態</h2>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-500">
          施術のたびに、{latest.assessedBy} が見て付けています。
        </p>

        <div className="mt-3 space-y-4">
          <Metric
            label="炎症（赤み）"
            from={first.inflammation}
            to={latest.inflammation}
            hint="赤みや、新しくできるぶつぶつの多さ"
          />
          <Metric
            label="色素沈着（跡）"
            from={first.pigmentation}
            to={latest.pigmentation}
            hint="残っている茶色っぽい跡の濃さ"
          />
        </div>

        <p className="mt-4 rounded-xl bg-[#f6f9f6] px-3 py-2.5 text-[12px] leading-relaxed text-stone-700">
          跡（色素沈着）は、赤みが落ち着いたあとに、ゆっくり薄くなっていくところです。
          炎症より遅れて変わるので、別々に見ています。
        </p>
      </section>

      {/* 毎回のコメント */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-bold text-stone-900">これまでの記録</h2>
        <ol className="mt-3 space-y-3">
          {[...list].reverse().map((a) => {
            const photo = demoProgressPhotos.find((p) => p.id === a.photoId);
            return (
              <li key={a.photoId} className="flex gap-3">
                <div className="flex flex-none flex-col items-center">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                  <span className="w-px flex-1 bg-stone-200" />
                </div>
                <div className="pb-1">
                  <p className="text-[11px] tabular-nums text-stone-400">
                    {fmt(a.assessedOn)}
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold text-stone-700">
                    炎症 {a.inflammation} ／ 跡 {a.pigmentation}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-600">
                    {a.note}
                  </p>
                  {photo?.caption ? (
                    <p className="mt-0.5 text-[11.5px] text-stone-400">
                      {photo.caption}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <Link
        href="/c/progress/compare"
        className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white text-[13px] font-semibold text-brand-700"
      >
        <GitCompare className="h-4 w-4" />
        写真をならべて比べる →
      </Link>

      <p className="text-[11px] leading-relaxed text-stone-500">
        写真はサロンが施術のたびに撮って残しています。ご自身で撮る必要はありません。
        撮影は毎回、同じ位置・同じ明るさでそろえています（{latestPhoto?.photoType === "after" ? "施術後" : "施術前"}）。
      </p>
    </div>
  );
}

/** 0〜5 の状態を、5つの点と前後比で出す。数字は評価ではない。 */
function Metric({
  label,
  from,
  to,
  hint,
}: {
  label: string;
  from: number;
  to: number;
  hint: string;
}) {
  const improved = to < from;
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-bold text-stone-900">{label}</span>
        <span className="text-[11px] text-stone-400">{hint}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <Dots value={from} muted />
        <span className="text-[11px] text-stone-300" aria-hidden>
          →
        </span>
        <Dots value={to} />
        <span
          className={`ml-auto text-[12px] font-bold tabular-nums ${
            improved ? "text-emerald-700" : "text-stone-500"
          }`}
        >
          {from} → {to}
        </span>
      </div>
    </div>
  );
}

function Dots({ value, muted = false }: { value: number; muted?: boolean }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            i <= value
              ? muted
                ? "bg-stone-300"
                : "bg-brand-500"
              : "bg-stone-100"
          }`}
        />
      ))}
    </span>
  );
}
