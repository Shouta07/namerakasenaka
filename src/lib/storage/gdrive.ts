/**
 * Google Drive REST API v3 client — fetch-only, no `googleapis` dep.
 *
 * Scope of this module:
 *   - Multipart upload of a photo into a deterministic folder path under
 *     `Senacare/<organization_name>/<client_display_name>/<YYYY-MM>/`.
 *   - Folder lookup-or-create at each level.
 *   - Access-token refresh against `https://oauth2.googleapis.com/token` with a
 *     simple in-memory cache.
 *
 * Production readiness:
 *   - The token cache is process-local. For a multi-instance deployment, consider
 *     persisting cached tokens in Supabase or KV (TODO Phase 1).
 *   - This module uses a SaaS-level refresh token (single OAuth client). Per-salon
 *     OAuth (so each salon owns their own Drive folder root) is the recommended
 *     Phase 1 follow-up — see docs/requirements.md §16.
 *   - When env is unset, all calls throw `google_drive_not_configured` so the
 *     dispatcher can fall back cleanly.
 */

import type { StoragePhoto } from "./index";

const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const FOLDER_MIME = "application/vnd.google-apps.folder";

type DriveConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  rootFolderId?: string;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number; // epoch ms
};

let tokenCache: CachedToken | null = null;

function readConfig(): DriveConfig {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || undefined;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("google_drive_not_configured");
  }
  return { clientId, clientSecret, refreshToken, rootFolderId };
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.accessToken;
  }
  const cfg = readConfig();
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: cfg.refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gdrive_token_refresh_failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as unknown;
  if (
    !json ||
    typeof json !== "object" ||
    typeof (json as { access_token?: unknown }).access_token !== "string"
  ) {
    throw new Error("gdrive_token_refresh_invalid_response");
  }
  const accessToken = (json as { access_token: string }).access_token;
  const expiresIn = Number((json as { expires_in?: unknown }).expires_in ?? 3600);
  tokenCache = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };
  return accessToken;
}

type DriveFile = { id: string; name: string };

function escapeQ(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/**
 * Find a folder with the given name under the parent; create it if missing.
 * Returns the folder id.
 */
async function findOrCreateFolder(name: string, parentId: string): Promise<string> {
  const accessToken = await getAccessToken();
  const q = [
    `mimeType = '${FOLDER_MIME}'`,
    `name = '${escapeQ(name)}'`,
    `'${parentId}' in parents`,
    "trashed = false",
  ].join(" and ");
  const searchUrl = `${DRIVE_FILES_URL}?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!searchRes.ok) {
    const text = await searchRes.text();
    throw new Error(`gdrive_folder_search_failed: ${searchRes.status} ${text.slice(0, 200)}`);
  }
  const searchJson = (await searchRes.json()) as { files?: DriveFile[] };
  const existing = searchJson.files?.[0];
  if (existing) return existing.id;

  const createRes = await fetch(`${DRIVE_FILES_URL}?fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    }),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`gdrive_folder_create_failed: ${createRes.status} ${text.slice(0, 200)}`);
  }
  const created = (await createRes.json()) as { id: string };
  return created.id;
}

async function ensureFolderPath(
  parts: string[],
  rootId: string | undefined,
): Promise<string> {
  let parent = rootId ?? "root";
  for (const part of parts) {
    parent = await findOrCreateFolder(part, parent);
  }
  return parent;
}

function buildMultipartBody(
  metadata: Record<string, unknown>,
  bytes: ArrayBuffer,
  mimeType: string,
  boundary: string,
): Uint8Array {
  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\n` +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`,
  );
  const tail = encoder.encode(`\r\n--${boundary}--`);
  const out = new Uint8Array(head.length + bytes.byteLength + tail.length);
  out.set(head, 0);
  out.set(new Uint8Array(bytes), head.length);
  out.set(tail, head.length + bytes.byteLength);
  return out;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Upload a photo to Drive. Returns the storage path `gdrive:<fileId>`.
 */
export async function uploadToGoogleDrive(
  input: StoragePhoto,
): Promise<{ storagePath: string }> {
  const cfg = readConfig();
  const accessToken = await getAccessToken();

  const ext = (input.file.filename.split(".").pop() ?? "jpg").toLowerCase();
  const orgFolder = input.organizationName?.trim() || `org-${input.organizationId.slice(0, 8)}`;
  const clientFolder =
    input.clientDisplayName?.trim() || `client-${input.clientId.slice(0, 8)}`;
  const ymFolder = `${input.takenAt.getUTCFullYear()}-${pad2(input.takenAt.getUTCMonth() + 1)}`;
  const fileName = `${input.photoId}.${ext}`;

  const folderId = await ensureFolderPath(
    ["Senacare", orgFolder, clientFolder, ymFolder],
    cfg.rootFolderId,
  );

  const boundary = `senacare-${input.photoId}`;
  const body = buildMultipartBody(
    { name: fileName, parents: [folderId] },
    input.file.bytes,
    input.file.mimeType || "image/jpeg",
    boundary,
  );

  const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    // BodyInit accepts Uint8Array in the Node 18+ fetch impl Next uses.
    body: body as unknown as BodyInit,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gdrive_upload_failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const created = (await res.json()) as { id?: unknown };
  if (typeof created.id !== "string") {
    throw new Error("gdrive_upload_invalid_response");
  }
  return { storagePath: `gdrive:${created.id}` };
}

/**
 * Mint a short-lived download URL for a file already uploaded to Drive.
 * Returns the URL plus the access token Drive expects for the media download
 * endpoint (caller may simply redirect, since the token is embedded in the
 * Authorization header — the helper returns the resolvable URL pattern).
 */
export async function createGoogleDriveSignedUrl(
  storagePath: string,
  /* expiresInSeconds is accepted for parity but Drive does not honour custom
   * TTLs on the media download URL — the URL is bound to the access token's
   * lifetime, typically ~1h. */
  _expiresInSeconds: number,
): Promise<{ url: string; expiresIn: number }> {
  void _expiresInSeconds;
  const fileId = storagePath.startsWith("gdrive:") ? storagePath.slice("gdrive:".length) : "";
  if (!fileId) {
    throw new Error("invalid_gdrive_storage_path");
  }
  const accessToken = await getAccessToken();
  // We surface the media download URL with the access token as a query param
  // for environments that cannot set Authorization on a 302 (e.g. <img src>).
  // Drive accepts `?access_token=` for backwards compatibility.
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    fileId,
  )}?alt=media&access_token=${encodeURIComponent(accessToken)}`;
  // Cap at the rough token lifetime; caller treats this as a best-effort hint.
  const expiresAt = tokenCache?.expiresAt ?? Date.now() + 60 * 60 * 1000;
  const expiresIn = Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));
  return { url, expiresIn };
}

export function isGoogleDriveConfigured(): boolean {
  try {
    readConfig();
    return true;
  } catch {
    return false;
  }
}
