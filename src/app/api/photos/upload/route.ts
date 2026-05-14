import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import type { PhotoType } from "@/types/domain";

const ALLOWED_TYPES: PhotoType[] = ["before", "after", "reference"];
const BUCKET = "progress-photos";
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const file = form.get("file");
  const clientId = String(form.get("clientId") ?? "");
  const photoType = String(form.get("photoType") ?? "") as PhotoType;
  const caption = (form.get("caption") as string | null) ?? null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(photoType)) {
    return NextResponse.json({ error: "invalid_photo_type" }, { status: 400 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("organization_id")
    .eq("id", clientId)
    .maybeSingle();
  const orgId = (client as { organization_id?: string } | null)?.organization_id;
  if (!orgId) return NextResponse.json({ error: "client_not_found" }, { status: 404 });

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const photoId = randomUUID();
  const storagePath = `${orgId}/${clientId}/${photoId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(arrayBuffer), {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const { data: inserted, error: dbErr } = await supabase
    .from("progress_photos")
    .insert({
      id: photoId,
      client_id: clientId,
      uploaded_by: user.id,
      storage_path: storagePath,
      photo_type: photoType,
      caption,
    })
    .select("id")
    .single();

  if (dbErr) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "create",
    targetType: "progress_photos",
    targetId: (inserted as { id: string }).id,
  });

  return NextResponse.json({ id: (inserted as { id: string }).id, storagePath });
}
