import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";

const Body = z.object({
  scheduledAt: z.string(),
  durationMin: z.number().int().positive().default(60),
  therapistId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .maybeSingle();
  const meRow = me as { role: string; organization_id: string | null } | null;
  if (!meRow?.organization_id) {
    return NextResponse.json({ error: "no_org" }, { status: 400 });
  }

  let clientId = parsed.data.clientId;
  let therapistId = parsed.data.therapistId;

  if (meRow.role === "client") {
    const { data: c } = await supabase
      .from("clients")
      .select("id, primary_therapist_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const row = c as { id: string; primary_therapist_id: string | null } | null;
    if (!row) return NextResponse.json({ error: "client_not_found" }, { status: 400 });
    clientId = row.id;
    therapistId = therapistId ?? row.primary_therapist_id ?? undefined;
  }

  if (!clientId || !therapistId) {
    return NextResponse.json({ error: "missing_assignments" }, { status: 400 });
  }

  // Conflict check (DB unique index also protects, but check first for nicer error).
  const { data: conflicts } = await supabase
    .from("appointments")
    .select("id")
    .eq("therapist_id", therapistId)
    .eq("scheduled_at", parsed.data.scheduledAt)
    .in("status", ["requested", "confirmed"]);
  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "slot_taken" }, { status: 409 });
  }

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({
      organization_id: meRow.organization_id,
      client_id: clientId,
      therapist_id: therapistId,
      scheduled_at: parsed.data.scheduledAt,
      duration_min: parsed.data.durationMin,
      status: "requested",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "create",
    targetType: "appointments",
    targetId: (inserted as { id: string }).id,
    metadata: { scheduledAt: parsed.data.scheduledAt },
  });

  return NextResponse.json({ id: (inserted as { id: string }).id });
}
