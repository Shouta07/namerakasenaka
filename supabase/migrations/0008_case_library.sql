-- Senacare Phase 3 — Case library for counseling support.
--
-- Salon staff (therapist + salon_admin) want to pull up past anonymized
-- cases during a counseling session and switch to a PII-stripped display
-- mode for the iPad in front of the prospect. Three tables:
--   - cases               : the case itself (with Before/After + memos)
--   - case_tags_master    : per-org tag dictionary
--   - case_tag_assignments: many-to-many between cases and tags
--
-- All three are tenant-scoped via organization_id and locked down with RLS:
-- only therapist / salon_admin / super_admin in the same org may read or
-- write. Nutritionist explicitly excluded.

-- ---------- cases ----------
create table cases (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  anonymous_id        text not null,
  age                 integer,
  gender              text check (gender in ('female','male','other','no_answer')),
  occupation          text,
  concern_duration    text,
  main_concern        text,
  first_visit_date    date,
  treatment_count     integer,
  improvement_period  text,
  severity            text check (severity in ('light','medium','heavy')),
  before_image_url    text,
  after_image_url     text,
  staff_memo          text,
  counseling_comment  text,
  created_by          uuid references users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_cases_org_created on cases (organization_id, created_at desc);
create index idx_cases_severity on cases (organization_id, severity);

create trigger trg_cases_updated
  before update on cases
  for each row execute function set_updated_at();

create trigger trg_audit_cases
  after insert or update or delete on cases
  for each row execute function audit_write();

alter table cases enable row level security;

create policy cases_select on cases for select
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy cases_insert on cases for insert
  with check (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy cases_update on cases for update
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy cases_delete on cases for delete
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

-- ---------- case_tags_master ----------
create table case_tags_master (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  unique (organization_id, name)
);

create index idx_case_tags_master_org on case_tags_master (organization_id, sort_order);

alter table case_tags_master enable row level security;

create policy case_tags_master_select on case_tags_master for select
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy case_tags_master_insert on case_tags_master for insert
  with check (
    is_super_admin()
    or (organization_id = current_org_id() and is_salon_admin())
  );

create policy case_tags_master_update on case_tags_master for update
  using (
    is_super_admin()
    or (organization_id = current_org_id() and is_salon_admin())
  );

create policy case_tags_master_delete on case_tags_master for delete
  using (
    is_super_admin()
    or (organization_id = current_org_id() and is_salon_admin())
  );

-- ---------- case_tag_assignments ----------
create table case_tag_assignments (
  case_id uuid not null references cases(id) on delete cascade,
  tag_id  uuid not null references case_tags_master(id) on delete cascade,
  primary key (case_id, tag_id)
);

create index idx_case_tag_assignments_tag on case_tag_assignments (tag_id);

alter table case_tag_assignments enable row level security;

create policy case_tag_assignments_select on case_tag_assignments for select
  using (
    exists (
      select 1 from cases c
      where c.id = case_tag_assignments.case_id
        and (
          is_super_admin()
          or (
            c.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy case_tag_assignments_insert on case_tag_assignments for insert
  with check (
    exists (
      select 1 from cases c
      where c.id = case_tag_assignments.case_id
        and (
          is_super_admin()
          or (
            c.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy case_tag_assignments_delete on case_tag_assignments for delete
  using (
    exists (
      select 1 from cases c
      where c.id = case_tag_assignments.case_id
        and (
          is_super_admin()
          or (
            c.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

-- ---------- Seed default tags ----------
-- The demo organization id is fixed in the app fixtures.
-- In production rollouts this seed runs per-org via a setup helper.
insert into case_tags_master (organization_id, name, sort_order)
values
  ('org-carat-demo'::uuid, '炎症ニキビ',  10),
  ('org-carat-demo'::uuid, '色素沈着',    20),
  ('org-carat-demo'::uuid, '毛穴詰まり',  30),
  ('org-carat-demo'::uuid, '乾燥',        40),
  ('org-carat-demo'::uuid, '皮脂過多',    50),
  ('org-carat-demo'::uuid, '赤み',        60),
  ('org-carat-demo'::uuid, 'ニキビ跡',    70),
  ('org-carat-demo'::uuid, 'かゆみ',      80),
  ('org-carat-demo'::uuid, '重度',       100),
  ('org-carat-demo'::uuid, '中度',       110),
  ('org-carat-demo'::uuid, '軽度',       120)
on conflict (organization_id, name) do nothing;
