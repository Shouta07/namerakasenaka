"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** If true, on `sm:` and up the sheet is centered as a normal modal. */
  desktopCentered?: boolean;
};

/**
 * Lightweight bottom-sheet primitive for mobile. Slides up from the bottom,
 * dims the backdrop, and respects the home-indicator safe area. On `sm:` and
 * up it can fall back to a centered card if `desktopCentered` is true.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  desktopCentered = true,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      // Defer to next frame to allow the transition to play.
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  // backdrop-filter を持つ祖先（ヘッダ等）の中に置かれると、position:fixed が
  // ビューポートではなくその祖先を基準にしてしまう。body 直下に出して回避する。
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/45 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative flex w-full flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-200 ease-out",
          desktopCentered &&
            "sm:max-w-md sm:rounded-2xl",
          visible
            ? "translate-y-0"
            : "translate-y-full sm:translate-y-4",
          className,
        )}
        style={{
          paddingBottom: "max(var(--safe-bottom), 12px)",
        }}
      >
        <div className="flex items-center justify-center pt-2">
          <span
            aria-hidden
            className="h-1.5 w-10 rounded-full bg-stone-300 sm:hidden"
          />
        </div>
        {title ? (
          <div className="flex items-center justify-between px-5 pt-2 pb-1">
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="max-h-[70dvh] overflow-y-auto overscroll-contain px-5 pb-2 pt-3">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
