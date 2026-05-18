import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import { logAudit } from "@/lib/audit/log";

const Body = z.object({
  body: z.string().trim().min(1).max(2000),
});

type MealLogJoinedClient = {
  id: string;
  client_id: string;
  clients: {
    id: string;
    organization_id: string;
    primary_therapist_id: string | null;
  } | null;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: mealLogId } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Banned-word filter is the single source of truth — applied here so the
  // §8.2 list lives only in src/lib/compliance/banned-words.ts.
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

  // Resolve meal_log → client → org/therapist for the scope check.
  const { data: mealLog } = await supabase
    .from("meal_logs")
    .select("id, client_id, clients:client_id ( id, organization_id, primary_therapist_id )")
    .eq("id", mealLogId)
    .maybeSingle();
  const ml = mealLog as unknown as MealLogJoinedClient | null;
  if (!ml || !ml.clients) {
    return NextResponse.json({ error: "meal_log_not_found" }, { status: 404 });
  }

  if (meRow.role === "salon_admin") {
    if (ml.clients.organization_id !== meRow.organization_id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  } else {
    // therapist: must be the assigned (primary) therapist
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    const therapistId = (therapist as { id?: string } | null)?.id;
    if (!therapistId || ml.clients.primary_therapist_id !== therapistId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const { data: inserted, error } = await supabase
    .from("meal_log_comments")
    .insert({
      meal_log_id: mealLogId,
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
    targetType: "meal_log_comments",
    targetId: (inserted as { id: string }).id,
    metadata: { meal_log_id: mealLogId, author_role: meRow.role },
  });

  return NextResponse.json({
    ok: true,
    id: (inserted as { id: string }).id,
    createdAt: (inserted as { created_at: string }).created_at,
  });
}
