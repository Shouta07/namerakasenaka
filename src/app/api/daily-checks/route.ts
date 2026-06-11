import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

/**
 * Customer check-in endpoint for the public share page (/share/[token]).
 *
 * No session auth — the share_token IS the credential. The token is resolved
 * to a guide_customer via the service-role client (RLS has no anonymous path
 * on purpose; see migration 0009), then the day's check is upserted on
 * (guide_customer_id, date).
 *
 * In demo mode the share page writes to localStorage instead; this route
 * still answers 200 so the client island can share one code path.
 */

const Body = z.object({
  token: z.string().min(8).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  actionDone: z.boolean(),
  skinCondition: z.number().int().min(1).max(5).nullable().optional(),
  bodyCondition: z.number().int().min(1).max(5).nullable().optional(),
  memo: z.string().max(1000).nullable().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  if (isDemoMode()) {
    // Demo persistence happens client-side (localStorage).
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const admin = getAdminSupabase();
  const { data: customer } = await admin
    .from("guide_customers")
    .select("id")
    .eq("share_token", b.token)
    .maybeSingle();
  const guideCustomerId = (customer as { id?: string } | null)?.id;
  if (!guideCustomerId) {
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });
  }

  const { error } = await admin.from("daily_checks").upsert(
    {
      guide_customer_id: guideCustomerId,
      date: b.date,
      action_done: b.actionDone,
      skin_condition: b.skinCondition ?? null,
      body_condition: b.bodyCondition ?? null,
      memo: b.memo ?? null,
    },
    { onConflict: "guide_customer_id,date" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: null,
    action: "create",
    targetType: "daily_check",
    targetId: guideCustomerId,
    metadata: { date: b.date, via: "share_page" },
  });

  return NextResponse.json({ ok: true });
}
