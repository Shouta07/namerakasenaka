import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit/log";
import { uploadProgressPhoto } from "@/lib/storage";
import { removeFromSupabaseStorage } from "@/lib/storage/supabase-storage";
import type { PhotoType } from "@/types/domain";

const ALLOWED_TYPES: PhotoType[] = ["before", "after", "reference"];
const MAX_BYTES = 10 * 1024 * 1024;

type ClientLookup = {
  organization_id: string | null;
  user_id: string | null;
};

type OrgLookup = {
  name: string | null;
};

type ProfileLookup = {
  name: string | null;
};

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
  const appointmentIdRaw = form.get("appointmentId");
  const appointmentId =
    typeof appointmentIdRaw === "string" && appointmentIdRaw.length > 0
      ? appointmentIdRaw
      : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(photoType)) {
    return NextResponse.json({ error: "invalid_photo_type" }, { status: 400 });
  }

  const { data: clientRow } = await supabase
    .from("clients")
    .select("organization_id, user_id")
    .eq("id", clientId)
    .maybeSingle();
  const client = clientRow as ClientLookup | null;
  const orgId = client?.organization_id ?? null;
  if (!orgId) return NextResponse.json({ error: "client_not_found" }, { status: 404 });

  // Best-effort fetch of display names for Drive folder layout (optional).
  let orgName: string | null = null;
  let clientDisplayName: string | null = null;
  try {
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .maybeSingle();
    orgName = (orgRow as OrgLookup | null)?.name ?? null;
  } catch {
    orgName = null;
  }
  if (client?.user_id) {
    try {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", client.user_id)
        .maybeSingle();
      clientDisplayName = (profileRow as ProfileLookup | null)?.name ?? null;
    } catch {
      clientDisplayName = null;
    }
  }

  const photoId = randomUUID();
  const arrayBuffer = await file.arrayBuffer();

  let uploadResult;
  try {
    uploadResult = await uploadProgressPhoto({
      clientId,
      organizationId: orgId,
      photoId,
      file: {
        bytes: arrayBuffer,
        mimeType: file.type || "image/jpeg",
        filename: file.name || `${photoId}.jpg`,
      },
      takenAt: new Date(),
      clientDisplayName: clientDisplayName ?? undefined,
      organizationName: orgName ?? undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload_failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const primaryPath = uploadResult.primary.storagePath;
  const backupPath = uploadResult.backup?.storagePath ?? null;
  const backupError = uploadResult.backup?.error ?? null;
  const gdriveFileId =
    primaryPath.startsWith("gdrive:")
      ? primaryPath.slice("gdrive:".length)
      : backupPath?.startsWith("gdrive:")
        ? backupPath.slice("gdrive:".length)
        : null;

  // Insert via the admin client so we can set new optional columns
  // (backup_storage_path / gdrive_file_id) regardless of RLS column policies.
  const admin = getAdminSupabase();
  const { data: inserted, error: dbErr } = await admin
    .from("progress_photos")
    .insert({
      id: photoId,
      client_id: clientId,
      uploaded_by: user.id,
      storage_path: primaryPath,
      photo_type: photoType,
      caption,
      ...(appointmentId ? { appointment_id: appointmentId } : {}),
      ...(backupPath ? { backup_storage_path: backupPath } : {}),
      ...(gdriveFileId ? { gdrive_file_id: gdriveFileId } : {}),
    })
    .select("id")
    .single();

  if (dbErr) {
    // Best-effort cleanup of the Supabase upload (we don't clean up Drive on
    // this failure path — operator can prune via Drive admin tools).
    if (uploadResult.primary.provider === "supabase") {
      await removeFromSupabaseStorage(primaryPath).catch(() => undefined);
    }
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  await logAudit({
    actorId: user.id,
    action: "create",
    targetType: "progress_photos",
    targetId: (inserted as { id: string }).id,
    metadata: {
      primary_provider: uploadResult.primary.provider,
      backup_provider: uploadResult.backup?.provider ?? null,
      backup_status: backupError ? "failed" : backupPath ? "ok" : "none",
      backup_error: backupError,
      appointment_id: appointmentId,
    },
  });

  return NextResponse.json({
    id: (inserted as { id: string }).id,
    storagePath: primaryPath,
    backupStoragePath: backupPath,
    backupError,
  });
}
