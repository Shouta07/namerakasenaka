-- 0011: 店舗の公式LINEとの接続 / 同意の記録 / 検査結果の取り込み
--
-- 設計の軸:
--   * 公式アカウントは店舗のもの。こちらは接続させてもらう側。
--     鍵は店舗が自分で登録し、こちらは代行しない（責任分界をスキーマにも通す）。
--   * 同意はフラグではなく記録。いつ・誰が・何について・どう確認したかを残す。
--     取り消しは行を消さず revoked_at を立てる（取り消したことも履歴）。
--   * 検査結果は取り込んだだけでは患者に見えない。published_at が立ち、
--     かつ同意が有効なときだけ見える。

-- ---------------------------------------------------------------
-- 店舗ごとの LINE チャネル
-- ---------------------------------------------------------------

create table line_channels (
  organization_id        uuid primary key references organizations(id) on delete cascade,
  channel_id             text not null,
  -- Webhook の destination がこれと一致する = そのテナント宛て。
  -- 1本の webhook で全テナントを受けるので、ここは全体で一意。
  bot_user_id            text not null unique,
  -- TODO(phase-1): KMS で包んでから入れる。アプリのDB暗号化だけに頼らない。
  -- ダンプが漏れても、そのままでは使えない状態にすること。
  channel_secret         text not null,
  channel_access_token   text not null,
  -- 鍵を見せずに「同じ鍵か」を店舗に答えるための短い指紋。
  secret_fingerprint     text not null,
  connected_by           uuid references users(id) on delete set null,
  connected_at           timestamptz not null default now(),
  last_checked_at        timestamptz,
  last_check_ok          boolean,
  disconnected_at        timestamptz
);

create index idx_line_channels_bot on line_channels (bot_user_id)
  where disconnected_at is null;

alter table line_channels enable row level security;

-- 登録・変更・解除ができるのは、その店舗の管理者だけ。
-- セラピストにも開けない（当社が代行しない以上、権限を広げる理由が無い）。
create policy line_channels_select on line_channels for select
  using (
    is_super_admin()
    or (organization_id = current_org_id() and is_salon_admin())
  );

create policy line_channels_insert on line_channels for insert
  with check (organization_id = current_org_id() and is_salon_admin());

create policy line_channels_update on line_channels for update
  using (organization_id = current_org_id() and is_salon_admin());

create policy line_channels_delete on line_channels for delete
  using (organization_id = current_org_id() and is_salon_admin());

-- ---------------------------------------------------------------
-- 同意の記録
-- ---------------------------------------------------------------

create type consent_scope as enum (
  'labtest_view',  -- 検査結果を、ご本人の画面に表示する
  'line_share',    -- 経過を LINE で受け取る
  'photo_view'     -- 施術前後の写真を、ご本人の画面に表示する
);

create type consent_method as enum (
  '店頭で口頭確認',
  '同意書に署名',
  'LINEで確認'
);

create table consents (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  customer_id      uuid not null references guide_customers(id) on delete cascade,
  scope            consent_scope not null,
  granted_at       timestamptz not null default now(),
  -- 誰が確認したか。分からない同意は、あとで説明できない。
  granted_by       uuid references users(id) on delete set null,
  granted_by_name  text not null,
  method           consent_method not null,
  -- 取り消しても行は消さない。「取り消した」ことも履歴。
  revoked_at       timestamptz
);

-- 同じ目的の記録が複数あるときは、いちばん新しいものが現在の意思。
create index idx_consents_lookup on consents (customer_id, scope, granted_at desc);
create index idx_consents_org on consents (organization_id);

alter table consents enable row level security;

create policy consents_select on consents for select
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
  );

create policy consents_insert on consents for insert
  with check (
    organization_id = current_org_id()
    and (is_salon_admin() or is_therapist())
  );

-- 取り消し（revoked_at を立てる）だけを許す。過去の記録は書き換えさせない。
create policy consents_update on consents for update
  using (
    organization_id = current_org_id()
    and (is_salon_admin() or is_therapist())
  );

-- 同意の記録は消さない。delete ポリシーを置かない = 誰も消せない。

-- ---------------------------------------------------------------
-- 検査結果の取り込み
-- ---------------------------------------------------------------

create table lab_imports (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  customer_id      uuid not null references guide_customers(id) on delete cascade,
  collected_on     date not null,
  -- [{ rowId, value, sourceLabel, sourceUnit }]
  values           jsonb not null default '[]'::jsonb,
  source_file_name text not null default '',
  -- 読み取れなかった行数。0 でないことを隠さないための列。
  unparsed_count   integer not null default 0,
  imported_by      uuid references users(id) on delete set null,
  imported_by_name text not null default '',
  imported_at      timestamptz not null default now(),
  -- 患者の画面に出した日時。null なら未公開。
  -- 公開していても、同意が取り消されていれば見えない（判定はアプリ側）。
  published_at     timestamptz
);

create index idx_lab_imports_customer on lab_imports (customer_id, collected_on desc);
create index idx_lab_imports_org on lab_imports (organization_id);

alter table lab_imports enable row level security;

-- ポリシーの中で他のテーブルを引くときは、security definer の関数にする。
--
-- ポリシー式に直接 `exists (select ... from guide_customers ...)` と書くと、
-- **その内側のクエリにも RLS がかかる**。患者は guide_customers も consents も
-- 自分では読めないので、内側が常に0行になり、
-- 「公開済みで同意もあるのに、本人にだけ永久に見えない」状態になる。
-- 実際に PostgreSQL で流して初めて気づいた（scripts/verify-rls.sql）。
create or replace function public.is_own_guide_customer(p_customer uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from guide_customers g
    join clients c on c.id = g.client_id
    where g.id = p_customer
      and c.user_id = auth.uid()
  );
$$;

create or replace function public.has_active_consent(
  p_customer uuid,
  p_scope consent_scope
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from consents k
    where k.customer_id = p_customer
      and k.scope = p_scope
      and k.revoked_at is null
  );
$$;

create policy lab_imports_select on lab_imports for select
  using (
    is_super_admin()
    or (
      organization_id = current_org_id()
      and (is_salon_admin() or is_therapist())
    )
    -- ご本人は、公開されていて、かつ同意が有効なぶんだけ見える。
    or (
      published_at is not null
      and is_own_guide_customer(customer_id)
      and has_active_consent(customer_id, 'labtest_view')
    )
  );

create policy lab_imports_insert on lab_imports for insert
  with check (
    organization_id = current_org_id()
    and (is_salon_admin() or is_therapist())
  );

create policy lab_imports_update on lab_imports for update
  using (
    organization_id = current_org_id()
    and (is_salon_admin() or is_therapist())
  );

create policy lab_imports_delete on lab_imports for delete
  using (organization_id = current_org_id() and is_salon_admin());

-- ---------------------------------------------------------------
-- 患者と LINE のひもづけ
-- ---------------------------------------------------------------

-- LINE のユーザーIDはプロバイダー単位で一意。店舗ごとにプロバイダーが違うので、
-- 同じ人でも店舗が違えば別のIDになる。単独で一意にしてはいけない。
alter table guide_customers add column line_user_id text;

create unique index idx_guide_customers_line
  on guide_customers (organization_id, line_user_id)
  where line_user_id is not null;

-- line_channels には汎用の audit_write() を付けてはいけない。
-- あれは to_jsonb(new) で行全体を監査ログに書くので、
-- **店舗のシークレットとアクセストークンが平文でログに残る**。
-- 鍵が漏れる最頻の経路は攻撃ではなくログなので、専用の関数で伏せる。
-- （また line_channels は organization_id が主キーで id 列が無いため、
--   汎用関数の new.id 参照はそもそも実行時に落ちる。）
create or replace function public.audit_line_channel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row       record;
  v_target_id text;
begin
  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;
  v_target_id := v_row.organization_id::text;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    v_target_id,
    -- 載せてよいのは指紋まで。鍵そのものは絶対に載せない。
    jsonb_build_object(
      'channel_id', v_row.channel_id,
      'bot_user_id', v_row.bot_user_id,
      'secret_fingerprint', v_row.secret_fingerprint,
      'disconnected_at', v_row.disconnected_at
    )
  );

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

create trigger trg_audit_line_channels
  after insert or update or delete on line_channels
  for each row execute function audit_line_channel();

create trigger trg_audit_consents
  after insert or update or delete on consents
  for each row execute function audit_write();

-- lab_imports にも汎用関数を付けない。
-- values には検査値そのもの（要配慮個人情報）が入っており、
-- to_jsonb(new) で監査ログに写すと、公開/取り下げのたびに
-- 同じ健康情報が audit_logs 側に増えていく。
-- 監査に必要なのは「誰が・いつ・どの取り込みを・どうしたか」であって、
-- 値そのものではない。項目数だけ残して、中身は残さない。
create or replace function public.audit_lab_import()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  if tg_op = 'DELETE' then
    v_row := old;
  else
    v_row := new;
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    v_row.id::text,
    jsonb_build_object(
      'customer_id', v_row.customer_id,
      'collected_on', v_row.collected_on,
      'value_count', jsonb_array_length(v_row.values),
      'unparsed_count', v_row.unparsed_count,
      'published_at', v_row.published_at
    )
  );

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

create trigger trg_audit_lab_imports
  after insert or update or delete on lab_imports
  for each row execute function audit_lab_import();
