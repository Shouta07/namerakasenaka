import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";

const BUCKET = "progress-photos";
const EXPIRES = 60 * 15; // 15 minutes — §4.2 acceptance criterion.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("id");
  if (!photoId) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // RLS on progress_photos ensures only authorised roles see the row.
  const { data: photo, error } = await supabase
    .from("progress_photos")
    .select("storage_path")
    .eq("id", photoId)
    .maybeSingle();
  if (error || !photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: signed, error: sErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl((photo as { storage_path: string }).storage_path, EXPIRES);
  if (sErr || !signed) {
    return NextResponse.json({ error: sErr?.message ?? "sign_failed" }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "signed_url_issued",
    targetType: "progress_photos",
    targetId: photoId,
  });

  return NextResponse.json({ url: signed.signedUrl, expiresIn: EXPIRES });
}
