import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type StickyActionBarProps = {
  children: React.ReactNode;
  className?: string;
  /** When true, on `md:` and up the bar reverts to inline-flow (no sticky). */
  mobileOnly?: boolean;
};

/**
 * Bottom sticky action bar for forms — pins the primary CTA above the home
 * indicator while content scrolls behind it. Sits above the bottom nav by
 * default; pages without a bottom nav (login, invite) can disable that offset
 * by passing className overrides.
 */
export function StickyActionBar({
  children,
  className,
  mobileOnly = true,
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky -mx-4 mt-4 border-t border-stone-200 bg-white/95 px-4 backdrop-blur",
        // On mobile sit just above the bottom nav (≈64px high).
        "bottom-[64px]",
        mobileOnly && "md:static md:bottom-auto md:mx-0 md:border-0 md:bg-transparent md:p-0",
        className,
      )}
      style={{
        paddingTop: "12px",
        paddingBottom: "max(var(--safe-bottom), 12px)",
      }}
    >
      {children}
    </div>
  );
}
