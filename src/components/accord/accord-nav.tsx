"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { getModuleState } from "@/lib/accord/store";
import type { AccordModuleId } from "@/lib/accord/fixtures";

/**
 * ナビは4つまで。
 *
 * 毎日ひらくのは「お客様」だけ。「上達」は月1回、「検査翻訳」は商談と初回のとき。
 * 練習・数字・コパイロットを別々のタブに出すと、毎日の動線がぼやける —
 * それらは「上達」の中にまとめ、ナビからは外した。
 */
const NAV = [
  // 「概要」はロゴが担う。タブは日々ひらくものだけにする。
  { href: "/accord/customers", label: "お客様", module: "followup" as AccordModuleId },
  { href: "/accord/labtest", label: "検査翻訳", module: "labtest" as AccordModuleId },
  { href: "/accord/copilot", label: "上達", module: "copilot" as AccordModuleId },
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
        <Link href="/accord" className="flex min-h-11 items-baseline gap-2 self-center py-1">
          <span className="text-lg font-extrabold tracking-tight text-stone-900">
            Accord
          </span>
          <span className="hidden text-[11px] font-medium text-stone-400 sm:inline">
            血液検査 × 肌改善の継続伴走
          </span>
        </Link>

        {/* 端のフェードで、横に続きがあることを知らせる（モバイルでは必ずはみ出す） */}
        <nav
          aria-label="Accord のメニュー"
          className="scroll-fade-x ml-auto flex items-center gap-1 overflow-x-auto"
        >
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
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors",
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
