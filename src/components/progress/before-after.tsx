import { BackPhotoPlaceholder } from "@/components/progress/back-photo-placeholder";
import { demoClient, demoProgressPhotos } from "@/lib/demo/fixtures";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });

/**
 * 背中の変化を、2枚だけ並べて見せる。
 *
 * 経過を全部並べても「変わったのか」は分からない。
 * いちばん最初と、いちばん新しいものを横に置くのが、いちばん伝わる。
 */
export function BeforeAfter() {
  const mine = demoProgressPhotos
    .filter((p) => p.clientId === demoClient.id)
    .sort((a, b) => a.takenAt.localeCompare(b.takenAt));
  if (mine.length < 2) return null;

  const first = mine[0];
  const latest = mine[mine.length - 1];
  const days = Math.max(
    1,
    Math.round(
      (new Date(latest.takenAt).getTime() - new Date(first.takenAt).getTime()) /
        86_400_000,
    ),
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-stone-900">背中の変化</h2>
        <span className="text-[11px] text-stone-400">この {days} 日間</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { p: first, label: "はじめた日", date: fmt(first.takenAt) },
          { p: latest, label: "いちばん最近", date: fmt(latest.takenAt) },
        ].map(({ p, label, date }) => (
          <figure key={p.id}>
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl">
              <BackPhotoPlaceholder severity={p.severity} lighting={p.lighting} />
            </div>
            <figcaption className="mt-1.5">
              <p className="text-[11.5px] font-bold text-stone-700">{label}</p>
              <p className="text-[10.5px] tabular-nums text-stone-400">{date}</p>
              {p.selfRating != null ? (
                <p className="mt-1 flex items-center gap-1" aria-label={`実感 ${p.selfRating}/5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${
                        i <= p.selfRating! ? "bg-brand-500" : "bg-stone-200"
                      }`}
                    />
                  ))}
                  <span className="ml-0.5 text-[10.5px] font-bold text-stone-500">
                    実感 {p.selfRating}
                  </span>
                </p>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-stone-500">
        写真はサロンが施術のたびに撮って残しています。ご自身で撮る必要はありません。
      </p>
    </section>
  );
}
