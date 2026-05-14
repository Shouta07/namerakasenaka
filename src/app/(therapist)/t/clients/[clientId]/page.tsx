import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TreatmentRecordRow = {
  id: string;
  treatment_at: string;
  treatment_type: string;
  next_plan: string | null;
};

export default async function TherapistClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await getServerSupabase();

  const { data: client } = await supabase
    .from("clients")
    .select("id, skin_type, concerns")
    .eq("id", clientId)
    .maybeSingle();

  const { data: records } = await supabase
    .from("treatment_records")
    .select("id, treatment_at, treatment_type, next_plan")
    .eq("client_id", clientId)
    .order("treatment_at", { ascending: false })
    .limit(20);

  const rows = (records ?? []) as unknown as TreatmentRecordRow[];

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>過去の施術記録</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-stone-500">記録はまだありません。</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {rows.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="text-sm font-medium">{r.treatment_type}</p>
                  <p className="text-xs text-stone-500">
                    {new Date(r.treatment_at).toLocaleString("ja-JP")}
                  </p>
                  {r.next_plan ? (
                    <p className="mt-1 text-xs text-stone-700">次回: {r.next_plan}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
