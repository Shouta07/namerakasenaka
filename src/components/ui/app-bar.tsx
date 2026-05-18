"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type MobileAppBarProps = {
  title: string;
  /** Optional small line above the title (eg. role label). */
  eyebrow?: string;
  /** If provided, back button navigates here; otherwise falls back to router.back(). */
  backHref?: string;
  /** If false, hides the back button entirely. */
  showBack?: boolean;
  /** Right-side slot — actions like settings, filter, etc. */
  right?: React.ReactNode;
  /** Controls visibility breakpoint. By default visible on `<md`. */
  className?: string;
};

/**
 * Sticky top app bar designed for iPhone Safari. Respects the device safe area
 * (notch / dynamic island). Renders only on mobile by default — desktop layouts
 * use the role sidebar instead.
 */
export function MobileAppBar({
  title,
  eyebrow,
  backHref,
  showBack = true,
  right,
  className,
}: MobileAppBarProps) {
  const router = useRouter();

  const handleBack = React.useCallback(() => {
    if (backHref) return; // Link handles it.
    router.back();
  }, [backHref, router]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 -mx-4 -mt-6 mb-4 border-b border-stone-200/80 bg-white/95 px-4 pt-safe backdrop-blur md:hidden",
        className,
      )}
    >
      <div className="flex min-h-12 items-center gap-2 pb-2">
        {showBack ? (
          backHref ? (
            <Link
              href={backHref}
              aria-label="戻る"
              className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-700"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              aria-label="戻る"
              className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-700"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )
        ) : (
          <span aria-hidden className="w-2" />
        )}
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-brand-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="truncate text-lg font-semibold leading-tight text-stone-900">
            {title}
          </h1>
        </div>
        {right ? <div className="flex items-center gap-1">{right}</div> : null}
      </div>
    </header>
  );
}
