-- Senacare Phase 0 — local dev seed
-- Run with: supabase db reset
-- Note: This seed assumes auth.users entries exist with the matching UUIDs.
-- For local dev, create them first via the Supabase Studio Auth panel or supabase auth admin commands.

-- Placeholder UUIDs (replace with real auth.users ids when bootstrapping locally).
-- These map to:
--   00000000-0000-0000-0000-000000000001  → salon admin
--   00000000-0000-0000-0000-000000000002  → therapist
--   00000000-0000-0000-0000-000000000003  → client
--   00000000-0000-0000-0000-000000000004  → nutritionist

insert into organizations (id, name, plan, billing_mode)
values ('11111111-1111-1111-1111-111111111111', 'carat (なめらかせなか)', 'starter', 'B2B_ONLY')
on conflict (id) do nothing;

insert into locations (id, organization_id, name, address)
values ('22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        '本店', '東京都港区')
on conflict (id) do nothing;

-- Users — these require matching rows in auth.users. Seeds may fail if absent;
-- in that case create the auth users first or comment out this section.
insert into users (id, email, role, organization_id, status)
values
  ('00000000-0000-0000-0000-000000000001', 'admin@senacare.local',        'salon_admin',  '11111111-1111-1111-1111-111111111111', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'therapist@senacare.local',    'therapist',    '11111111-1111-1111-1111-111111111111', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'client@senacare.local',       'client',       '11111111-1111-1111-1111-111111111111', 'active'),
  ('00000000-0000-0000-0000-000000000004', 'nutritionist@senacare.local', 'nutritionist', null,                                    'active')
on conflict (id) do nothing;

insert into profiles (user_id, name, phone)
values
  ('00000000-0000-0000-0000-000000000001', '管理者 太郎',     '03-0000-0001'),
  ('00000000-0000-0000-0000-000000000002', '施術者 花子',     '03-0000-0002'),
  ('00000000-0000-0000-0000-000000000003', '顧客 一郎',       '03-0000-0003'),
  ('00000000-0000-0000-0000-000000000004', '栄養士 次郎',     '03-0000-0004')
on conflict (user_id) do nothing;

insert into therapists (id, user_id, organization_id, location_id, status, hire_date)
values ('33333333-3333-3333-3333-333333333333',
        '00000000-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'active', current_date)
on conflict (id) do nothing;

insert into clients (id, user_id, organization_id, location_id, primary_therapist_id, skin_type, concerns)
values ('44444444-4444-4444-4444-444444444444',
        '00000000-0000-0000-0000-000000000003',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '混合肌', '背中ニキビ・くすみ')
on conflict (id) do nothing;

insert into nutritionists (id, user_id, license_number)
values ('55555555-5555-5555-5555-555555555555',
        '00000000-0000-0000-0000-000000000004',
        'RD-0000001')
on conflict (id) do nothing;

insert into course_templates (id, organization_id, name, sessions, recommended_interval_days, price_yen, description)
values ('66666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        'なめらかせなか 基本コース 6回',
        6, 21, 300000,
        '6回コース、推奨間隔3週間')
on conflict (id) do nothing;
