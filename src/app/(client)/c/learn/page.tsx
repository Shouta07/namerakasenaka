export const dynamic = "force-dynamic";

import { LessonsCard } from "@/components/lessons/lessons-card";
import { LESSONS } from "@/lib/lessons/fixtures";
import { DEMO_GUIDE_CUSTOMERS } from "@/lib/demo/recovery-fixtures";
import { demoClient } from "@/lib/demo/fixtures";

export const metadata = { title: "学ぶ" };

/**
 * 学ぶ — むずかしい医学の話を、読みものと短い動画で。
 *
 * いま中身があるのは「腸のおはなし」7章だけ。棚を先に増やしても
 * 空の棚が並ぶだけなので、あるものを前に出し、これからのものは
 * 予定として正直に置く。
 */
const COMING = [
  { emoji: "🩸", title: "血液検査の読み方", note: "各項目の意味を3分の動画で" },
  { emoji: "🍽", title: "食事", note: "外食・コンビニでの選び方" },
  { emoji: "😴", title: "睡眠", note: "寝る前の30分をどう使うか" },
  { emoji: "🧴", title: "スキンケア", note: "背中の洗い方・保湿の順番" },
  { emoji: "💊", title: "サプリ", note: "足りないときだけ、必要なぶんだけ" },
];

export default function ClientLearnPage() {
  const customer = DEMO_GUIDE_CUSTOMERS.find(
    (c) => c.clientId === demoClient.id,
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-stone-900">学ぶ</h1>
        <p className="mt-1 text-[12.5px] leading-relaxed text-stone-500">
          むずかしい医学の話を、やさしいことばに直しています。
          1話3分ほど。移動中や寝る前にどうぞ。
        </p>
      </header>

      {/* いま読めるコース */}
      <section>
        <h2 className="text-sm font-bold text-stone-900">
          🌱 腸のおはなし（全 {LESSONS.length} 話）
        </h2>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-500">
          背中に出る理由を、おなかの側から順にたどるコースです。
        </p>
        <div className="mt-2">
          {customer ? (
            <LessonsCard guideCustomerId={customer.id} />
          ) : (
            <p className="rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-6 text-center text-[12.5px] text-stone-500">
              まもなく読めるようになります。
            </p>
          )}
        </div>
      </section>

      {/* これから */}
      <section>
        <h2 className="text-sm font-bold text-stone-900">これから増えるもの</h2>
        <ul className="mt-2 space-y-2">
          {COMING.map((c) => (
            <li
              key={c.title}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-3"
            >
              <span className="text-lg" aria-hidden>
                {c.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-stone-700">
                  {c.title}
                </span>
                <span className="block text-[11.5px] text-stone-500">{c.note}</span>
              </span>
              <span className="flex-none rounded-full bg-stone-100 px-2 py-0.5 text-[10.5px] font-bold text-stone-500">
                準備中
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
          新しい話が出たときは、LINE でお知らせします。
        </p>
      </section>
    </div>
  );
}
