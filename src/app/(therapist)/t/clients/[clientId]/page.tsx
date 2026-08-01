import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import {
  demoClient,
  demoClientRoster,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";
import { Button } from "@/components/ui/button";
import { MobileAppBar } from "@/components/ui/app-bar";
import { UnifiedCustomerDetail } from "@/components/clients/unified-customer-detail";

export default async function TherapistClientDetailPage({
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

    const photos = demoProgressPhotos.filter((p) => p.clientId === client.id);
    const records = demoTreatmentRecords.filter((r) => r.clientId === client.id);

    return (
      <div className="space-y-2">
        <MobileAppBar
          title={client.displayName}
          eyebrow="Therapist"
          backHref="/t/clients"
        />
        <UnifiedCustomerDetail
          client={client}
          fixturePhotos={photos}
          fixtureRecords={records}
          viewerRole="therapist"
          viewerName={client.primaryTherapistName}
        />
      </div>
    );
  }

  // Production branch: until the unified page is wired against real data, fall
  // back to the previous links-only view so deployed envs keep working.
  const supabase = await getServerSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("id, skin_type, concerns")
    .eq("id", clientId)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <MobileAppBar title="顧客カルテ" eyebrow="Therapist" backHref="/t/clients" />
      <header>
        <h1 className="text-2xl font-semibold">顧客カルテ</h1>
        <p className="mt-1 text-sm text-stone-600">
          肌タイプ: {(client as { skin_type?: string | null } | null)?.skin_type ?? "—"} ・ 悩み:{" "}
          {(client as { concerns?: string | null } | null)?.concerns ?? "—"}
        </p>
      </header>
      <div className="flex gap-2">
        <Link href={`/t/clients/${clientId}/records/new`}>
          <Button>施術記録を追加</Button>
        </Link>
        <Link href={`/t/clients/${clientId}/photos/new`}>
          <Button variant="secondary">進捗写真を追加</Button>
        </Link>
      </div>
    </div>
  );
}
