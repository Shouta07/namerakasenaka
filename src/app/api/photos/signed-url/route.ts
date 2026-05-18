import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { createSignedUrlForStoragePath } from "@/lib/storage/signed-url";

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

  const storagePath = (photo as { storage_path: string }).storage_path;
  let signed;
  try {
    signed = await createSignedUrlForStoragePath(storagePath, EXPIRES);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "sign_failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "signed_url_issued",
    targetType: "progress_photos",
    targetId: photoId,
    metadata: { provider: signed.provider },
  });

  return NextResponse.json({ url: signed.url, expiresIn: signed.expiresIn });
}
