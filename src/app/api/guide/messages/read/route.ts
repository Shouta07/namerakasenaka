import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

/**
 * Customer-side endpoint — marks a salon→customer companion message as read.
 *
 * Called from /share/[token] (no session). The share_token is the credential:
 * we resolve it via the service-role client, then update read_at only if the
 * message belongs to that guide customer.
 *
 * Demo mode handles this client-side via markStoredGuideMessageRead; this
 * route refuses there so the two paths stay separate.
 */

const Body = z.object({
  token: z.string().min(8).max(200),
  messageId: z.string().uuid(),
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

  // Only flips null→now; idempotent if already read.
  const { error } = await admin
    .from("guide_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", b.messageId)
    .eq("guide_customer_id", guideCustomerId)
    .is("read_at", null);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: null,
    action: "update",
    targetType: "guide_message",
    targetId: b.messageId,
    metadata: { via: "share_page_read" },
  });

  return NextResponse.json({ ok: true });
}
