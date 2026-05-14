import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { containsBannedWord } from "@/lib/compliance/banned-words";
import { AFTER_HOURS_AUTO_REPLY, isWithinBusinessHours } from "@/lib/business-hours";

const Body = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const filter = containsBannedWord(parsed.data.body);
  if (!filter.ok) {
    return NextResponse.json(
      { error: "banned_words", hits: filter.hits },
      { status: 422 },
    );
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: parsed.data.conversationId,
    sender_id: user.id,
    body: parsed.data.body,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", parsed.data.conversationId);

  // After-hours auto-reply, only when the sender is a Client.
  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (me as { role?: string } | null)?.role;
  if (role === "client" && !isWithinBusinessHours(new Date())) {
    const admin = getAdminSupabase();
    const { data: conv } = await admin
      .from("conversations")
      .select("therapist_id")
      .eq("id", parsed.data.conversationId)
      .maybeSingle();
    const therapistId = (conv as { therapist_id?: string } | null)?.therapist_id;
    if (therapistId) {
      const { data: therapist } = await admin
        .from("therapists")
        .select("user_id")
        .eq("id", therapistId)
        .maybeSingle();
      const senderId = (therapist as { user_id?: string } | null)?.user_id;
      if (senderId) {
        await admin.from("messages").insert({
          conversation_id: parsed.data.conversationId,
          sender_id: senderId,
          body: AFTER_HOURS_AUTO_REPLY,
          is_auto_reply: true,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
