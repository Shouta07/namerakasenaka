"use client";

import { useState } from "react";
import { toast } from "sonner";
import { isDemoMode } from "@/lib/demo";
import { clearStore } from "@/lib/demo/store";

/**
 * Subtle "sample data" badge shown in role layouts when Supabase env is unset.
 * Tap to reveal a "リセット" action that clears the demo localStorage namespace.
 */
export function DemoBanner() {
  const demo = isDemoMode();
  const [open, setOpen] = useState(false);
  if (!demo) return null;
  return (
    <div className="pointer-events-auto fixed right-3 top-3 z-40">
      <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm">
        <span>サンプルデータ表示中</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="メニューを開く"
          className="rounded-full px-1 text-amber-600 hover:bg-amber-100"
        >
          ⋯
        </button>
      </div>
      {open ? (
        <div className="mt-1 flex flex-col gap-1 rounded-lg border border-amber-200 bg-white p-2 text-[11px] shadow-md">
          <button
            type="button"
            onClick={() => {
              clearStore();
              toast.success("デモデータをリセットしました");
              setOpen(false);
              // Force a fresh hydrate after reset.
              if (typeof window !== "undefined") {
                setTimeout(() => window.location.reload(), 300);
              }
            }}
            className="rounded px-2 py-1 text-left text-stone-700 hover:bg-stone-100"
          >
            デモデータをリセット
          </button>
          <p className="px-2 pt-1 text-[10px] text-stone-400">
            本番接続後に実データへ切替わります
          </p>
        </div>
      ) : null}
    </div>
  );
}
