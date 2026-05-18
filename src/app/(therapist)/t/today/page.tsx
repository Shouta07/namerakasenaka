import { getServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TreatmentDayCameraLauncher } from "@/components/progress/treatment-day-camera-launcher";
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus } from "@/types/domain";

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: AppointmentStatus;
  client_id: string;
};

export default async function TherapistTodayPage() {
  const supabase = await getServerSupabase();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const dayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("id, scheduled_at, duration_min, status, client_id")
    .gte("scheduled_at", dayStart)
    .lt("scheduled_at", dayEnd)
    .order("scheduled_at", { ascending: true });

  const rows = (data ?? []) as unknown as AppointmentRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">本日の予約</h1>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-500">本日の予約はありません。</p>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between sm:flex-1">
                  <div>
                    <p className="text-lg font-medium">
                      {new Date(a.scheduled_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-stone-500">所要 {a.duration_min}分</p>
                  </div>
                  <Badge tone={a.status === "confirmed" ? "success" : "neutral"}>
                    {APPOINTMENT_STATUS_LABEL[a.status]}
                  </Badge>
                </div>
                <div className="sm:flex-none">
                  <TreatmentDayCameraLauncher
                    clientId={a.client_id}
                    appointmentId={a.id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
