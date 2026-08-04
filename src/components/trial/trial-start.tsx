"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import {
  TRIAL_DAYS,
  TRIAL_PROMISES,
  TRIAL_START_OPTIONS,
  TRIAL_STEPS,
  startTrial,
  type TrialStart as TrialStartId,
} from "@/lib/vitality-design/trial";
import { setDataset } from "@/lib/vitality-design/store";
import { clearStore } from "@/lib/demo/store";
import { cn } from "@/lib/utils/cn";

/**
 * お試しの入口。
 *
 * 並びに意図がある:
 *   1. 何を確かめられるか（3分で山場まで運ぶ順路）
 *   2. **データがどう扱われるか**
 *   3. 始め方
 *
 * ふつうは 1 → 3 だけで足りる。この商品では 2 が要る。
 * 試用のお客様は実際の患者さんの検査票を持っていて、
 * 「契約前の会社に渡してよいのか」で必ず手が止まるため。
 */
export function TrialStart() {
  const router = useRouter();
  const [choice, setChoice] = useState<TrialStartId>("sample");

  function begin() {
    startTrial(choice);
    // 「まっさらから」は導入初日と同じ状態にする。
    // 見本が残っていると、自分の運用を想像しにくい。
    if (choice === "empty") {
      clearStore();
      setDataset("dayone");
    } else {
      setDataset("full");
    }
    router.push("/admin/customers");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <p className="text-[12px] font-bold tracking-wider text-brand-700">
        VITALITY DESIGN
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-snug text-stone-900">
        検査結果が、患者さんに伝わる形になるまで。
        <br />
        3分で確かめてください。
      </h1>
      <p className="mt-3 text-[13.5px] leading-relaxed text-stone-600">
        資料をご請求いただきありがとうございます。
        読むより触るほうが早いので、そのまま試せる状態にしてあります。
        登録もお申し込みも要りません。
      </p>

      {/* 1. 順路 */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-stone-900">確かめていただくこと</h2>
        <ol className="mt-3 space-y-3">
          {TRIAL_STEPS.map((s) => (
            <li
              key={s.n}
              className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-50 text-[13px] font-bold text-brand-700">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-stone-900">{s.title}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-stone-600">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. データの扱い — この商品ではここが最初の関門 */}
      <section className="mt-8 rounded-2xl border border-[#cfe0cf] bg-[#f3f8f3] p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <ShieldCheck className="h-4 w-4 text-[#3c6347]" aria-hidden />
          お試し中のお約束
        </h2>
        <ul className="mt-3 space-y-3">
          {TRIAL_PROMISES.map((p) => (
            <li key={p.id} className="flex gap-2.5">
              <Check
                className="mt-0.5 h-4 w-4 flex-none text-[#3c6347]"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-stone-900">{p.label}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-600">
                  {p.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. 始め方 */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-stone-900">どちらから始めますか</h2>
        <div className="mt-3 space-y-2.5">
          {TRIAL_START_OPTIONS.map((o) => (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-2xl border p-4 transition",
                choice === o.id
                  ? "border-brand-500 bg-brand-50/40"
                  : "border-stone-200 bg-white hover:border-stone-300",
              )}
            >
              <input
                type="radio"
                name="trial-start"
                checked={choice === o.id}
                onChange={() => setChoice(o.id)}
                className="mt-0.5 h-5 w-5 flex-none accent-[#8c5a3c]"
              />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-stone-900">
                  {o.label}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-stone-600">
                  {o.detail}
                </span>
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={begin}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-6 text-[14px] font-bold text-white transition hover:bg-brand-500"
        >
          お試しをはじめる
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        <p className="mt-2 text-center text-[11.5px] leading-relaxed text-stone-500">
          目安は {TRIAL_DAYS} 日間です。期限で止まることはありません。
          頃合いでこちらからご連絡します。
        </p>
      </section>

      <p className="mt-8 text-center text-[12px] text-stone-500">
        先に画面だけ見たい方は{" "}
        <Link
          href="/vitality-design"
          className="font-bold text-brand-700 underline underline-offset-2"
        >
          サービスの概要
        </Link>{" "}
        へ。
      </p>
    </main>
  );
}
