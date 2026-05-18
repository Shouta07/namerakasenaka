import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { Card, CardContent } from "@/components/ui/card";

type ConversationRow = {
  id: string;
  last_message_at: string | null;
  therapist_id: string;
};

export default async function ClientQaListPage() {
  if (isDemoMode()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Q&A</h1>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-stone-900">
              担当セラピストとの会話
            </p>
            <p className="mt-1 text-xs text-stone-500">
              サンプル表示では会話の送受信は行いません。本番接続後にチャット履歴が表示されます。
            </p>
          </CardContent>
        </Card>
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
