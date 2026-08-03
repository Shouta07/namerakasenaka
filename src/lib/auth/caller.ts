import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * 「誰が呼んでいるか」と「その人の店舗はどこか」を1か所で確かめる。
 *
 * なぜ共通化したか: service-role クライアントは RLS を迂回する。
 * そのキーを使うルートは、テナント境界を**自分で**守らなければならない。
 * 各ルートに書き写していると、いつか書き忘れる。実際、
 * /api/labtest/publish には呼び出し元の認証すら無い時期があった。
 *
 * 使い方:
 *   const caller = await requireStaff();
 *   if ("response" in caller) return caller.response;  // 401/403 をそのまま返す
 *   // 以降、caller.organizationId で必ず絞る
 */

export type Caller = {
  userId: string;
  organizationId: string;
  role: "salon_admin" | "therapist";
};

export type CallerResult = Caller | { response: NextResponse };

type StaffRole = Caller["role"];

export async function requireStaff(
  allowed: StaffRole[] = ["salon_admin", "therapist"],
): Promise<CallerResult> {
  const session = await getServerSupabase();
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) {
    return {
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  const { data: me } = await session
    .from("users")
    .select("role, organization_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  const row =
    (me as { role?: string; organization_id?: string | null } | null) ?? null;

  if (!row?.organization_id || !allowed.includes(row.role as StaffRole)) {
    return {
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }

  return {
    userId: auth.user.id,
    organizationId: row.organization_id,
    role: row.role as StaffRole,
  };
}

/**
 * 対象の患者が、その店舗のものであることを確かめる。
 * ID を知っているだけで他店舗のデータに触れられないようにするための関門。
 * 問題なければ null、あれば返すべきレスポンスを返す。
 */
export async function assertCustomerInOrg(
  customerId: string,
  organizationId: string,
): Promise<NextResponse | null> {
  const session = await getServerSupabase();
  const { data } = await session
    .from("guide_customers")
    .select("organization_id")
    .eq("id", customerId)
    .maybeSingle();
  const org = (data as { organization_id?: string } | null)?.organization_id;
  if (!org) {
    return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  }
  if (org !== organizationId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
