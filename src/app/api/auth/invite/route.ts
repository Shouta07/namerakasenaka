import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

const Body = z.object({
  email: z.string().email(),
  targetRole: z.enum(["client", "therapist"]),
});

export async function POST(req: Request) {
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
  if (!meRow || (meRow.role !== "salon_admin" && meRow.role !== "super_admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!meRow.organization_id) {
    return NextResponse.json({ error: "no_organization" }, { status: 400 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const token = randomBytes(24).toString("base64url");

  const admin = getAdminSupabase();
  const { data: insert, error } = await admin
    .from("invites")
    .insert({
      organization_id: meRow.organization_id,
      target_role: parsed.data.targetRole,
      email: parsed.data.email,
      token,
      invited_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "invite_sent",
    targetType: "invites",
    targetId: (insert as { id: string }).id,
    metadata: { email: parsed.data.email, targetRole: parsed.data.targetRole },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const url = `${appUrl}/invite/${token}`;

  return NextResponse.json({ url, token });
}
