import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DemoAppointmentsList } from "@/components/appointments/demo-appointments-list";
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from "@/types/domain";

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: AppointmentStatus;
  notes: string | null;
};

export default async function ClientAppointmentsPage() {
  if (isDemoMode()) {
    return <DemoAppointmentsList />;
  }
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, duration_min, status, notes")
    .order("scheduled_at", { ascending: true });

  const rows = (data ?? []) as unknown as AppointmentRow[];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">予約</h1>
        <Link href="/c/appointments/new">
          <Button>新規予約</Button>
        </Link>
      </header>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">予約はまだありません。</p>
        ) : (
          rows.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {new Date(a.scheduled_at).toLocaleString("ja-JP")}
                  </p>
                  <p className="text-xs text-stone-500">所要 {a.duration_min}分</p>
                </div>
                <Badge tone={a.status === "confirmed" ? "success" : "neutral"}>
                  {APPOINTMENT_STATUS_LABEL[a.status]}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
