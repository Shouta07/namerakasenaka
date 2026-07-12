"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { getModuleState } from "@/lib/accord/store";
import type { AccordModuleId } from "@/lib/accord/fixtures";

const NAV = [
  { href: "/accord", label: "概要", module: null },
  { href: "/accord/roleplay", label: "接客練習", module: "roleplay" as AccordModuleId },
  { href: "/accord/dashboard", label: "ダッシュボード", module: "dashboard" as AccordModuleId },
  { href: "/accord/customers", label: "顧客フォロー", module: "followup" as AccordModuleId },
  { href: "/accord/pricing", label: "料金", module: null },
];

/**
 * Accord のヘッダ + モジュール連動ナビ。
 * オフにしたモジュールのタブは消える（=「機能を増減できる」の体現）。
 */
export function AccordNav() {
  const pathname = usePathname();
  const [modules, setModules] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    const sync = () => setModules({ ...getModuleState() });
    sync();
    window.addEventListener("accord-store", sync);
    return () => window.removeEventListener("accord-store", sync);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <Link href="/accord" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-stone-900">
            Accord
          </span>
          <span className="hidden text-[11px] font-medium text-stone-400 sm:inline">
            初回カウンセリング支援
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          {NAV.filter((n) => !n.module || !modules || modules[n.module]).map(
            (n) => {
              const active =
                n.href === "/accord"
                  ? pathname === "/accord"
                  : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-brand-700 text-white"
                      : "text-stone-600 hover:bg-brand-50 hover:text-brand-700",
                  )}
                >
                  {n.label}
                </Link>
              );
            },
          )}
        </nav>
      </div>
    </header>
  );
}
