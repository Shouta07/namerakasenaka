-- Senacare Phase 0 — initial schema
-- All tables use uuid PKs and (created_at, updated_at) timestamps.
-- RLS is enabled in 0002_rls.sql.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type user_role as enum (
  'client',
  'therapist',
  'salon_admin',
  'nutritionist',
  'super_admin'
);

create type user_status as enum ('active', 'invited', 'suspended', 'withdrawn');

create type therapist_status as enum ('active', 'on_leave', 'retired');

create type appointment_status as enum (
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type photo_type as enum ('before', 'after', 'reference');

create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

create type feedback_status as enum (
  'ai_drafting',
  'awaiting_review',
  'approved',
  'rejected',
  'sent'
);

create type billing_mode as enum ('B2B_ONLY', 'B2C_ONLY', 'DUAL');

create type subscription_subject as enum ('organization', 'client');

create type subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'unpaid'
);

create type invite_target_role as enum ('client', 'therapist');

-- ---------- helper: updated_at trigger ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- core tenancy ----------
create table organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  plan            text not null default 'starter',
  billing_mode    billing_mode not null default 'B2B_ONLY',
  business_hours  jsonb not null default '{"weekday":{"open":"10:00","close":"20:00"},"weekend":{"open":"10:00","close":"19:00"}}'::jsonb,
  stripe_customer_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_organizations_updated before update on organizations
  for each row execute function set_updated_at();

create table locations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  address         text,
  phone           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_locations_org on locations(organization_id);
create trigger trg_locations_updated before update on locations
  for each row execute function set_updated_at();

-- ---------- users ----------
-- `users` mirrors auth.users (id = auth.users.id) with our domain fields.
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null unique,
  role            user_role not null,
  organization_id uuid references organizations(id) on delete set null,
  status          user_status not null default 'invited',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_users_org on users(organization_id);
create index idx_users_role on users(role);
create trigger trg_users_updated before update on users
  for each row execute function set_updated_at();

create table profiles (
  user_id     uuid primary key references users(id) on delete cascade,
  name        text not null,
  phone       text,
  birthdate   date,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- ---------- therapists / nutritionists ----------
create table therapists (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id     uuid references locations(id) on delete set null,
  status          therapist_status not null default 'active',
  hire_date       date,
  qualifications  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_therapists_org on therapists(organization_id);
create trigger trg_therapists_updated before update on therapists
  for each row execute function set_updated_at();

create table nutritionists (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  license_number  text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_nutritionists_updated before update on nutritionists
  for each row execute function set_updated_at();

-- ---------- clients ----------
create table clients (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references users(id) on delete cascade,
  organization_id       uuid not null references organizations(id) on delete cascade,
  location_id           uuid references locations(id) on delete set null,
  primary_therapist_id  uuid references therapists(id) on delete set null,
  gender                text,
  skin_type             text,
  concerns              text,
  feature_meal_log      boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  withdrawn_at          timestamptz
);
create index idx_clients_org on clients(organization_id);
create index idx_clients_therapist on clients(primary_therapist_id);
create trigger trg_clients_updated before update on clients
  for each row execute function set_updated_at();

-- ---------- courses ----------
create table course_templates (
  id                         uuid primary key default gen_random_uuid(),
  organization_id            uuid not null references organizations(id) on delete cascade,
  name                       text not null,
  sessions                   int not null check (sessions > 0),
  recommended_interval_days  int not null check (recommended_interval_days > 0),
  price_yen                  int,
  description                text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);
create index idx_course_templates_org on course_templates(organization_id);
create trigger trg_course_templates_updated before update on course_templates
  for each row execute function set_updated_at();

create table client_courses (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references clients(id) on delete cascade,
  course_template_id  uuid not null references course_templates(id) on delete restrict,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  status              text not null default 'in_progress',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_client_courses_client on client_courses(client_id);
create trigger trg_client_courses_updated before update on client_courses
  for each row execute function set_updated_at();

-- ---------- appointments ----------
create table appointments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id       uuid not null references clients(id) on delete cascade,
  therapist_id    uuid not null references therapists(id) on delete restrict,
  location_id     uuid references locations(id) on delete set null,
  scheduled_at    timestamptz not null,
  duration_min    int not null default 60,
  status          appointment_status not null default 'requested',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_appointments_org on appointments(organization_id);
create index idx_appointments_client on appointments(client_id);
create index idx_appointments_therapist on appointments(therapist_id);
create index idx_appointments_scheduled on appointments(scheduled_at);

-- Conflict guard: prevent overlapping non-cancelled appointments for the same therapist.
-- Simple guard: unique (therapist, scheduled_at) for active rows.
create unique index uq_appointments_therapist_slot
  on appointments (therapist_id, scheduled_at)
  where status in ('requested', 'confirmed');

create trigger trg_appointments_updated before update on appointments
  for each row execute function set_updated_at();

-- ---------- treatment records ----------
create table treatment_records (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null unique references appointments(id) on delete cascade,
  client_id       uuid not null references clients(id) on delete cascade,
  therapist_id    uuid not null references therapists(id) on delete restrict,
  treatment_at    timestamptz not null default now(),
  treatment_type  text not null,
  products_used   text,
  skin_findings   text,
  next_plan       text,
  conversation_memo text,
  cautions        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  locked_at       timestamptz
);
create index idx_treatment_records_client on treatment_records(client_id);
create index idx_treatment_records_therapist on treatment_records(therapist_id);
create trigger trg_treatment_records_updated before update on treatment_records
  for each row execute function set_updated_at();

-- ---------- progress photos ----------
create table progress_photos (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references clients(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  uploaded_by     uuid not null references users(id) on delete restrict,
  storage_path    text not null,
  taken_at        timestamptz not null default now(),
  photo_type      photo_type not null,
  self_rating     int check (self_rating between 1 and 5),
  caption         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index idx_progress_photos_client on progress_photos(client_id);
create index idx_progress_photos_taken on progress_photos(taken_at);
create trigger trg_progress_photos_updated before update on progress_photos
  for each row execute function set_updated_at();

-- ---------- self logs ----------
create table self_logs (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references clients(id) on delete cascade,
  logged_at       timestamptz not null default now(),
  itch_score      int not null check (itch_score between 1 and 5),
  redness_score   int not null check (redness_score between 1 and 5),
  new_breakout    boolean not null default false,
  memo            text,
  created_at      timestamptz not null default now()
);
create index idx_self_logs_client on self_logs(client_id);

-- ---------- meal logs / feedbacks ----------
create table meal_logs (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  storage_path  text,
  memo          text,
  meal_type     meal_type not null,
  logged_at     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index idx_meal_logs_client on meal_logs(client_id);
create index idx_meal_logs_logged on meal_logs(logged_at);

create table meal_feedbacks (
  id              uuid primary key default gen_random_uuid(),
  meal_log_id     uuid not null unique references meal_logs(id) on delete cascade,
  ai_draft        text,
  final_text      text,
  nutritionist_id uuid references nutritionists(id) on delete set null,
  status          feedback_status not null default 'ai_drafting',
  approved_at     timestamptz,
  sent_at         timestamptz,
  banned_word_hits text[],
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_meal_feedbacks_status on meal_feedbacks(status);
create trigger trg_meal_feedbacks_updated before update on meal_feedbacks
  for each row execute function set_updated_at();

-- ---------- conversations / messages ----------
create table conversations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  client_id       uuid not null references clients(id) on delete cascade,
  therapist_id    uuid not null references therapists(id) on delete restrict,
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index uq_conversations_pair on conversations(client_id, therapist_id);
create trigger trg_conversations_updated before update on conversations
  for each row execute function set_updated_at();

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id) on delete restrict,
  body            text,
  image_path      text,
  is_auto_reply   boolean not null default false,
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);
create index idx_messages_conversation on messages(conversation_id);

-- ---------- subscriptions / revenue share ----------
create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  subject_type           subscription_subject not null,
  subject_id             uuid not null,
  plan                   text not null,
  status                 subscription_status not null default 'trialing',
  stripe_subscription_id text unique,
  stripe_customer_id     text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index idx_subscriptions_subject on subscriptions(subject_type, subject_id);
create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

create table revenue_shares (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  b2c_subscription_id uuid not null references subscriptions(id) on delete cascade,
  percent             numeric(5,2) not null default 30.00,
  amount_yen          int not null default 0,
  period_start        timestamptz not null,
  period_end          timestamptz not null,
  settled_at          timestamptz,
  created_at          timestamptz not null default now()
);
create index idx_revenue_shares_org on revenue_shares(organization_id);

-- ---------- invites ----------
create table invites (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  target_role     invite_target_role not null,
  email           text not null,
  token           text not null unique,
  invited_by      uuid not null references users(id) on delete restrict,
  expires_at      timestamptz not null default (now() + interval '72 hours'),
  consumed_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_invites_org on invites(organization_id);
create index idx_invites_token on invites(token);

-- ---------- audit log ----------
create table audit_logs (
  id          bigserial primary key,
  actor_id    uuid references users(id) on delete set null,
  action      text not null,
  target_type text not null,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_actor on audit_logs(actor_id);
create index idx_audit_target on audit_logs(target_type, target_id);
create index idx_audit_created on audit_logs(created_at);
