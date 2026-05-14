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

  const admin = getAdminSupabase();
  const { data: feedback, error: fbError } = await admin
    .from("meal_feedbacks")
    .insert({
      meal_log_id: (inserted as { id: string }).id,
      status: "ai_drafting",
    })
    .select("id")
    .single();
  if (fbError || !feedback) {
    return NextResponse.json({ error: fbError?.message ?? "feedback_insert_failed" }, { status: 500 });
  }

  const feedbackId = (feedback as { id: string }).id;
  void invokeMealFeedbackFunction(feedbackId);

  return NextResponse.json({ id: (inserted as { id: string }).id, feedbackId });
}

async function invokeMealFeedbackFunction(feedbackId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.warn("[meal-logs] skipping edge function: SUPABASE env not configured");
    return;
  }
  try {
    const res = await fetch(`${url}/functions/v1/generate-meal-feedback`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${serviceKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ feedbackId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[meal-logs] edge function ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error("[meal-logs] edge function invocation failed", err);
  }
}
