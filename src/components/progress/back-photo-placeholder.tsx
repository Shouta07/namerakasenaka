import { cn } from "@/lib/utils/cn";

/**
 * SVG-only placeholder that visualizes a human back from behind, with a
 * skin-tone gradient and severity-dependent "irritation" patches. Used to
 * make demo timeline photos visually tell a improvement story (week 1
 * severe → week 4 calm) without requiring real photo uploads.
 *
 * Pure server-renderable component — no client interactivity.
 */

export type BackPhotoSeverity = "high" | "medium" | "low" | "clear";
export type BackPhotoLighting = "cool" | "warm";

type Patch = {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
};

const PATCH_SEEDS: Patch[] = [
  // shoulders + upper lats
  { cx: 220, cy: 270, r: 32, opacity: 0.55 },
  { cx: 380, cy: 270, r: 28, opacity: 0.5 },
  { cx: 280, cy: 330, r: 22, opacity: 0.45 },
  { cx: 340, cy: 360, r: 26, opacity: 0.5 },
  { cx: 200, cy: 360, r: 20, opacity: 0.4 },
  { cx: 410, cy: 330, r: 24, opacity: 0.45 },
  { cx: 300, cy: 420, r: 18, opacity: 0.35 },
  { cx: 250, cy: 470, r: 16, opacity: 0.3 },
];

const SEVERITY_TO_PATCH_COUNT: Record<BackPhotoSeverity, number> = {
  high: 8,
  medium: 5,
  low: 2,
  clear: 0,
};

const SEVERITY_TINT_OPACITY: Record<BackPhotoSeverity, number> = {
  high: 1,
  medium: 0.7,
  low: 0.45,
  clear: 0.25,
};

function lightingGradient(lighting: BackPhotoLighting): {
  start: string;
  end: string;
} {
  if (lighting === "warm") {
    return { start: "#f5d8c4", end: "#e8b89e" };
  }
  return { start: "#efd0bd", end: "#d6a78a" };
}

function patchColor(severity: BackPhotoSeverity): string {
  if (severity === "high") return "#d96a6a";
  if (severity === "medium") return "#d98c8c";
  return "#caa090";
}

export function BackPhotoPlaceholder({
  severity = "medium",
  lighting = "warm",
  caption,
  className,
  rounded = true,
}: {
  severity?: BackPhotoSeverity;
  lighting?: BackPhotoLighting;
  caption?: string | null;
  className?: string;
  rounded?: boolean;
}) {
  const { start, end } = lightingGradient(lighting);
  const count = SEVERITY_TO_PATCH_COUNT[severity];
  const patches = PATCH_SEEDS.slice(0, count);
  const tintAlpha = SEVERITY_TINT_OPACITY[severity];
  const color = patchColor(severity);
  // Deterministic gradient id (no randomness — server/client matches).
  const gid = `back-${severity}-${lighting}`;

  return (
    <svg
      role="img"
      aria-label={caption ?? "進捗写真プレースホルダー"}
      viewBox="0 0 600 800"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "block h-full w-full bg-stone-100",
        rounded ? "" : "",
        className,
      )}
    >
      <defs>
        <linearGradient id={`${gid}-skin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
        <radialGradient id={`${gid}-vignette`} cx="50%" cy="40%" r="65%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </radialGradient>
      </defs>

      {/* Background — warm studio backdrop. */}
      <rect width="600" height="800" fill="#f4ebe2" />

      {/* Back silhouette — simplified shoulders + torso. */}
      <path
        d="M 180 230
           C 200 180, 240 160, 300 160
           C 360 160, 400 180, 420 230
           L 460 280
           C 470 300, 470 320, 450 340
           L 430 360
           L 430 560
           C 430 620, 400 660, 360 670
           L 240 670
           C 200 660, 170 620, 170 560
           L 170 360
           L 150 340
           C 130 320, 130 300, 140 280
           Z"
        fill={`url(#${gid}-skin)`}
      />

      {/* Subtle spine shading. */}
      <path
        d="M 300 200 L 300 640"
        stroke="rgba(120, 70, 50, 0.10)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Shoulder-blade hints. */}
      <ellipse
        cx="245"
        cy="320"
        rx="40"
        ry="55"
        fill="rgba(120, 70, 50, 0.06)"
      />
      <ellipse
        cx="355"
        cy="320"
        rx="40"
        ry="55"
        fill="rgba(120, 70, 50, 0.06)"
      />

      {/* Irritation patches scaled by severity. */}
      {patches.map((p, i) => (
        <circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill={color}
          opacity={p.opacity * tintAlpha}
        />
      ))}

      {/* Vignette. */}
      <rect width="600" height="800" fill={`url(#${gid}-vignette)`} />
    </svg>
  );
}

/**
 * Derives a severity bucket from a 1-5 self-rating where 5 = best.
 */
export function severityFromSelfRating(
  rating: number | null | undefined,
): BackPhotoSeverity {
  if (rating == null) return "medium";
  if (rating >= 5) return "clear";
  if (rating >= 4) return "low";
  if (rating >= 3) return "medium";
  return "high";
}
