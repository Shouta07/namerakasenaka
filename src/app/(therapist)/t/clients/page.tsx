import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { Card, CardContent } from "@/components/ui/card";
import { TherapistClientsList } from "@/components/admin/therapist-clients-list";

type ClientRow = {
  id: string;
  skin_type: string | null;
  concerns: string | null;
  user_id: string;
};

const THERAPIST_NAME = "佐藤 美咲";

export default async function TherapistClientsPage() {
  if (isDemoMode()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">担当顧客</h1>
        <TherapistClientsList primaryTherapistName={THERAPIST_NAME} />
      </div>
    );
  }
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("clients")
    .select("id, skin_type, concerns, user_id")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ClientRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">担当顧客</h1>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">担当顧客がいません。</p>
        ) : (
          rows.map((c) => (
            <Link key={c.id} href={`/t/clients/${c.id}`} className="block">
              <Card>
                <CardContent>
                  <p className="font-medium">顧客 {c.id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {c.skin_type ?? "肌タイプ未登録"} ・ {c.concerns ?? "悩み未登録"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
