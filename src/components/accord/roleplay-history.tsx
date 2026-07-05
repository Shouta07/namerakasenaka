"use client";

import { useEffect, useState } from "react";
import { ROLEPLAY_SCENARIOS } from "@/lib/accord/fixtures";
import { getRoleplayResults, type StoredRoleplayResult } from "@/lib/accord/store";

/** この端末での練習履歴（デモ永続化）。 */
export function RoleplayHistory() {
  const [results, setResults] = useState<StoredRoleplayResult[] | null>(null);

  useEffect(() => {
    const sync = () => setResults(getRoleplayResults());
    sync();
    window.addEventListener("accord-store", sync);
    return () => window.removeEventListener("accord-store", sync);
  }, []);

  if (!results || results.length === 0) return null;

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
