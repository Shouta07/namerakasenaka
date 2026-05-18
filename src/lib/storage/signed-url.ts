import { createSupabaseSignedUrl } from "./supabase-storage";
import { createGoogleDriveSignedUrl } from "./gdrive";

export type SignedUrlResult = {
  url: string;
  expiresIn: number;
  provider: "supabase" | "gdrive";
};

/**
 * Mint a short-lived URL for a stored photo. Dispatches on the path prefix:
 *   - `gdrive:<fileId>` → Google Drive media download.
 *   - anything else     → Supabase Storage signed URL.
 */
export async function createSignedUrlForStoragePath(
  storagePath: string,
  expiresInSeconds: number,
): Promise<SignedUrlResult> {
  if (storagePath.startsWith("gdrive:")) {
    const { url, expiresIn } = await createGoogleDriveSignedUrl(
      storagePath,
      expiresInSeconds,
    );
    return { url, expiresIn, provider: "gdrive" };
  }
  const { url } = await createSupabaseSignedUrl(storagePath, expiresInSeconds);
  return { url, expiresIn: expiresInSeconds, provider: "supabase" };
}
