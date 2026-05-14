import { getServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { RecordForm } from "@/components/treatment/record-form";

type LastRecord = {
  treatment_type: string;
  products_used: string | null;
  next_plan: string | null;
};

export default async function NewTreatmentRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ appointment?: string }>;
}) {
  const { clientId } = await params;
  const sp = await searchParams;
  const supabase = await getServerSupabase();

  // Defaults from latest record — supports the 90-second input target (§4.6).
  const { data: last } = await supabase
    .from("treatment_records")
    .select("treatment_type, products_used, next_plan")
    .eq("client_id", clientId)
    .order("treatment_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastRow = (last as LastRecord | null) ?? null;

  // Find or pick an appointment. For MVP scaffold we accept ?appointment=<id>.
  let appointmentId = sp.appointment ?? "";
  if (!appointmentId) {
    const { data: appt } = await supabase
      .from("appointments")
      .select("id")
      .eq("client_id", clientId)
      .order("scheduled_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    appointmentId = (appt as { id?: string } | null)?.id ?? "";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">施術記録（目標90秒）</h1>
      <p className="text-xs text-stone-500">
        前回の記録から自動でデフォルト値が入力されています。必須は施術内容のみです。
      </p>
      <Card>
        <CardContent>
          <RecordForm
            clientId={clientId}
            appointmentId={appointmentId}
            defaults={
              lastRow
                ? {
                    treatmentType: lastRow.treatment_type,
                    productsUsed: lastRow.products_used ?? "",
                    nextPlan: lastRow.next_plan ?? "",
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
