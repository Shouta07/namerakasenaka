import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TherapistRow = {
  id: string;
  user_id: string;
  status: "active" | "on_leave" | "retired";
  hire_date: string | null;
  qualifications: string | null;
};

export default async function AdminStaffPage() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("therapists")
    .select("id, user_id, status, hire_date, qualifications")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as TherapistRow[];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">スタッフ</h1>
        <Link href="/admin/invites/new">
          <Button>セラピストを招待</Button>
        </Link>
      </header>
      <Card>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-stone-500">スタッフがいません。</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {rows.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">セラピスト {t.id.slice(0, 8)}</p>
                    <p className="text-xs text-stone-500">
                      入社: {t.hire_date ?? "—"} ・ 資格: {t.qualifications ?? "—"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      t.status === "active"
                        ? "success"
                        : t.status === "retired"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
