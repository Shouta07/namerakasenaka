import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";

const Body = z.object({
  token: z.string().min(8),
  name: z.string().min(1),
  password: z.string().min(8).regex(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: "パスワードは英数字混在で8文字以上",
  }),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const admin = getAdminSupabase();

  const { data: invite } = await admin
    .from("invites")
    .select("id, organization_id, target_role, email, expires_at, consumed_at")
    .eq("token", parsed.data.token)
    .maybeSingle();

  const inviteRow = invite as
    | {
        id: string;
        organization_id: string;
        target_role: "client" | "therapist";
        email: string;
        expires_at: string;
        consumed_at: string | null;
      }
    | null;

  if (!inviteRow) {
    return NextResponse.json({ error: "invite_not_found" }, { status: 404 });
  }
  if (inviteRow.consumed_at) {
    return NextResponse.json({ error: "invite_already_used" }, { status: 410 });
  }
  if (new Date(inviteRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "invite_expired" }, { status: 410 });
  }

  // Create auth user.
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: inviteRow.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (authErr || !created.user) {
    return NextResponse.json(
      { error: authErr?.message ?? "auth_user_create_failed" },
      { status: 500 },
    );
  }

  const userId = created.user.id;

  await admin.from("users").insert({
    id: userId,
    email: inviteRow.email,
    role: inviteRow.target_role,
    organization_id: inviteRow.organization_id,
    status: "active",
  });
  await admin.from("profiles").insert({ user_id: userId, name: parsed.data.name });

  if (inviteRow.target_role === "client") {
    await admin.from("clients").insert({
      user_id: userId,
      organization_id: inviteRow.organization_id,
    });
  } else {
    await admin.from("therapists").insert({
      user_id: userId,
      organization_id: inviteRow.organization_id,
      status: "active",
    });
  }

  await admin.from("invites").update({ consumed_at: new Date().toISOString() }).eq("id", inviteRow.id);

  await logAudit({
    actorId: userId,
    action: "invite_accepted",
    targetType: "invites",
    targetId: inviteRow.id,
    metadata: { role: inviteRow.target_role },
  });

  return NextResponse.json({ ok: true });
}
