import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import { logAudit } from "@/lib/audit/log";

const TARGET_TYPES = [
  "photo",
  "self_log",
  "meal_log",
  "treatment_record",
  "qa_thread",
] as const;

const Body = z.object({
  targetType: z.enum(TARGET_TYPES),
  targetId: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(2000),
});

type ClientRow = {
  id: string;
  organization_id: string;
  primary_therapist_id: string | null;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const filter = containsBannedWord(parsed.data.body);
  if (!filter.ok) {
    return NextResponse.json(
      { error: "banned_words", hits: filter.hits },
      { status: 422 },
    );
  }

  const { data: me } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .maybeSingle();
  const meRow = (me as { role?: string; organization_id?: string | null } | null) ?? null;
  if (!meRow || (meRow.role !== "therapist" && meRow.role !== "salon_admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, organization_id, primary_therapist_id")
    .eq("id", clientId)
    .maybeSingle();
  const clientRow = (client as ClientRow | null) ?? null;
  if (!clientRow) {
    return NextResponse.json({ error: "client_not_found" }, { status: 404 });
  }

  if (meRow.role === "salon_admin") {
    if (clientRow.organization_id !== meRow.organization_id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    const therapistId = (therapist as { id?: string } | null)?.id;
    if (!therapistId || clientRow.primary_therapist_id !== therapistId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const { data: inserted, error } = await supabase
    .from("salon_notes")
    .insert({
      client_id: clientId,
      target_type: parsed.data.targetType,
      target_id: parsed.data.targetId,
      author_id: user.id,
      author_role: meRow.role,
      body: parsed.data.body,
    })
    .select("id, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit({
    actorId: user.id,
    action: "create",
    targetType: "salon_notes",
    targetId: (inserted as { id: string }).id,
    metadata: {
      client_id: clientId,
      note_target_type: parsed.data.targetType,
      note_target_id: parsed.data.targetId,
      author_role: meRow.role,
    },
  });

  return NextResponse.json({
    ok: true,
    id: (inserted as { id: string }).id,
    createdAt: (inserted as { created_at: string }).created_at,
  });
}
