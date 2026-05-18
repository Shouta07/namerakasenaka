import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[88px] w-full rounded-lg border border-stone-200 bg-white p-3 text-base",
      "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
