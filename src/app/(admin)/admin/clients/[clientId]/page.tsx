import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import {
  demoClient,
  demoClientRoster,
  demoMealLogs,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";
import { MobileAppBar } from "@/components/ui/app-bar";
import { UnifiedCustomerDetail } from "@/components/clients/unified-customer-detail";
import type { SeedMessage } from "@/components/qa/interactive-thread";

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
    const qaConversationId = `qa-client-${client.id}`;
    const qaSeed: SeedMessage[] =
      client.id === demoClient.id
        ? [
            {
              id: `${qaConversationId}-seed-1`,
              body: "お疲れさまです。次回ご来店、楽しみにしております。",
              createdAt: "2026-05-17T18:00:00+09:00",
              isMine: true,
            },
            {
              id: `${qaConversationId}-seed-2`,
              body: "ありがとうございます。次回までにホームケアを継続してみます。",
              createdAt: "2026-05-17T20:15:00+09:00",
              isMine: false,
            },
          ]
        : [];

    const photos = demoProgressPhotos.filter((p) => p.clientId === client.id);
    const meals = demoMealLogs.filter((m) => m.clientId === client.id);
    const records = demoTreatmentRecords.filter((r) => r.clientId === client.id);

    return (
      <div className="space-y-2">
        <MobileAppBar
          title={client.displayName}
          eyebrow="SalonAdmin"
          backHref="/admin/clients"
        />
        <UnifiedCustomerDetail
          client={client}
          fixturePhotos={photos}
          fixtureMeals={meals}
          fixtureRecords={records}
          qaSeed={qaSeed}
          qaConversationId={qaConversationId}
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
