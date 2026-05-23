"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CustomerAvatar } from "@/components/ui/customer-avatar";

export type QuickSearchClient = {
  id: string;
  displayName: string;
  furigana: string;
  courseName: string;
  primaryTherapistName: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  avatarUrl: string;
};

/**
 * Small client-side search island for the salon admin home. Filters the
 * provided client roster by display name or furigana and renders compact rows
 * linking to the unified customer detail page.
 */
export function CustomerQuickSearch({ clients }: { clients: QuickSearchClient[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (c) =>
        c.displayName.toLowerCase().includes(term) ||
        c.furigana.toLowerCase().includes(term),
    );
  }, [q, clients]);

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="flex items-center gap-2 border-b border-stone-100 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-stone-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="顧客を検索（名前 / ふりがな）"
          className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
        />
        <span className="text-[11px] text-stone-400">{filtered.length} 件</span>
      </div>
      {filtered.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-stone-500">
          該当する顧客はいません。
        </p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {filtered.map((c) => {
            const pct = Math.round((c.sessionsCompleted / c.sessionsTotal) * 100);
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-stone-50"
                >
                  <CustomerAvatar name={c.displayName} size="sm" role="customer" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {c.displayName}
                    </p>
                    <p className="truncate text-[11px] text-stone-500">
                      {c.courseName} ・ 担当 {c.primaryTherapistName}
                    </p>
                  </div>
                  <div className="hidden w-32 flex-none sm:block">
                    <div className="h-1 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-stone-400">
                      {c.sessionsCompleted}/{c.sessionsTotal} 回
                    </p>
                  </div>
                  <span className="text-[11px] text-brand-700">詳細 →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
