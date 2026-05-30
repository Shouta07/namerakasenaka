import { cn } from "@/lib/utils/cn";

/**
 * Deterministic palette square avatar showing the anonymous_id letter(s).
 * Used in case cards in place of CustomerAvatar (which is for named people).
 */
const PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "bg-brand-100", fg: "text-brand-700" },
  { bg: "bg-stone-200", fg: "text-stone-800" },
  { bg: "bg-amber-100", fg: "text-amber-800" },
  { bg: "bg-rose-100", fg: "text-rose-700" },
  { bg: "bg-emerald-100", fg: "text-emerald-700" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function AnonymousAvatar({
  id,
  size = "md",
  className,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const idx = hashString(id) % PALETTE.length;
  const { bg, fg } = PALETTE[idx];
  const label = id.replace(/^C-?/, "").slice(-3).padStart(3, "0");
  const sizing =
    size === "lg"
      ? "h-12 w-12 text-sm"
      : size === "sm"
        ? "h-8 w-8 text-[10px]"
        : "h-10 w-10 text-xs";
  return (
    <span
      aria-label={id}
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-xl font-semibold tabular-nums",
        sizing,
        bg,
        fg,
        className,
      )}
    >
      {label}
    </span>
  );
}
