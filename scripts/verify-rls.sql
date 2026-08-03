-- テナント分離と同意ゲートを、本物の PostgreSQL で確かめる。
--
-- これまで「RLS を 100 本書いた」とは言えても、「破れないことを確かめた」
-- とは言えなかった。書いたポリシーは、試すまで信用しない。
--
-- 2店舗ぶんのデータを作り、片方の店舗のスタッフとして接続して、
-- もう片方が見えないことを確かめる。患者本人については
-- 「公開済み」かつ「同意が有効」のときだけ見えることを確かめる。

\set ON_ERROR_STOP on
set client_min_messages to notice;

-- ---------- 下ごしらえ ----------
-- RLS は table owner には既定で効かない。所有者以外のロールで試す。
do $$ begin create role app_user nologin; exception when duplicate_object then null; end $$;
grant usage on schema public to app_user;
grant select, insert, update, delete on all tables in schema public to app_user;

insert into organizations (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'A店'),
  ('22222222-2222-2222-2222-222222222222', 'B店');

insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-000000000001'),
  ('bbbbbbbb-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000002');

insert into users (id, email, role, organization_id, status) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@example.test', 'salon_admin',
   '11111111-1111-1111-1111-111111111111', 'active'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'b@example.test', 'salon_admin',
   '22222222-2222-2222-2222-222222222222', 'active'),
  ('cccccccc-0000-0000-0000-000000000001', 'pa@example.test', 'client',
   '11111111-1111-1111-1111-111111111111', 'active'),
  ('cccccccc-0000-0000-0000-000000000002', 'pb@example.test', 'client',
   '22222222-2222-2222-2222-222222222222', 'active');

insert into clients (id, user_id, organization_id) values
  ('dddddddd-0000-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111');

insert into guide_customers (id, organization_id, client_id, name, share_token) values
  ('eeeeeeee-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'dddddddd-0000-0000-0000-000000000001', 'A店の患者', 'tok-a'),
  ('eeeeeeee-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222', null, 'B店の患者', 'tok-b');

insert into lab_imports (id, organization_id, customer_id, collected_on, values, published_at) values
  ('ffffffff-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'eeeeeeee-0000-0000-0000-000000000001', '2026-07-20',
   '[{"rowId":"ferritin","value":42}]'::jsonb, null),
  ('ffffffff-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222',
   'eeeeeeee-0000-0000-0000-000000000002', '2026-07-20',
   '[{"rowId":"ferritin","value":99}]'::jsonb, null);

-- 検証用の小さなヘルパ。期待とずれたら例外で止まる。
create or replace function assert_eq(actual bigint, expected bigint, label text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'NG: % — 期待 % / 実際 %', label, expected, actual;
  end if;
  raise notice 'ok  %', label;
end $$;

-- ---------- A店のスタッフとして ----------
set role app_user;
set request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';

select assert_eq((select count(*) from lab_imports), 1,
  'A店スタッフに見える検査は自店の1件だけ（B店は見えない）');

select assert_eq((select count(*) from guide_customers), 1,
  'A店スタッフに見える患者は自店だけ');

-- 他店の検査を書き換えられないこと。
update lab_imports set published_at = now()
  where id = 'ffffffff-0000-0000-0000-000000000002';
select assert_eq((select count(*) from lab_imports
                  where id = 'ffffffff-0000-0000-0000-000000000002'
                    and published_at is not null), 0,
  'A店スタッフはB店の検査を公開できない');

-- 他店の患者に同意を差し込めないこと（RLS の with check が効く）。
do $$
begin
  insert into consents (organization_id, customer_id, scope, granted_by_name, method)
  values ('22222222-2222-2222-2222-222222222222',
          'eeeeeeee-0000-0000-0000-000000000002',
          'labtest_view', 'なりすまし', '店頭で口頭確認');
  raise exception 'NG: 他店の患者に同意を差し込めてしまった';
exception
  when insufficient_privilege then raise notice 'ok  他店の患者には同意を作れない';
end $$;

-- 自店にはちゃんと書ける。
insert into consents (organization_id, customer_id, scope, granted_by_name, method)
values ('11111111-1111-1111-1111-111111111111',
        'eeeeeeee-0000-0000-0000-000000000001',
        'labtest_view', 'A店スタッフ', '店頭で口頭確認');
select assert_eq((select count(*) from consents), 1, '自店には同意を記録できる');

-- 同意の記録は誰も消せない（delete ポリシーを置いていない）。
delete from consents;
select assert_eq((select count(*) from consents), 1,
  '同意の記録は削除できない（履歴として残る）');

reset role;

-- ---------- 患者ご本人として ----------
set role app_user;
set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000001';

select assert_eq((select count(*) from lab_imports), 0,
  '未公開の検査は、本人にも見えない');

reset role;
-- 店舗が公開する
update lab_imports set published_at = now()
  where id = 'ffffffff-0000-0000-0000-000000000001';

set role app_user;
set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000001';
select assert_eq((select count(*) from lab_imports), 1,
  '公開され、同意があれば本人に見える');

reset role;
-- 同意を取り消す
update consents set revoked_at = now();

set role app_user;
set request.jwt.claim.sub = 'cccccccc-0000-0000-0000-000000000001';
select assert_eq((select count(*) from lab_imports), 0,
  '同意を取り消すと、公開済みでも本人に見えなくなる');

reset role;

-- ---------- 店舗のLINEの鍵 ----------
insert into line_channels (organization_id, channel_id, bot_user_id,
                           channel_secret, channel_access_token, secret_fingerprint)
values ('11111111-1111-1111-1111-111111111111', '1234567890', 'Ubot-a',
        'secret-a', 'token-a', 'fp-a');

set role app_user;
set request.jwt.claim.sub = 'bbbbbbbb-0000-0000-0000-000000000001';
select assert_eq((select count(*) from line_channels), 0,
  'B店の管理者にA店のチャネル情報は見えない');
reset role;

-- 監査ログに鍵が入っていないこと（専用トリガで伏せているか）。
select assert_eq(
  (select count(*) from audit_logs
   where target_type = 'line_channels'
     and metadata::text like '%secret-a%'), 0,
  '監査ログにチャネルシークレットが残っていない');
select assert_eq(
  (select count(*) from audit_logs
   where target_type = 'line_channels'
     and metadata->>'secret_fingerprint' = 'fp-a'), 1,
  '監査ログには指紋だけが残っている');

-- 検査値そのものも監査ログに写していないこと。
select assert_eq(
  (select count(*) from audit_logs
   where target_type = 'lab_imports'
     and metadata::text like '%ferritin%'), 0,
  '監査ログに検査値そのものが残っていない');
