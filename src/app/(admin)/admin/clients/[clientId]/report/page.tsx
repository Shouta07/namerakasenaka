import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import {
  demoClient,
  demoClientRoster,
  demoOrganization,
  demoProgressPhotos,
  demoTreatmentRecords,
} from "@/lib/demo/fixtures";
import { ProgressReport } from "@/components/admin/progress-report";

export const dynamic = "force-dynamic";

export default async function AdminClientReportPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  if (!isDemoMode()) {
    // TODO(phase-1): wire production data via Supabase queries for the client,
    // photos, self_logs, treatment_records. For now render the demo fallback.
  }

  const client =
    demoClientRoster.find((c) => c.id === clientId) ??
    (clientId === demoClient.id ? demoClient : null);
  if (!client) notFound();

  const photos = demoProgressPhotos.filter((p) => p.clientId === client.id);
  const records = demoTreatmentRecords.filter((r) => r.clientId === client.id);

  return (
    <ProgressReport
      salonName={demoOrganization.name}
      client={client}
      seedPhotos={photos}
      seedRecords={records}
    />
  );
}
