import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateRecoveryGuide,
  RecoveryGuideComplianceError,
} from "@/lib/ai/recovery-guide";

/**
 * Stateless generation endpoint — runs generateRecoveryGuide on raw fields
 * and returns the JSON without persisting anything.
 *
 * In demo mode the client stores the result in localStorage itself (the
 * server has no access to the demo store). In production this also powers
 * the admin "AIでガイドを生成" preview before saving.
 */

const Body = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(130).nullable().optional(),
  concern: z.string().max(2000).optional(),
  testResultMemo: z.string().max(8000).optional(),
  doctorComment: z.string().max(8000).optional(),
  salonMemo: z.string().max(8000).optional(),
  dietaryRestrictions: z.string().max(4000).optional(),
  currentProblem: z.string().max(4000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const b = parsed.data;

  try {
    const guide = await generateRecoveryGuide({
      name: b.name,
      age: b.age ?? null,
      concern: b.concern ?? "",
      testResultMemo: b.testResultMemo ?? "",
      doctorComment: b.doctorComment ?? "",
      salonMemo: b.salonMemo ?? "",
      dietaryRestrictions: b.dietaryRestrictions ?? "",
      currentProblem: b.currentProblem ?? "",
    });
    return NextResponse.json({
      guide,
      generatedAt: new Date().toISOString(),
    });
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
