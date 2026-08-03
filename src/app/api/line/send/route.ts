import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";
import { assertCustomerInOrg, requireStaff } from "@/lib/auth/caller";
import { listConsents } from "@/lib/labtest/repository";
import { prepareLineMessage, pushLineMessage } from "@/lib/line/send";
import { redactSecrets } from "@/lib/line/channel";

/**
 * 店舗の公式アカウントから、患者へメッセージを送る。
 *
 * 同意の**強制点**その2（その1は /api/labtest/publish）。
 * `line_share` の同意が無い / 取り消されていれば 403。
 * 判定は勝手に作らず、公開のときと同じ純関数を通す。
 *
 * 本文の検査値も送信関数側で弾く。トーク履歴は端末に残り、
 * 家族に見られることもあり、退会後も消せないので、
 * 数値は置かずリンクだけを渡す設計をコードで守る。
 */

const Body = z.object({
  customerId: z.string().min(1).max(200),
  text: z.string().min(1).max(1000),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  if (isDemoMode()) {
    // デモは店舗の鍵を持たないので、実際には送らない。
    // ただし**判定は本番と同じ関数で行う**。素通しにすると、
    // 同意ゲートが効いていることを確かめられなくなる。
    const decision = prepareLineMessage({
      customerId: b.customerId,
      consents: [],
      text: b.text,
    });
    if (!decision.ok) {
      return NextResponse.json(
        { error: "not_sendable", reason: decision.reason },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const caller = await requireStaff();
  if ("response" in caller) return caller.response;
  const denied = await assertCustomerInOrg(b.customerId, caller.organizationId);
  if (denied) return denied;

  const db = await getServerSupabase();
  const consents = await listConsents(db, b.customerId);

  const decision = prepareLineMessage({
    customerId: b.customerId,
    consents,
    text: b.text,
  });
  if (!decision.ok) {
    // 理由はそのまま画面に出す。403 だけでは現場が動けない。
    return NextResponse.json(
      { error: "not_sendable", reason: decision.reason },
      { status: 403 },
    );
  }

  // 送り先の LINE ID。ひもづけが済んでいない人には送れない。
  const { data: customer } = await db
    .from("guide_customers")
    .select("line_user_id, name")
    .eq("id", b.customerId)
    .maybeSingle();
  const lineUserId = (customer as { line_user_id?: string | null } | null)
    ?.line_user_id;
  if (!lineUserId) {
    return NextResponse.json(
      {
        error: "not_linked",
        reason:
          "この方の LINE がまだひもづいていません。店頭で招待リンクからのご登録をお願いしてください。",
      },
      { status: 409 },
    );
  }

  // 店舗のトークンは service-role でしか読めない（RLS で管理者にも本文は返さない）。
  const admin = getAdminSupabase();
  const { data: channel } = await admin
    .from("line_channels")
    .select("channel_access_token")
    .eq("organization_id", caller.organizationId)
    .is("disconnected_at", null)
    .maybeSingle();
  const token = (channel as { channel_access_token?: string } | null)
    ?.channel_access_token;
  if (!token) {
    return NextResponse.json(
      {
        error: "not_connected",
        reason:
          "公式LINEがまだ接続されていません。設定 → 公式LINEの連携からご登録ください。",
      },
      { status: 409 },
    );
  }

  const result = await pushLineMessage(token, lineUserId, decision.text);
  if (!result.ok) {
    console.warn(redactSecrets(`[line-send] failed status=${result.status}`));
    return NextResponse.json(
      { error: "send_failed", reason: result.reason },
      { status: 502 },
    );
  }

  await logAudit({
    actorId: caller.userId,
    action: "create",
    targetType: "line_message",
    targetId: b.customerId,
    // 本文は残さない。何を送ったかより、誰にいつ送ったかが監査の関心。
    metadata: {
      organizationId: caller.organizationId,
      length: decision.text.length,
    },
  });

  return NextResponse.json({ ok: true });
}
