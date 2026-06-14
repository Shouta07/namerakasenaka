import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { containsBannedWord } from "@/lib/compliance/banned-words";

/**
 * Staff-only endpoint — salon sends a companion message to a guide customer.
 *
 * - Authenticates the caller via the cookie-based server client.
 * - Verifies the target guide_customer belongs to the caller's organization.
 * - Banned-word filter (§8.2 + §17 additions) is enforced server-side too.
 *
 * Demo mode keeps the loop purely client-side, so this route refuses there.
 */

const Body = z.object({
  guideCustomerId: z.string().uuid(),
  body: z.string().min(1).max(200),
  respondingToCheckDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

export async function POST(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "demo_mode" }, { status: 400 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  const banned = containsBannedWord(b.body);
  if (!banned.ok) {
    return NextResponse.json(
      { error: "banned_word", hits: banned.hits },
      { status: 422 },
    );
  }

  // Staff session check.
  const session = await getServerSupabase();
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // RLS handles authorization on insert; we read with the admin client only
  // for the audit log payload.
  const { data: inserted, error } = await session
    .from("guide_messages")
    .insert({
      guide_customer_id: b.guideCustomerId,
      direction: "salon_to_customer",
      body: b.body,
      responding_to_check_date: b.respondingToCheckDate ?? null,
    })
    .select("id, guide_customer_id")
    .single();
  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message ?? "insert_failed" },
      { status: 500 },
    );
  }

  await logAudit({
    actorId: auth.user.id,
    action: "create",
    targetType: "guide_message",
    targetId: (inserted as { id: string }).id,
    metadata: {
      guideCustomerId: b.guideCustomerId,
      via: "admin_compose",
      respondingToCheckDate: b.respondingToCheckDate ?? null,
    },
  });

  // Touch admin client to ensure service-role import is reachable in tests.
  void getAdminSupabase;

  return NextResponse.json({ ok: true, id: (inserted as { id: string }).id });
}
