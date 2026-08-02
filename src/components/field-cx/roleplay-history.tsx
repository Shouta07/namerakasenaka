"use client";

import { useEffect, useState } from "react";
import { ROLEPLAY_SCENARIOS } from "@/lib/field-cx/fixtures";
import { getRoleplayResults, type StoredRoleplayResult } from "@/lib/field-cx/store";
import { EmptyState } from "@/components/ui/empty-state";

/** この端末での練習履歴（デモ永続化）。 */
export function RoleplayHistory() {
  const [results, setResults] = useState<StoredRoleplayResult[] | null>(null);

  useEffect(() => {
    const sync = () => setResults(getRoleplayResults());
    sync();
    window.addEventListener("field-cx-store", sync);
    return () => window.removeEventListener("field-cx-store", sync);
  }, []);

  // 取得前は何も出さない（ちらつき防止）。0件は「まだ」を伝える。
  if (!results) return null;
  if (results.length === 0) {
    return (
      <EmptyState
        emoji="🎭"
        title="練習の記録は、ここに残ります"
        body="1回やってみると、5つの観点でのふり返りと点数が残ります。うまくできなくて大丈夫です。何度でもやり直せる相手なので、失敗しておく場所として使ってください。"
      />
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-[13px] font-bold text-stone-900">この端末での練習履歴</p>
      <ul className="mt-3 space-y-1.5">
        {results.slice(0, 6).map((r) => {
          const scenario = ROLEPLAY_SCENARIOS.find((s) => s.id === r.scenarioId);
          const d = new Date(r.at);
          return (
            <li key={r.id} className="flex items-baseline gap-3 text-[13px]">
              <span className="tabular-nums text-[11.5px] text-stone-400">
                {d.getMonth() + 1}/{d.getDate()}
              </span>
              <span className="flex-1 text-stone-700">
                {scenario?.title ?? r.scenarioId}
              </span>
              <span className="font-bold tabular-nums text-brand-700">
                {r.score}点
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
