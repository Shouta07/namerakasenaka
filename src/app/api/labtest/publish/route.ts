import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";
import {
  canPublishLabtest,
  type ConsentRecord,
} from "@/lib/labtest/consent";

/**
 * 検査結果を、患者ご本人の画面に出す / 取り下げる。
 *
 * ここが同意の**強制点**。画面でボタンを隠すのは親切であって、強制ではない。
 * 同意の記録が無い / 取り消されている状態で公開しようとしたら 403 を返す。
 * 監査 B2（同意なし送信のサーバ強制が無い）に対する答えがこれ。
 *
 * 取り下げ（published=false）に同意は要らない。
 * 見せるのを止める操作を、同意の有無で止めてはいけない。
 *
 * デモモード（Supabase 未接続）でも同意チェックだけは同じ関数で行う。
 * デモだから素通し、にすると「同意ゲートが効いている」ことを確認できない。
 */

const Body = z.object({
  importId: z.string().min(1).max(200),
  customerId: z.string().min(1).max(200),
  published: z.boolean(),
  /** デモモードでは同意の記録がブラウザ側にあるため、判定材料として受け取る。 */
  consents: z
    .array(
      z.object({
        id: z.string(),
        customerId: z.string(),
        scope: z.enum(["labtest_view", "line_share", "photo_view"]),
        grantedAt: z.string(),
        grantedBy: z.string(),
        revokedAt: z.string().nullable(),
        method: z.enum(["店頭で口頭確認", "同意書に署名", "LINEで確認"]),
      }),
    )
    .max(200)
    .optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  if (b.published) {
    const records: ConsentRecord[] = isDemoMode()
      ? (b.consents ?? [])
      : await loadConsents(b.customerId);
    const decision = canPublishLabtest(records, b.customerId);
    if (!decision.ok) {
      // 理由はそのまま画面に出す。「403」だけ返しても現場は動けない。
      return NextResponse.json(
        { error: "consent_required", reason: decision.reason },
        { status: 403 },
      );
    }
  }

  if (isDemoMode()) {
    // 保存はブラウザ側（localStorage）。ここは同意の判定だけを担う。
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const admin = getAdminSupabase();
  const { error } = await admin
    .from("lab_imports")
    .update({ published_at: b.published ? new Date().toISOString() : null })
    .eq("id", b.importId)
    .eq("customer_id", b.customerId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    actorId: null,
    action: b.published ? "approve" : "reject",
    targetType: "lab_import",
    targetId: b.importId,
    metadata: { customerId: b.customerId, published: b.published },
  });

  return NextResponse.json({ ok: true });
}

/** 本番の同意記録を読む。TODO(phase-1) の consents テーブルに対応する。 */
async function loadConsents(customerId: string): Promise<ConsentRecord[]> {
  const admin = getAdminSupabase();
  const { data } = await admin
    .from("consents")
    .select("id, customer_id, scope, granted_at, granted_by, revoked_at, method")
    .eq("customer_id", customerId);
  return ((data ?? []) as unknown as Array<Record<string, string | null>>).map(
    (r) => ({
      id: String(r.id),
      customerId: String(r.customer_id),
      scope: r.scope as ConsentRecord["scope"],
      grantedAt: String(r.granted_at),
      grantedBy: String(r.granted_by),
      revokedAt: r.revoked_at,
      method: r.method as ConsentRecord["method"],
    }),
  );
}
