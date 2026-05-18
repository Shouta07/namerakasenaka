import { isDemoMode } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-900">
      DEMO MODE — Supabase 未接続のため、表示はサンプルデータです。本番接続後に実データへ切り替わります。
    </div>
  );
}
