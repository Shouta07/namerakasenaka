import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

const Body = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  memo: z.string().max(2000).optional(),
  storagePath: z.string().optional(),
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

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const clientId = (client as { id?: string } | null)?.id;
  if (!clientId) return NextResponse.json({ error: "client_not_found" }, { status: 400 });

  const { data: inserted, error } = await supabase
    .from("meal_logs")
    .insert({
      client_id: clientId,
      meal_type: parsed.data.mealType,
      memo: parsed.data.memo ?? null,
      storage_path: parsed.data.storagePath ?? null,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Kick off AI draft asynchronously by inserting a placeholder feedback row.
  // The Edge Function (`generate-meal-feedback`) is expected to pick this up and
  // populate ai_draft. We use the admin client to bypass RLS for this system write.
  // TODO(phase-0): trigger the Edge Function via a Postgres NOTIFY or HTTP call
  // once Supabase project & secrets are wired up.
  const admin = getAdminSupabase();
  await admin.from("meal_feedbacks").insert({
    meal_log_id: (inserted as { id: string }).id,
    status: "ai_drafting",
  });

  return NextResponse.json({ id: (inserted as { id: string }).id });
}
