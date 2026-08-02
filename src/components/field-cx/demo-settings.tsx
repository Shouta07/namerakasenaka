"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings2, X } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ModulePanel } from "@/components/field-cx/module-panel";
import { DatasetSwitch, useDataset } from "@/components/field-cx/day-one";
import { setDataset } from "@/lib/field-cx/store";

/**
 * デモの設定への入口。
 *
 * webアプリはフッターまで到達されない。設定をフッターに置くと、
 * 「導入初日」に切り替えたあと戻し方が分からなくなる。
 * そのため入口はヘッダに常設し、状態が変わっているときは画面上部で知らせる。
 */
export function DemoSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="デモの設定をひらく"
        className="flex min-h-11 min-w-11 flex-none items-center justify-center gap-1.5 rounded-full border border-stone-200 px-3 text-[12px] font-bold text-stone-500 transition hover:border-brand-500 hover:text-brand-700"
      >
        <Settings2 className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">デモ設定</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="デモの設定">
        <div className="space-y-6 pb-2">
          <section>
            <p className="text-[12.5px] font-bold text-stone-900">表示するデータ</p>
            <div className="mt-2">
              <DatasetSwitch />
            </div>
          </section>

          <section>
            <p className="text-[12.5px] font-bold text-stone-900">
              機能の増減 — オフにするとナビからも消えます
            </p>
            <div className="mt-2">
              <ModulePanel compact />
            </div>
          </section>

          <Link
            href="/hub"
            className="inline-flex min-h-11 items-center text-[12.5px] font-bold text-brand-700 hover:underline"
          >
            すべての画面・資料を見る → /hub
          </Link>
        </div>
      </BottomSheet>
    </>
  );
}

/**
 * いま「導入初日」を見ていることを、画面の上で知らせる帯。
 *
 * 空の画面が続くと壊れているように見えるので、理由と戻し方を必ず同じ場所に置く。
 */
export function DatasetBanner() {
  const dataset = useDataset();
  if (dataset !== "dayone") return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2 sm:px-8">
        <p className="flex-1 text-[12.5px] font-semibold text-amber-900">
          導入初日の表示です — データがまだ1件も無い状態をお見せしています。
        </p>
        <button
          type="button"
          onClick={() => setDataset("full")}
          className="inline-flex min-h-11 items-center gap-1 rounded-full bg-amber-900 px-4 text-[12px] font-bold text-white hover:bg-amber-800"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          運用中の店舗に戻す
        </button>
      </div>
    </div>
  );
}
