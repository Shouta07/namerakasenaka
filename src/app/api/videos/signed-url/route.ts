import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";

const BUCKET = "progress-videos";
const EXPIRES = 60 * 15; // 15 minutes — mirrors progress photos.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("id");
  if (!videoId) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // RLS on treatment_videos enforces access scope.
  const { data: video, error } = await supabase
    .from("treatment_videos")
    .select("storage_path")
    .eq("id", videoId)
    .maybeSingle();
  if (error || !video) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: signed, error: sErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl((video as { storage_path: string }).storage_path, EXPIRES);
  if (sErr || !signed) {
    return NextResponse.json({ error: sErr?.message ?? "sign_failed" }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "signed_url_issued",
    targetType: "treatment_videos",
    targetId: videoId,
  });

  return NextResponse.json({ url: signed.signedUrl, expiresIn: EXPIRES });
}
