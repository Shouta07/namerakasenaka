import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";
import {
  generateRecoveryGuide,
  RecoveryGuideComplianceError,
} from "@/lib/ai/recovery-guide";

/**
 * Persisting generation endpoint (production path).
 *
 * POST { guideCustomerId } — requires staff auth, loads the latest
 * health_record, generates the guide, saves ai_summary_json and audit-logs.
 *
 * Demo mode has no server-side persistence (localStorage only), so the demo
 * client calls POST /api/recovery-guide/preview instead and stores the
 * returned JSON in the demo store itself.
 */

const Body = z.object({
  guideCustomerId: z.string().uuid(),
});

type GuideCustomerRow = {
  id: string;
  name: string;
  age: number | null;
  concern: string | null;
};

type HealthRecordRow = {
  id: string;
  test_result_memo: string | null;
  doctor_comment: string | null;
  salon_memo: string | null;
  dietary_restrictions: string | null;
  current_problem: string | null;
};

export async function POST(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      {
        error: "demo_mode",
        message:
          "デモモードでは /api/recovery-guide/preview を使用し、結果をクライアント側で保存します。",
      },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Staff auth — RLS on guide_customers gates the actual row access.
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Resolve through the user's own client so org RLS applies.
  const { data: customer } = await supabase
    .from("guide_customers")
    .select("id, name, age, concern")
    .eq("id", parsed.data.guideCustomerId)
    .maybeSingle();
  const guideCustomer = customer as GuideCustomerRow | null;
  if (!guideCustomer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: record } = await supabase
    .from("health_records")
    .select(
      "id, test_result_memo, doctor_comment, salon_memo, dietary_restrictions, current_problem",
    )
    .eq("guide_customer_id", guideCustomer.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const healthRecord = record as HealthRecordRow | null;
  if (!healthRecord) {
    return NextResponse.json({ error: "health_record_not_found" }, { status: 404 });
  }

  try {
    const guide = await generateRecoveryGuide({
      name: guideCustomer.name,
      age: guideCustomer.age,
      concern: guideCustomer.concern ?? "",
      testResultMemo: healthRecord.test_result_memo ?? "",
      doctorComment: healthRecord.doctor_comment ?? "",
      salonMemo: healthRecord.salon_memo ?? "",
      dietaryRestrictions: healthRecord.dietary_restrictions ?? "",
      currentProblem: healthRecord.current_problem ?? "",
    });

    const generatedAt = new Date().toISOString();
    const admin = getAdminSupabase();
    const { error: updateError } = await admin
      .from("health_records")
      .update({ ai_summary_json: guide, ai_generated_at: generatedAt })
      .eq("id", healthRecord.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await logAudit({
      actorId: user.id,
      action: "create",
      targetType: "recovery_guide",
      targetId: guideCustomer.id,
      metadata: { healthRecordId: healthRecord.id, generatedAt },
    });

    return NextResponse.json({ guide, generatedAt });
  } catch (err) {
    if (err instanceof RecoveryGuideComplianceError) {
      return NextResponse.json(
        { error: "banned_words", hits: err.hits, message: err.message },
        { status: 422 },
      );
    }
    return NextResponse.json(
      {
        error: "generation_failed",
        message: err instanceof Error ? err.message : "生成に失敗しました。",
      },
      { status: 500 },
    );
  }
}
