"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getDataset, setDataset, type AccordDataset } from "@/lib/accord/store";

/** 現在のデータ母集団。未取得のあいだは null（ちらつき防止）。 */
export function useDataset(): AccordDataset | null {
  const [dataset, setLocal] = useState<AccordDataset | null>(null);
  useEffect(() => {
    const sync = () => setLocal(getDataset());
    sync();
    window.addEventListener("accord-store", sync);
    return () => window.removeEventListener("accord-store", sync);
  }, []);
  return dataset;
}

/**
 * 初日（データ0件）のときだけ `empty` を出す。
 *
 * サーバーコンポーネントのページはそのままに、この境界だけをクライアントに
 * することで、一覧の中身は静的に配信したまま初日を差し替えられる。
 */
export function DayOneGate({
  empty,
  children,
}: {
  empty: ReactNode;
  children: ReactNode;
}) {
  const dataset = useDataset();
  // 取得前はデータありを描く（既定値と同じ）ので、通常時にちらつかない。
  if (dataset === "dayone") return <>{empty}</>;
  return <>{children}</>;
}

/** 「データあり / 初日」の切り替え。商談でも、実装確認でも使う。 */
export function DatasetSwitch() {
  const dataset = useDataset();
  const current = dataset ?? "full";

  function choose(next: AccordDataset) {
    if (next === current) return;
    setDataset(next);
    toast(
      next === "dayone"
        ? "導入初日（データがまだ無い状態）に切り替えました"
        : "運用中の店舗のデータに戻しました",
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <div
        className="flex rounded-full border border-stone-200 bg-white p-0.5"
        role="group"
        aria-label="表示するデータ"
      >
        {(
          [
            ["full", "運用中の店舗"],
            ["dayone", "導入初日"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={current === k}
            onClick={() => choose(k)}
            className={`min-h-11 rounded-full px-4 text-[12.5px] font-bold transition ${
              current === k
                ? "bg-brand-700 text-white"
                : "text-stone-500 hover:text-brand-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[11.5px] leading-relaxed text-stone-500">
        契約直後、まだ1件も無いときに何が出るか
        — いちばん解約に近い画面も、そのままお見せします。
      </p>
    </div>
  );
}
