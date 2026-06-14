-- Senacare Phase 4 — 伴走ループ (Companion Loop).
--
-- guide_messages: short replies from salon staff to a guide customer.
-- One direction for now ("salon_to_customer"); the column is kept generic so
-- a future customer_to_salon channel can land here without a schema change.
--
-- Access model mirrors guide_customers / health_records:
--   - Staff (same org, salon_admin or therapist) read/write via RLS.
--   - super_admin sees all.
--   - The customer-facing share page (/share/[token]) has no direct RLS path.
--     read_at is flipped by POST /api/guide/messages/read, which validates
--     the share_token via the service-role client before update.

create table guide_messages (
  id                         uuid primary key default gen_random_uuid(),
  guide_customer_id          uuid not null references guide_customers(id) on delete cascade,
  direction                  text not null check (direction in ('salon_to_customer')),
  body                       text not null,
  created_at                 timestamptz not null default now(),
  read_at                    timestamptz,
  responding_to_check_date   date,
  created_by                 uuid references users(id) on delete set null
);

create index idx_guide_messages_customer
  on guide_messages (guide_customer_id, created_at desc);

create index idx_guide_messages_unread
  on guide_messages (guide_customer_id)
  where read_at is null;

create trigger trg_audit_guide_messages
  after insert or update or delete on guide_messages
  for each row execute function audit_write();

alter table guide_messages enable row level security;

create policy guide_messages_select on guide_messages for select
  using (
    exists (
      select 1 from guide_customers g
      where g.id = guide_messages.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy guide_messages_insert on guide_messages for insert
  with check (
    exists (
      select 1 from guide_customers g
      where g.id = guide_messages.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy guide_messages_update on guide_messages for update
  using (
    exists (
      select 1 from guide_customers g
      where g.id = guide_messages.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );

create policy guide_messages_delete on guide_messages for delete
  using (
    exists (
      select 1 from guide_customers g
      where g.id = guide_messages.guide_customer_id
        and (
          is_super_admin()
          or (
            g.organization_id = current_org_id()
            and (is_salon_admin() or is_therapist())
          )
        )
    )
  );
