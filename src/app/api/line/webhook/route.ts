import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { acceptWebhook, redactSecrets } from "@/lib/line/channel";

/**
 * すべての店舗の公式LINEからの通知を、この1本で受ける。
 *
 * 店舗ごとにURLを分ける必要はない。本文の destination（宛先ボット）から
 * テナントを引けるため。ただし**順番を絶対に間違えないこと**:
 *
 *   1. 生の本文を、パースせずそのまま受け取る（署名は生バイト列に対する署名）
 *   2. destination だけを読む — この時点の本文は**まだ信用できない**
 *   3. その店舗のシークレットを引く
 *   4. そのシークレットで署名を検証する
 *   5. ここではじめて本文を信用してよい
 *
 * 2 で本文を読むのは「鍵を引くため」だけ。destination 以外の値を
 * 検証前に使ってはいけない。使った瞬間、誰でも偽のイベントを
 * 投げ込める入口になる。
 *
 * 応答について: LINE は 200 以外を再送のシグナルとして扱う。
 * 攻撃者からの偽リクエストに 4xx を返し続けても意味がないので、
 * **検証に落ちたものは 200 で静かに捨てる**（受理はしない）。
 * どのテナントで落ちたかはログに残す。
 */

export async function POST(req: Request) {
  // 生の本文。JSON.parse したものを署名検証に使ってはいけない
  // （キーの順序や空白が変わって、署名が一致しなくなる）。
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (isDemoMode()) {
    // デモでは店舗の鍵を持たないので、受理しようがない。
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const result = await acceptWebhook(rawBody, signature, lookupSecret);

  if (!result.ok) {
    console.warn(
      redactSecrets(`[line-webhook] rejected: ${result.reason}`),
    );
    // 再送を誘発しないよう 200 を返す。受理はしていない。
    return NextResponse.json({ ok: false, reason: result.reason });
  }

  // --- ここから先だけが、信用してよい領域 ---
  //
  // TODO(phase-1): イベントの処理。
  //   - follow    … 友だち追加。招待トークンとの突き合わせで患者にひもづける
  //   - message   … 週次テンプレへの返信を解析して記録に変える
  //   - unfollow  … ブロック。line_share の同意が実質切れた状態として扱う
  // 患者の識別子は必ず (organization_id, line_user_id) の組で扱うこと。
  // LINE のユーザーIDはプロバイダー単位で一意なので、
  // 単独では他店舗の同じ人と区別がつかない。

  return NextResponse.json({ ok: true });
}

/**
 * 宛先ボットから、その店舗のチャネルシークレットを引く。
 * 未接続・解除済みなら null（= 受理しない）。
 */
async function lookupSecret(destination: string): Promise<string | null> {
  const admin = getAdminSupabase();
  const { data } = await admin
    .from("line_channels")
    .select("channel_secret")
    .eq("bot_user_id", destination)
    .is("disconnected_at", null)
    .maybeSingle();
  const row = (data as { channel_secret?: string } | null) ?? null;
  return row?.channel_secret ?? null;
}
