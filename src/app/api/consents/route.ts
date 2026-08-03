import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { assertCustomerInOrg, requireStaff } from "@/lib/auth/caller";
import {
  insertConsent,
  listConsents,
  revokeConsentRow,
} from "@/lib/labtest/repository";

/**
 * 同意の記録と取り消し。
 *
 * 同意は**フラグではなく記録**。いつ・誰が・何について・どう確認したかを残す。
 * これが保存されないと、公開の可否を判定する材料そのものが存在しないので、
 * /api/labtest/publish の 403 が空回りする。
 *
 * 取り消しは行を消さず revoked_at を立てる。「取り消した」ことも履歴で、
 * もう一度お願いする前に理由を確認すべき状態だから残す。
 */

const GrantBody = z.object({
  customerId: z.string().min(1).max(200),
  scope: z.enum(["labtest_view", "line_share", "photo_view"]),
  method: z.enum(["店頭で口頭確認", "同意書に署名", "LINEで確認"]),
  grantedByName: z.string().max(120).default(""),
});

const RevokeBody = z.object({
  consentId: z.string().min(1).max(200),
  customerId: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => ({}));

  // 取り消しは同じ入口で受ける（現場から見ると「同意の操作」ひとつなので）。
  if (raw && typeof raw === "object" && "consentId" in raw) {
    const parsed = RevokeBody.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    return revoke(parsed.data);
  }

  const parsed = GrantBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;

  const denied = await assertCustomerInOrg(b.customerId, caller.organizationId);
  if (denied) return denied;

  const db = await getServerSupabase();
  const result = await insertConsent(db, {
    organizationId: caller.organizationId,
    customerId: b.customerId,
    scope: b.scope,
    grantedByUserId: caller.userId,
    grantedByName: b.grantedByName,
    method: b.method,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await logAudit({
    actorId: caller.userId,
    action: "create",
    targetType: "consent",
    targetId: result.id,
    metadata: { customerId: b.customerId, scope: b.scope, method: b.method },
  });

  return NextResponse.json({ ok: true, id: result.id });
}

async function revoke(b: z.infer<typeof RevokeBody>) {
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;

  const denied = await assertCustomerInOrg(b.customerId, caller.organizationId);
  if (denied) return denied;

  const db = await getServerSupabase();
  const { error } = await revokeConsentRow(
    db,
    caller.organizationId,
    b.consentId,
  );
  if (error) return NextResponse.json({ error }, { status: 500 });

  await logAudit({
    actorId: caller.userId,
    action: "update",
    targetType: "consent",
    targetId: b.consentId,
    metadata: { customerId: b.customerId, revoked: true },
  });
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const customerId = new URL(req.url).searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customer_required" }, { status: 400 });
  }
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo", consents: [] });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;

  const denied = await assertCustomerInOrg(customerId, caller.organizationId);
  if (denied) return denied;

  const db = await getServerSupabase();
  const consents = await listConsents(db, customerId);
  return NextResponse.json({ ok: true, consents });
}
