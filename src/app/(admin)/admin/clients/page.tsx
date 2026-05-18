import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { demoClientRoster } from "@/lib/demo/fixtures";
import { Badge } from "@/components/ui/badge";

type ClientRow = {
  id: string;
  user_id: string;
  skin_type: string | null;
  concerns: string | null;
  primary_therapist_id: string | null;
};

export default async function AdminClientsPage() {
  if (isDemoMode()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">顧客一覧</h1>
        <ul className="space-y-2">
          {demoClientRoster.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/clients/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 active:bg-stone-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.avatarUrl}
                  alt={c.displayName}
                  className="h-11 w-11 flex-none rounded-full bg-stone-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {c.displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {c.courseName} ・ {c.primaryTherapistName} ・ {c.skinType}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {c.sessionsCompleted}/{c.sessionsTotal} 回
                  </p>
                </div>
                <Badge tone="neutral">
                  {c.sessionsCompleted}/{c.sessionsTotal}
                </Badge>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("clients")
    .select("id, user_id, skin_type, concerns, primary_therapist_id")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as ClientRow[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">顧客一覧</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">顧客がいません。</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-stone-200 bg-white p-3"
            >
              <Link
                href={`/admin/clients/${c.id}`}
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-stone-100 font-mono text-[10px] text-stone-500">
                  {c.id.slice(0, 4)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-stone-500">{c.id.slice(0, 8)}</p>
                  <p className="mt-0.5 truncate text-sm text-stone-700">
                    {c.skin_type ?? "—"} ・ {c.concerns ?? "—"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
