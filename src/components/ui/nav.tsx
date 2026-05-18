"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

export type NavItem = {
  href: string;
  label: string;
  /** lucide-react icon component for the mobile bottom nav. Required for `MobileBottomNav`. */
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function RoleNav({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-stone-200 bg-white px-4 py-6 md:block">
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
        {title}
      </p>
      <nav className="mt-4 space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-stone-700 hover:bg-stone-50",
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * Persistent bottom nav for mobile. Items get a 44pt min hit area, the active
 * route gets a filled-style icon + brand-colored label, and the bar respects
 * the home-indicator safe area.
 *
 * Limit to 5 items per role; the layout overflows otherwise.
 */
export function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(var(--safe-bottom), 6px)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {items.slice(0, 5).map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 pt-2 pb-1 text-[10px] font-medium",
                  active ? "text-brand-700" : "text-stone-500",
                )}
              >
                {Icon ? (
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-transform",
                      active && "scale-105",
                    )}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                ) : null}
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Back-compat shim — older code imports `MobileNav`. Forwards to the new
 * bottom-nav implementation.
 * @deprecated use `MobileBottomNav`
 */
export const MobileNav = MobileBottomNav;
