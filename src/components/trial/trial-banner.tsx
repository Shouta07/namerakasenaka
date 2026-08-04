"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import {
  TRIAL_DAYS,
  endTrial,
  readTrial,
  trialDay,
  type TrialState,
} from "@/lib/vitality-design/trial";
import { clearStore } from "@/lib/demo/store";
import { usePresentationMode } from "@/components/presentation-mode";

/**
 * お試し中であることを、常に見えるところに置く。
 *
 * ふつうバナーは邪魔なので出したくない。ここでは出す理由がある:
 *
 * - 試用のお客様は、実際の患者さんの検査票を入れる可能性がある。
 *   「この端末から出ません」は**入力する瞬間に見えていないと意味がない**
 * - お試しだと忘れたまま本番運用に入られると、事故になる
 *
 * 商談で画面を見せるときは邪魔なので、プレゼンモードでは隠す。
 */
export function TrialBanner() {
  const [trial, setTrial] = useState<TrialState | null>(null);
  const [open, setOpen] = useState(false);
  const { active: presenting } = usePresentationMode();

  useEffect(() => {
    setTrial(readTrial());
  }, []);

  if (!trial || presenting) return null;

  const day = trialDay(trial, new Date());

  return (
    <div className="sticky top-0 z-30 border-b border-[#cfe0cf] bg-[#f3f8f3]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <ShieldCheck
          className="h-4 w-4 flex-none text-[#3c6347]"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-[11.5px] leading-snug text-stone-700">
          <span className="font-bold">お試し中</span>
          <span className="mx-1.5 text-stone-400">·</span>
          {day}日目 / 目安{TRIAL_DAYS}日
          <span className="mx-1.5 text-stone-400">·</span>
          <span className="font-bold text-[#3c6347]">
            入力したデータはこの端末から出ません
          </span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="tap-44 flex-none text-[11.5px] font-bold text-brand-700 underline"
        >
          詳しく
        </button>
      </div>

      {open ? (
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <div className="rounded-xl bg-white p-3.5">
            <p className="text-[12px] leading-relaxed text-stone-700">
              検査の数値は、お使いのブラウザの中だけに保存されています。
              当社のサーバーには送信していないため、実際の患者さんの検査票で
              お試しいただいて構いません。LINE への送信も行いません。
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/vitality-design/pricing"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-700 px-4 text-[12.5px] font-bold text-white hover:bg-brand-500"
              >
                導入について相談する
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearStore();
                  endTrial();
                  toast.success("お試しのデータを消しました");
                  setTrial(null);
                  setTimeout(() => window.location.reload(), 400);
                }}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stone-300 px-4 text-[12.5px] font-bold text-stone-600 hover:border-stone-500"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                お試しデータを消す
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
