"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FIELD_CX_CUSTOMERS } from "@/lib/field-cx/fixtures";
import {
  CUSTOMER_STATUSES,
  filterCustomers,
  type CustomerStatus,
} from "@/lib/field-cx/filter";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_STYLE: Record<string, string> = {
  契約中: "bg-emerald-50 text-emerald-700",
  提案中: "bg-amber-50 text-amber-700",
  体験予約: "bg-stone-100 text-stone-600",
};

/**
 * 顧客一覧 — 検索と絞り込みつき。
 * 一覧は「増えたときに壊れないか」で価値が決まる。
 */
export function CustomerList() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "all">("all");

  const results = useMemo(
    () => filterCustomers(FIELD_CX_CUSTOMERS, query, status),
    [query, status],
  );
  const filtering = query.trim() !== "" || status !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前・担当・お悩みで探す"
            aria-label="顧客を探す"
            className="h-11 w-full rounded-full border border-stone-200 bg-white pl-10 pr-10 text-[13.5px] placeholder:text-stone-400 focus:border-brand-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="検索をクリア"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="scroll-fade-x -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
          {(["all", ...CUSTOMER_STATUSES] as const).map((s) => {
            const on = status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setStatus(s)}
                className={cn(
                  "min-h-11 whitespace-nowrap rounded-full px-4 text-[12.5px] font-bold transition",
                  on
                    ? "bg-brand-700 text-white"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-brand-500",
                )}
              >
                {s === "all" ? "すべて" : s}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] text-stone-500" aria-live="polite">
        {results.length} 名
        {filtering ? `（全 ${FIELD_CX_CUSTOMERS.length} 名中）` : ""}
      </p>

      {results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="条件に合う方がいませんでした"
          body="別のことばで探すか、絞り込みを外してみてください。ふりがな・担当者名・お悩みのことばでも探せます。"
        >
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-5 text-[13px] font-bold text-stone-700 hover:border-brand-500"
          >
            絞り込みを外す
          </button>
        </EmptyState>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {results.map((c) => (
            <Link
              key={c.id}
              href={`/field-cx/customers/${c.id}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[15.5px] font-bold text-stone-900">
                  {c.name}{" "}
                  <span className="text-[12px] font-medium text-stone-400">
                    （{c.age}）
                  </span>
                </p>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    STATUS_STYLE[c.status],
                  )}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-stone-500">{c.statusNote}</p>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-stone-600">
                {c.concern}
              </p>
              <div className="mt-3 border-t border-stone-100 pt-2.5">
                <p className="text-[11px] font-bold text-brand-700">次のアクション</p>
                <p className="mt-0.5 text-[12.5px] text-stone-700">{c.nextAction}</p>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
                <span>担当：{c.assignedTo}</span>
                <span>{c.lineConsent ? "💬 LINE同意あり" : "LINE未同意"}</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
