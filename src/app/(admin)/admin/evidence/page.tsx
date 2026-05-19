import { EvidenceDashboard } from "@/components/admin/evidence-dashboard";

export const dynamic = "force-dynamic";

export default function AdminEvidencePage() {
  // TODO(phase-1): wire production data — read clients, photos, self_logs,
  // treatment_records from Supabase and pass into the pure evidence engine.
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-stone-900">エビデンス</h1>
        <p className="mt-1 text-sm text-stone-600">
          サロン全体の進捗サマリと、顧客ごとの改善トレンドを把握できます。
          レポートはブラウザの印刷機能から PDF 出力できます。
        </p>
      </header>
      <EvidenceDashboard />
    </div>
  );
}
