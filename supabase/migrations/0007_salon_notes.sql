-- Senacare Phase 2 — Generic salon notes across all client artifacts.
--
-- Existing `meal_log_comments` covers meal logs only. Salon staff also want
-- to leave free-text notes on photos, self-logs, treatment records and Q&A
-- threads — all from the unified customer detail page. This migration adds
-- a single polymorphic `salon_notes` table with target_type ∈
-- (photo, self_log, meal_log, treatment_record, qa_thread) and the same
-- 30-minute-edit, RLS-bounded discipline as the meal-comments table.

create table salon_notes (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  target_type  text not null
                 check (target_type in ('photo','self_log','meal_log','treatment_record','qa_thread')),
  target_id    text not null,
  author_id    uuid not null references users(id) on delete restrict,
  author_role  text not null check (author_role in ('therapist','salon_admin')),
  body         text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_salon_notes_target
  on salon_notes (target_type, target_id, created_at desc);
create index idx_salon_notes_client_created
  on salon_notes (client_id, created_at desc);

create trigger trg_salon_notes_updated
  before update on salon_notes
  for each row execute function set_updated_at();

alter table salon_notes enable row level security;

-- SELECT:
--  - super_admin always
--  - therapist assigned to the client
--  - salon_admin in the client's organization
--  - the client themselves (so they can read what the salon left on their items)
create policy salon_notes_select on salon_notes for select
  using (
    is_super_admin()
    or exists (
      select 1
      from clients c
      where c.id = salon_notes.client_id
        and (
          (is_client() and c.id = my_client_id())
          or (is_therapist() and c.primary_therapist_id = my_therapist_id())
          or (is_salon_admin() and c.organization_id = current_org_id())
        )
    )
  );

-- INSERT:
--  - therapist assigned to client AND author_role = 'therapist'
--  - salon_admin in same org AND author_role = 'salon_admin'
--  - author_id must be the caller
create policy salon_notes_insert on salon_notes for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from clients c
      where c.id = salon_notes.client_id
        and (
          (is_therapist() and author_role = 'therapist'
             and c.primary_therapist_id = my_therapist_id())
          or (is_salon_admin() and author_role = 'salon_admin'
             and c.organization_id = current_org_id())
        )
    )
  );

-- UPDATE / DELETE: author only, within 30 minutes of creation.
create policy salon_notes_update on salon_notes for update
  using (
    author_id = auth.uid()
    and created_at > now() - interval '30 minutes'
  );

create policy salon_notes_delete on salon_notes for delete
  using (
    author_id = auth.uid()
    and created_at > now() - interval '30 minutes'
  );

create trigger trg_audit_salon_notes
  after insert or update or delete on salon_notes
  for each row execute function audit_write();
