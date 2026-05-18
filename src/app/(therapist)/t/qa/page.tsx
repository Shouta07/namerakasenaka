import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoQaThreads } from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ConversationRow = {
  id: string;
  client_id: string;
  last_message_at: string | null;
};

export default async function TherapistQaListPage() {
  if (isDemoMode()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Q&A</h1>
        <div className="space-y-2">
          {demoQaThreads.map((q) => (
            <Link key={q.id} href={`/t/qa/${q.id}`} className="block">
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{q.clientName} 様</p>
                    {q.unreadCount > 0 ? (
                      <Badge tone="warning">未読 {q.unreadCount}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-stone-700">{q.lastMessage}</p>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {new Date(q.lastMessageAt).toLocaleString("ja-JP")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }
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
