import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-700 disabled:bg-brand-500/60",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  // 密なUI用の小さいボタン。見た目は36pxのまま、当たり判定だけ44pxに広げる
  // （指で押せない小ささを、視覚的な余白を増やさずに解消する）。
  sm: "relative h-9 px-3 text-sm after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
  md: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base font-semibold",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
