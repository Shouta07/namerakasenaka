"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type FabProps = {
  label: string;
  /** Optional href — renders as a Link instead of a button. */
  href?: string;
  /** Click handler when used as button. */
  onClick?: () => void;
  /** Icon to render alongside the label. */
  icon?: React.ReactNode;
  /** Override styles. */
  className?: string;
  /** If true, the FAB is rendered hidden on `md:` and up. */
  mobileOnly?: boolean;
};

/**
 * Floating action button anchored bottom-right above the safe area and above
 * the bottom navigation. Use sparingly — one primary action per page.
 */
export function Fab({
  label,
  href,
  onClick,
  icon,
  className,
  mobileOnly = false,
}: FabProps) {
  const classes = cn(
    "fixed right-4 z-30 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 active:bg-brand-700",
    mobileOnly && "md:hidden",
    className,
  );
  // Bottom = bottom-nav height (≈64) + safe-area inset + comfortable gap.
  const style: React.CSSProperties = {
    bottom: "calc(72px + max(var(--safe-bottom), 12px))",
  };

  if (href) {
    return (
      <Link href={href} className={classes} style={style} aria-label={label}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={style}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
