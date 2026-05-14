"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export type NavItem = { href: string; label: string };

export function RoleNav({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-stone-200 bg-white px-4 py-6 md:block">
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
        {title}
      </p>
      <nav className="mt-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-stone-700 hover:bg-stone-50",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-10 flex border-t border-stone-200 bg-white md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 py-3 text-center text-xs",
              active ? "text-brand-700 font-semibold" : "text-stone-500",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
