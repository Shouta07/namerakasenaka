import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoQaThreads } from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  therapist_id: string;
};

export default async function ClientQaListPage() {
  if (isDemoMode()) {
    // Client-side: show conversation with primary therapist (qa-1) plus any
    // additional demo threads.
    const threads = [
      {
        id: "qa-client-primary",
        clientName: "佐藤 美咲 さん（担当セラピスト）",
        lastMessage: "次回ご来店時、おすすめのケアをご案内します。",
        lastMessageAt: "2026-05-17T18:00:00+09:00",
        unreadCount: 0,
      },
      ...demoQaThreads,
    ];
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Q&A</h1>
        <div className="space-y-2">
          {threads.map((t) => (
            <Link key={t.id} href={`/c/qa/${t.id}`} className="block">
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t.clientName}</p>
                    {t.unreadCount > 0 ? (
                      <Badge tone="warning">未読 {t.unreadCount}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-stone-700">{t.lastMessage}</p>
                  <p className="mt-1 text-[11px] text-stone-500">
                    最終更新: {new Date(t.lastMessageAt).toLocaleString("ja-JP")}
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
    .select("id, last_message_at, therapist_id")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const rows = (data ?? []) as unknown as ConversationRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Q&A</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">スレッドはまだありません。</p>
      ) : (
        <div className="space-y-2">
          {rows.map((c) => (
            <Link key={c.id} href={`/c/qa/${c.id}`} className="block">
              <Card>
                <CardContent>
                  <p className="font-medium">担当セラピストとの会話</p>
                  <p className="mt-1 text-xs text-stone-500">
                    最終更新:{" "}
                    {c.last_message_at
                      ? new Date(c.last_message_at).toLocaleString("ja-JP")
                      : "なし"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
