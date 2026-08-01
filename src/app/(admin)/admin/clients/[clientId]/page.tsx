import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import {
  demoClient,
  demoClientRoster,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";
import { MobileAppBar } from "@/components/ui/app-bar";
import { UnifiedCustomerDetail } from "@/components/clients/unified-customer-detail";
import { RecoveryGuideChip } from "@/components/guide/recovery-guide-chip";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  if (isDemoMode()) {
    const client =
      demoClientRoster.find((c) => c.id === clientId) ??
      (clientId === demoClient.id ? demoClient : null);
    if (!client) notFound();

    // Q&A: only client-yamada has rich seed; others get a generic stub.

    const photos = demoProgressPhotos.filter((p) => p.clientId === client.id);
    const records = demoTreatmentRecords.filter((r) => r.clientId === client.id);

    return (
      <div className="space-y-2">
        <MobileAppBar
          title={client.displayName}
          eyebrow="SalonAdmin"
          backHref="/admin/clients"
        />
        <div className="flex justify-end">
          <RecoveryGuideChip clientId={client.id} clientName={client.displayName} />
        </div>
        <UnifiedCustomerDetail
          client={client}
          fixturePhotos={photos}
          fixtureRecords={records}
          viewerRole="salon_admin"
          viewerName="サロン管理者"
        />
      </div>
    );
  }

  // Non-demo branch: minimal placeholder using the same component shape.
  // Production wiring would resolve real photos/meals/records via Supabase
  // here. For now we render a stub message.
  return (
    <div className="space-y-4">
      <MobileAppBar
        title="顧客詳細"
        eyebrow="SalonAdmin"
        backHref="/admin/clients"
      />
      <h1 className="text-2xl font-semibold">顧客詳細</h1>
      <p className="text-sm text-stone-600">
        顧客ID: <span className="font-mono">{clientId}</span>
      </p>
      <p className="text-sm text-stone-500">
        本番接続では、ここに統合顧客詳細画面が表示されます。
      </p>
    </div>
  );
}
