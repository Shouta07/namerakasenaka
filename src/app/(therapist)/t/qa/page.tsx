import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

type ConversationRow = {
  id: string;
  client_id: string;
  last_message_at: string | null;
};

export default async function TherapistQaListPage() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("conversations")
    .select("id, client_id, last_message_at")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const rows = (data ?? []) as unknown as ConversationRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Q&A</h1>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">スレッドはありません。</p>
        ) : (
          rows.map((c) => (
            <Link key={c.id} href={`/t/qa/${c.id}`} className="block">
              <Card>
                <CardContent>
                  <p className="font-medium">顧客 {c.client_id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    最終更新:{" "}
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleString("ja-JP")
                      : "なし"}
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
