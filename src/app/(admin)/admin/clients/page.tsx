import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

type ClientRow = {
  id: string;
  user_id: string;
  skin_type: string | null;
  concerns: string | null;
  primary_therapist_id: string | null;
};

export default async function AdminClientsPage() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("clients")
    .select("id, user_id, skin_type, concerns, primary_therapist_id")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ClientRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">顧客一覧</h1>
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-stone-500">顧客がいません。</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-stone-500">
                <tr>
                  <th className="py-2">ID</th>
                  <th className="py-2">肌タイプ</th>
                  <th className="py-2">悩み</th>
                  <th className="py-2">担当</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-t border-stone-100">
                    <td className="py-2 font-mono text-xs">{c.id.slice(0, 8)}</td>
                    <td className="py-2">{c.skin_type ?? "—"}</td>
                    <td className="py-2">{c.concerns ?? "—"}</td>
                    <td className="py-2">
                      {c.primary_therapist_id ? c.primary_therapist_id.slice(0, 8) : "—"}
                    </td>
                    <td className="py-2">
                      <Link
                        href={`/admin/clients/${c.id}/meals`}
                        className="text-sm text-brand-700 underline"
                      >
                        食事ログを見る
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
