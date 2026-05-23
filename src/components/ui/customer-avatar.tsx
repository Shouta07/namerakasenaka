import { cn } from "@/lib/utils/cn";

/**
 * Deterministic initials-based circular avatar.
 *
 * Warm palette for customers, cool palette for therapists — so the two roles
 * are visually distinct in mixed lists (e.g. today view, customer list).
 */
export type CustomerAvatarSize = "xs" | "sm" | "md" | "lg";
export type CustomerAvatarRole = "customer" | "therapist" | "neutral";

const SIZE_CLASSES: Record<CustomerAvatarSize, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const WARM_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "bg-rose-100", fg: "text-rose-700" },
  { bg: "bg-amber-100", fg: "text-amber-700" },
  { bg: "bg-orange-100", fg: "text-orange-700" },
  { bg: "bg-pink-100", fg: "text-pink-700" },
  { bg: "bg-fuchsia-100", fg: "text-fuchsia-700" },
  { bg: "bg-red-100", fg: "text-red-700" },
];

const COOL_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "bg-sky-100", fg: "text-sky-700" },
  { bg: "bg-teal-100", fg: "text-teal-700" },
  { bg: "bg-emerald-100", fg: "text-emerald-700" },
  { bg: "bg-indigo-100", fg: "text-indigo-700" },
];

const NEUTRAL_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "bg-stone-100", fg: "text-stone-700" },
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // For Japanese names, take the first character of family + given name pieces.
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`;
  }
  // Single token: take first 2 chars.
  return trimmed.slice(0, 2);
}

export function CustomerAvatar({
  name,
  size = "sm",
  role = "customer",
  className,
}: {
  name: string;
  size?: CustomerAvatarSize;
  role?: CustomerAvatarRole;
  className?: string;
}) {
  const palette =
    role === "therapist"
      ? COOL_PALETTE
      : role === "customer"
        ? WARM_PALETTE
        : NEUTRAL_PALETTE;
  const idx = hashString(name) % palette.length;
  const { bg, fg } = palette[idx];
  const initials = getInitials(name);

  return (
    <span
      aria-label={name}
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-full font-semibold tabular-nums",
        SIZE_CLASSES[size],
        bg,
        fg,
        className,
      )}
    >
      {initials}
    </span>
  );
}
