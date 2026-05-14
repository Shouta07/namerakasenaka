import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

type ClientRow = {
  id: string;
  skin_type: string | null;
  concerns: string | null;
  user_id: string;
};

export default async function TherapistClientsPage() {
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
