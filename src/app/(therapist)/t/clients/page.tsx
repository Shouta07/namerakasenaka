import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoClient, demoClientRoster } from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ClientRow = {
  id: string;
  skin_type: string | null;
  concerns: string | null;
  user_id: string;
};

export default async function TherapistClientsPage() {
  if (isDemoMode()) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">担当顧客</h1>
        <div className="space-y-2">
          {demoClientRoster.map((c) => (
            <Link
              key={c.id}
              href={c.id === demoClient.id ? `/t/clients/${c.id}` : "/t/clients"}
              className="block"
            >
              <Card>
                <CardContent className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatarUrl}
                    alt={c.displayName}
                    className="h-10 w-10 flex-none rounded-full bg-stone-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{c.displayName}</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {c.courseName} ・ {c.sessionsCompleted}/{c.sessionsTotal} 回
                    </p>
                  </div>
                  {c.id === demoClient.id ? (
                    <Badge tone="brand">詳細を見る</Badge>
                  ) : null}
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
