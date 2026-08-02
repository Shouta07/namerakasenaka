import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import {
  maskSecret,
  redactSecrets,
  secretFingerprint,
  validateChannelInput,
} from "@/lib/line/channel";

/**
 * 店舗が、自分の公式LINEをこのシステムに接続する。
 *
 * 責任分界をコードで表す:
 * - **登録できるのはその店舗のオーナーだけ**。当社が代行入力しない以上、
 *   セラピストにも自社にも、この操作は開けない。
 * - 受け取ったシークレットとトークンは、**レスポンスに一切返さない**。
 *   返すのはマスクと指紋だけ。「入れたものを確認したい」に対しては
 *   指紋で答える（鍵を見せずに同一性を示せる）。
 * - 監査ログに鍵を載せない。エラー時のダンプが最頻の漏れ口なので、
 *   ログへ出す文字列は必ず redactSecrets() を通す。
 *
 * デモモードでは保存自体を行わず、検証と指紋の計算だけを返す。
 * デモで本物の鍵を受け取ってしまわないための線引きでもある。
 */

const Body = z.object({
  channelId: z.string().max(64),
  channelSecret: z.string().max(256),
  channelAccessToken: z.string().max(4096),
  botUserId: z.string().min(1).max(64),
  /** 「この公式アカウントは当店のもの」への同意。無ければ受け付けない。 */
  acknowledged: z.boolean(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  if (!b.acknowledged) {
    return NextResponse.json(
      {
        error: "acknowledgement_required",
        reason:
          "この公式アカウントが当店のものであることの確認にチェックを入れてください。",
      },
      { status: 400 },
    );
  }

  const validation = validateChannelInput(b);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "invalid_channel", fields: validation.errors },
      { status: 422 },
    );
  }

  // 画面に返してよい形だけを先に作っておく。
  const safe = {
    channelId: b.channelId.trim(),
    botUserId: b.botUserId.trim(),
    maskedSecret: maskSecret(b.channelSecret),
    secretFingerprint: secretFingerprint(b.channelSecret),
  };

  if (isDemoMode()) {
    // デモでは保存しない。本物の鍵をデモ環境に置かせないため。
    return NextResponse.json({ ok: true, mode: "demo", ...safe });
  }

  // 登録できるのは、その店舗のオーナーだけ。
  const session = await getServerSupabase();
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: me } = await session
    .from("users")
    .select("role, organization_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  const meRow =
    (me as { role?: string; organization_id?: string | null } | null) ?? null;
  if (!meRow?.organization_id || meRow.role !== "salon_admin") {
    return NextResponse.json(
      {
        error: "forbidden",
        reason:
          "公式LINEの接続は、店舗の管理者アカウントからのみ行えます。",
      },
      { status: 403 },
    );
  }

  const admin = getAdminSupabase();
  const { error } = await admin.from("line_channels").upsert(
    {
      organization_id: meRow.organization_id,
      channel_id: safe.channelId,
      bot_user_id: safe.botUserId,
      // TODO(phase-1): channel_secret / access_token は KMS で包んでから入れる。
      // アプリのDB暗号化だけに頼らない（ダンプが漏れても使えない状態にする）。
      channel_secret: b.channelSecret,
      channel_access_token: b.channelAccessToken,
      secret_fingerprint: safe.secretFingerprint,
      connected_by: auth.user.id,
      connected_at: new Date().toISOString(),
      disconnected_at: null,
    },
    { onConflict: "organization_id" },
  );
  if (error) {
    // エラー文にリクエストの断片が乗ることがある。必ず潰してから返す。
    return NextResponse.json(
      { error: redactSecrets(error.message) },
      { status: 500 },
    );
  }

  await logAudit({
    actorId: auth.user.id,
    action: "create",
    targetType: "line_channel",
    targetId: safe.channelId,
    // 鍵は載せない。載せてよいのは指紋まで。
    metadata: {
      organizationId: meRow.organization_id,
      botUserId: safe.botUserId,
      secretFingerprint: safe.secretFingerprint,
    },
  });

  return NextResponse.json({ ok: true, ...safe });
}

/**
 * 連携の解除。店舗が「やめる」と言った瞬間に消せること。
 * 消したことを店舗に見せられるよう、監査ログにも残す。
 */
export async function DELETE() {
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const session = await getServerSupabase();
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: me } = await session
    .from("users")
    .select("role, organization_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  const meRow =
    (me as { role?: string; organization_id?: string | null } | null) ?? null;
  if (!meRow?.organization_id || meRow.role !== "salon_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = getAdminSupabase();
  // 無効化ではなく削除する。預かる理由が無くなったものは、持たない。
  const { error } = await admin
    .from("line_channels")
    .delete()
    .eq("organization_id", meRow.organization_id);
  if (error) {
    return NextResponse.json(
      { error: redactSecrets(error.message) },
      { status: 500 },
    );
  }

  await logAudit({
    actorId: auth.user.id,
    action: "delete",
    targetType: "line_channel",
    targetId: meRow.organization_id,
    metadata: { organizationId: meRow.organization_id },
  });

  return NextResponse.json({ ok: true });
}
