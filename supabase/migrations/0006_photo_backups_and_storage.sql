-- Senacare Phase 1 — Photo storage abstraction (dual-write)
-- Adds optional columns to `progress_photos` to record a second-provider backup
-- (Google Drive) when PHOTO_STORAGE_MODE=dual, and a quick-lookup column for
-- the Drive file id when the path is `gdrive:<fileId>`.
--
-- Existing RLS policies (per-row, organisation-scoped) on `progress_photos`
-- remain authoritative; these columns ride alongside `storage_path` so no
-- policy changes are required. Audit triggers already cover any update.

alter table progress_photos
  add column if not exists backup_storage_path text,
  add column if not exists gdrive_file_id text;

comment on column progress_photos.backup_storage_path is
  'When PHOTO_STORAGE_MODE=dual, holds the secondary-provider path (typically gdrive:<fileId>).';
comment on column progress_photos.gdrive_file_id is
  'Quick-lookup Google Drive file id, set whenever primary or backup uses the gdrive provider.';
