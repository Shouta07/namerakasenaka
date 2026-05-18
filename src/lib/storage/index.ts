/**
 * Photo storage dispatch layer.
 *
 * Mode is controlled by `PHOTO_STORAGE_MODE`:
 *   - "supabase_only" (default): primary = Supabase Storage, no backup.
 *   - "gdrive_only":             primary = Google Drive, no backup.
 *   - "dual":                    primary = Supabase, backup = Google Drive.
 *
 * On `dual`, backup failures DO NOT fail the request — they are returned to the
 * caller via `result.backup.error` so the audit row can record them.
 *
 * See docs/requirements.md §16 for the architecture decision and operational
 * implications (cross-border transfer review under §8.3 is required before
 * enabling `gdrive_only`).
 */

import { uploadToSupabaseStorage } from "./supabase-storage";
import { uploadToGoogleDrive } from "./gdrive";

export type StorageProvider = "supabase" | "gdrive";

export type StoragePhoto = {
  clientId: string;
  organizationId: string;
  photoId: string;
  file: { bytes: ArrayBuffer; mimeType: string; filename: string };
  takenAt: Date;
  /** Optional display names for organising Drive folders. */
  clientDisplayName?: string;
  organizationName?: string;
};

export type UploadResult = {
  primary: { provider: StorageProvider; storagePath: string };
  backup?: { provider: StorageProvider; storagePath?: string; error?: string };
};

export type StorageMode = "supabase_only" | "gdrive_only" | "dual";

export function getStorageMode(): StorageMode {
  const raw = (process.env.PHOTO_STORAGE_MODE ?? "supabase_only").toLowerCase();
  if (raw === "gdrive_only" || raw === "dual" || raw === "supabase_only") {
    return raw;
  }
  return "supabase_only";
}

export async function uploadProgressPhoto(input: StoragePhoto): Promise<UploadResult> {
  const mode = getStorageMode();

  if (mode === "supabase_only") {
    const { storagePath } = await uploadToSupabaseStorage(input);
    return { primary: { provider: "supabase", storagePath } };
  }

  if (mode === "gdrive_only") {
    const { storagePath } = await uploadToGoogleDrive(input);
    return { primary: { provider: "gdrive", storagePath } };
  }

  // dual: primary = supabase, backup = gdrive (do not fail on backup error).
  const { storagePath } = await uploadToSupabaseStorage(input);
  let backup: UploadResult["backup"] = { provider: "gdrive" };
  try {
    const driveRes = await uploadToGoogleDrive(input);
    backup = { provider: "gdrive", storagePath: driveRes.storagePath };
  } catch (err) {
    backup = {
      provider: "gdrive",
      error: err instanceof Error ? err.message : "unknown_error",
    };
  }
  return {
    primary: { provider: "supabase", storagePath },
    backup,
  };
}
