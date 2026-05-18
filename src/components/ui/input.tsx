import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile-first text input. The base font-size is 16px to prevent iOS Safari
 * from zooming on focus, and the height is 44px so the tap target meets the
 * Apple HIG minimum.
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-base",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
        "disabled:bg-stone-100 disabled:text-stone-400",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
