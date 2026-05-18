-- Senacare Phase 1 — Salon-side meal comments + treatment videos
-- Adds two new tables (meal_log_comments, treatment_videos), enables RLS,
-- updates existing storage buckets with mime/size limits, and creates a new
-- private bucket `progress-videos` for treatment-attached clips.

-- ============================================================
-- 1. meal_log_comments
-- ============================================================
-- Lighter-weight, salon-side channel for Therapist (assigned) / SalonAdmin
-- (same org) to leave free-text comments on a client's meal log. This is
-- separate from `meal_feedbacks` (nutritionist AI draft → approve → send)
-- so the lifecycles, authors, and audit footprints do not collide.

create table meal_log_comments (
  id           uuid primary key default gen_random_uuid(),
  meal_log_id  uuid not null references meal_logs(id) on delete cascade,
  author_id    uuid not null references users(id) on delete restrict,
  author_role  text not null check (author_role in ('therapist', 'salon_admin')),
  body         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_meal_log_comments_meal_created
  on meal_log_comments (meal_log_id, created_at desc);
create trigger trg_meal_log_comments_updated
  before update on meal_log_comments
  for each row execute function set_updated_at();

alter table meal_log_comments enable row level security;

-- SELECT: client (own meal_log) | assigned therapist | salon_admin (same org) | nutritionist (reviewing logs)
create policy meal_log_comments_select on meal_log_comments for select
  using (
    is_super_admin()
    or exists (
      select 1
      from meal_logs ml
      join clients c on c.id = ml.client_id
      where ml.id = meal_log_comments.meal_log_id
        and (
          (is_client() and ml.client_id = my_client_id())
          or (is_therapist() and c.primary_therapist_id = my_therapist_id())
          or (is_salon_admin() and c.organization_id = current_org_id())
          or is_nutritionist()
        )
    )
  );

-- INSERT: therapist assigned to the client | salon_admin in the same org. author_id = self.
create policy meal_log_comments_insert on meal_log_comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1
      from meal_logs ml
      join clients c on c.id = ml.client_id
      where ml.id = meal_log_comments.meal_log_id
        and (
          (is_therapist() and author_role = 'therapist'
            and c.primary_therapist_id = my_therapist_id())
          or (is_salon_admin() and author_role = 'salon_admin'
            and c.organization_id = current_org_id())
        )
    )
  );

-- UPDATE / DELETE: author only, within 30 minutes of creation.
create policy meal_log_comments_update on meal_log_comments for update
  using (
    author_id = auth.uid()
    and created_at > now() - interval '30 minutes'
  );
create policy meal_log_comments_delete on meal_log_comments for delete
  using (
    author_id = auth.uid()
    and created_at > now() - interval '30 minutes'
  );

create trigger trg_audit_meal_log_comments
  after insert or update or delete on meal_log_comments
  for each row execute function audit_write();

-- ============================================================
-- 2. progress-videos bucket + mime/size hardening on existing buckets
-- ============================================================
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values (
  'progress-videos',
  'progress-videos',
  false,
  array['video/mp4','video/quicktime','video/webm'],
  314572800 -- 300 MB
)
on conflict (id) do update set
  allowed_mime_types = excluded.allowed_mime_types,
  file_size_limit = excluded.file_size_limit;

update storage.buckets
   set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif'],
       file_size_limit    = 20971520 -- 20 MB
 where id = 'progress-photos';

update storage.buckets
   set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic','image/heif']
 where id = 'meal-photos';

-- ============================================================
-- 3. treatment_videos
-- ============================================================
-- Separate from `progress_photos` because: (a) videos have distinct storage
-- characteristics (size limit, mime allowlist, no `photo_type` enum), and
-- (b) we want to attach them to treatment_records to support the §4.6
-- "before/after motion" therapist note workflow without polluting the photo
-- table or losing the photo_type discriminator.

create table treatment_videos (
  id                   uuid primary key default gen_random_uuid(),
  treatment_record_id  uuid references treatment_records(id) on delete cascade,
  client_id            uuid not null references clients(id) on delete cascade,
  uploaded_by          uuid not null references users(id) on delete restrict,
  storage_path         text not null,
  duration_seconds     int,
  taken_at             timestamptz not null default now(),
  created_at           timestamptz not null default now()
);
create index idx_treatment_videos_client_taken
  on treatment_videos (client_id, taken_at desc);
create index idx_treatment_videos_record
  on treatment_videos (treatment_record_id);

alter table treatment_videos enable row level security;

-- Access mirrors progress_photos: client (own) | assigned therapist | salon_admin (same org).
-- Nutritionist has no access.
create policy treatment_videos_select on treatment_videos for select
  using (
    is_super_admin()
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = treatment_videos.client_id and c.organization_id = current_org_id()
    ))
    or (is_therapist() and is_assigned_therapist(client_id))
    or (is_client() and client_id = my_client_id())
  );
create policy treatment_videos_insert on treatment_videos for insert
  with check (
    is_super_admin()
    or (is_therapist() and is_assigned_therapist(client_id))
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = treatment_videos.client_id and c.organization_id = current_org_id()
    ))
  );
create policy treatment_videos_update on treatment_videos for update
  using (
    is_super_admin()
    or (is_therapist() and is_assigned_therapist(client_id))
  );
create policy treatment_videos_delete on treatment_videos for delete
  using (
    is_super_admin()
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = treatment_videos.client_id and c.organization_id = current_org_id()
    ))
  );

create trigger trg_audit_treatment_videos
  after insert or update or delete on treatment_videos
  for each row execute function audit_write();

-- ============================================================
-- 4. storage.objects policies for progress-videos
-- ============================================================
-- Object path convention: progress-videos/<organization_id>/<client_id>/<video_id>.<ext>
create policy "progress_videos_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'progress-videos'
  and (
    public.is_super_admin()
    or exists (
      select 1
      from public.treatment_videos v
      join public.clients c on c.id = v.client_id
      where v.storage_path = storage.objects.name
        and (
          (public.is_salon_admin() and c.organization_id = public.current_org_id())
          or (public.is_therapist() and public.is_assigned_therapist(c.id))
          or (public.is_client() and c.user_id = auth.uid())
        )
    )
  )
);

create policy "progress_videos_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'progress-videos'
  and (public.is_therapist() or public.is_salon_admin() or public.is_super_admin())
);

create policy "progress_videos_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'progress-videos'
  and (public.is_super_admin() or public.is_salon_admin())
);
