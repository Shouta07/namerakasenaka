import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { appendDisclaimer, containsBannedWord } from "@/lib/compliance/banned-words";
import { logAudit } from "@/lib/audit/log";

const Body = z.object({
  finalText: z.string().min(1).max(4000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((me as { role?: string } | null)?.role !== "nutritionist") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const filter = containsBannedWord(parsed.data.finalText);
  if (!filter.ok) {
    return NextResponse.json(
      { error: "banned_words", hits: filter.hits },
      { status: 422 },
    );
  }

  const finalText = appendDisclaimer(parsed.data.finalText);
  const { data: nutritionist } = await supabase
    .from("nutritionists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("meal_feedbacks")
    .update({
      final_text: finalText,
      status: "approved",
      approved_at: new Date().toISOString(),
      nutritionist_id: (nutritionist as { id?: string } | null)?.id ?? null,
      banned_word_hits: [],
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit({
    actorId: user.id,
    action: "approve",
    targetType: "meal_feedbacks",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
