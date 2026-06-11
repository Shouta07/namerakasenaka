-- Senacare Phase 4 — 「あなた専用の回復ガイド」 (Recovery Guide).
--
-- Three-company collaboration:
--   - エクシアクリニック          : medical tests (IgG / 腸内カンジダ / リーキーガット) + doctor comments
--   - なめらかせなか              : salon operation & counseling
--   - バイタリティデザイン合同会社 : development & operation
--
-- Tables:
--   - guide_customers : recipients of a recovery guide (lightweight, separate from clients)
--   - health_records  : clinic test memo + doctor comment + salon memo + AI-generated guide JSON
--   - daily_checks    : customer self check-ins from the share page (1 row per customer per day)
--
-- Access model:
--   Staff (salon_admin / therapist, same org) read/write via RLS. super_admin sees all.
--   The customer-facing share page (/share/[token]) is NOT covered by RLS at all:
--   there is deliberately no anonymous policy on any of these tables. The share page
--   goes through a server route that uses the service-role client and resolves the
--   guide customer by an exact share_token lookup. daily_checks inserts from the
--   share page likewise go through POST /api/daily-checks, which validates the
--   share_token with the admin client before upserting. URL knowledge == access;
--   tokens are unguessable random strings and can be rotated by deleting the row.

-- ---------- guide_customers ----------
create table guide_customers (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  client_id        uuid references clients(id) on delete set null,
  name             text not null,
  age              integer,
  concern          text,
  share_token      text unique not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_guide_customers_org on guide_customers (organization_id, created_at desc);
create index idx_guide_customers_client on guide_customers (client_id);
-- share_token already has a unique index via the constraint.

create trigger trg_guide_customers_updated
  before update on guide_customers
  for each row execute function set_updated_at();

create trigger trg_audit_guide_customers
  after insert or update or delete on guide_customers
  for each row execute function audit_write();

alter table guide_customers enable row level security;

create policy guide_customers_select on guide_customers for select
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy guide_customers_insert on guide_customers for insert
  with check (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy guide_customers_update on guide_customers for update
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy guide_customers_delete on guide_customers for delete
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

-- ---------- health_records ----------
create table health_records (
  id                    uuid primary key default gen_random_uuid(),
  guide_customer_id     uuid not null references guide_customers(id) on delete cascade,
  test_result_memo      text,
  doctor_comment        text,
  salon_memo            text,
  dietary_restrictions  text,
  current_problem       text,
  ai_summary_json       jsonb,
  ai_generated_at       timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_health_records_guide_customer on health_records (guide_customer_id, created_at desc);

create trigger trg_health_records_updated
  before update on health_records
  for each row execute function set_updated_at();

create trigger trg_audit_health_records
  after insert or update or delete on health_records
  for each row execute function audit_write();

alter table health_records enable row level security;

-- Same staff-only gate, resolved through the owning guide_customer.
create policy health_records_select on health_records for select
  using (
    exists (
      select 1 from guide_customers g
      where g.id = health_records.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy health_records_insert on health_records for insert
  with check (
    exists (
      select 1 from guide_customers g
      where g.id = health_records.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy health_records_update on health_records for update
  using (
    exists (
      select 1 from guide_customers g
      where g.id = health_records.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy health_records_delete on health_records for delete
  using (
    exists (
      select 1 from guide_customers g
      where g.id = health_records.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

-- ---------- daily_checks ----------
create table daily_checks (
  id                 uuid primary key default gen_random_uuid(),
  guide_customer_id  uuid not null references guide_customers(id) on delete cascade,
  date               date not null,
  action_done        boolean,
  skin_condition     integer check (skin_condition between 1 and 5),
  body_condition     integer check (body_condition between 1 and 5),
  memo               text,
  created_at         timestamptz not null default now(),
  unique (guide_customer_id, date)
);

create index idx_daily_checks_guide_customer on daily_checks (guide_customer_id, date desc);

create trigger trg_audit_daily_checks
  after insert or update or delete on daily_checks
  for each row execute function audit_write();

alter table daily_checks enable row level security;

-- Staff read/write only. Customer check-ins from /share/[token] are inserted by
-- POST /api/daily-checks using the service-role client *after* validating the
-- share_token — no anonymous RLS path exists on purpose.
create policy daily_checks_select on daily_checks for select
  using (
    exists (
      select 1 from guide_customers g
      where g.id = daily_checks.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy daily_checks_insert on daily_checks for insert
  with check (
    exists (
      select 1 from guide_customers g
      where g.id = daily_checks.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy daily_checks_update on daily_checks for update
  using (
    exists (
      select 1 from guide_customers g
      where g.id = daily_checks.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy daily_checks_delete on daily_checks for delete
  using (
    exists (
      select 1 from guide_customers g
      where g.id = daily_checks.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );
