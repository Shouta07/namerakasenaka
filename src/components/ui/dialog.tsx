"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Dialog({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cn("w-full max-w-md rounded-2xl bg-white p-6 shadow-xl", className)}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-stone-500 hover:text-stone-700"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
