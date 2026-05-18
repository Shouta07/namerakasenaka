import { isDemoMode } from "@/lib/demo";

/**
 * Subtle "sample data" badge shown in role layouts when Supabase env is unset.
 * Positioned by the layout (typically top-right). Pure presentational element.
 */
export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-3 top-3 z-40 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm"
    >
      サンプルデータ表示中 — 本番接続後に実データへ切替わります
    </div>
  );
}
