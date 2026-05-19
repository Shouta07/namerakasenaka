import { AtRiskList } from "@/components/admin/at-risk-list";

export const dynamic = "force-dynamic";

export default function AdminAtRiskPage() {
  // TODO(phase-1): wire production data — currently merged from fixtures +
  // localStorage in the client component below. Server compute requires
  // Supabase queries for clients, appointments, self_logs, messages, photos.
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-stone-900">離脱予兆</h1>
        <p className="mt-1 text-sm text-stone-600">
          高リスクから順に表示。テンプレートメッセージや次回予約打診で能動的にフォロー。
        </p>
      </header>
      <AtRiskList />
    </div>
  );
}
