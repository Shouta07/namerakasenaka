import { getAdminSupabase } from "@/lib/supabase/admin";
import type { StoragePhoto } from "./index";

const BUCKET = "progress-photos";

/**
 * Upload to Supabase Storage. Uses the service-role client so callers don't need
 * to thread an authenticated request-bound client through here — RLS is enforced
 * separately at the `progress_photos` row level.
 *
 * Path layout (matches the historical convention): `{orgId}/{clientId}/{photoId}.{ext}`.
 */
export async function uploadToSupabaseStorage(
  input: StoragePhoto,
): Promise<{ storagePath: string }> {
  const supabase = getAdminSupabase();
  const ext = (input.file.filename.split(".").pop() ?? "jpg").toLowerCase();
  const storagePath = `${input.organizationId}/${input.clientId}/${input.photoId}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, new Uint8Array(input.file.bytes), {
      contentType: input.file.mimeType || "image/jpeg",
      upsert: false,
    });
  if (error) {
    throw new Error(`supabase_storage_upload_failed: ${error.message}`);
  }
  return { storagePath };
}

export async function removeFromSupabaseStorage(storagePath: string): Promise<void> {
  const supabase = getAdminSupabase();
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

export async function createSupabaseSignedUrl(
  storagePath: string,
  expiresInSeconds: number,
): Promise<{ url: string }> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error || !data) {
    throw new Error(`supabase_signed_url_failed: ${error?.message ?? "unknown"}`);
  }
  return { url: data.signedUrl };
}
