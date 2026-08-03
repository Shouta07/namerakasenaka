#!/usr/bin/env bash
# マイグレーションを本物の PostgreSQL に通しで流して確かめる。
#
# なぜ要るか: マイグレーションは「書いた」だけでは信用できない。
# 実際、一度も流していなかったせいで 0008 に不正な UUID リテラルが残り、
# 本番なら初回デプロイで落ちる状態のまま気づけずにいた。
#
# Supabase が用意するスキーマ（auth / storage）は最小限のスタブで代用する。
# ここで見たいのは「自分たちの SQL が通るか」であって、Supabase の再現ではない。
set -uo pipefail

PGD=${PGD:-/var/tmp/fieldcx-pg}
PORT=${PGPORT:-5433}
SOCK=/var/tmp
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)
export PATH="$BIN:$PATH"

if [ -z "$BIN" ]; then
  echo "PostgreSQL が見つかりません（このチェックは省略されます）"
  exit 0
fi

if ! pg_isready -h "$SOCK" -p "$PORT" >/dev/null 2>&1; then
  rm -rf "$PGD"; mkdir -p "$PGD"; chown postgres "$PGD" 2>/dev/null || true
  su postgres -c "$BIN/initdb -D $PGD -A trust" >/dev/null 2>&1
  su postgres -c "$BIN/pg_ctl -D $PGD -l $PGD/log -o '-k $SOCK -p $PORT' start" >/dev/null 2>&1
  sleep 2
fi

psql -h "$SOCK" -p "$PORT" -U postgres -q \
  -c "drop database if exists fieldcx_verify;" \
  -c "create database fieldcx_verify;" >/dev/null 2>&1

# Supabase 側が用意するものの最小スタブ
psql -h "$SOCK" -p "$PORT" -U postgres -d fieldcx_verify -q >/dev/null 2>&1 <<'SQL'
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.role() returns text language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key, name text, public boolean,
  file_size_limit bigint, allowed_mime_types text[]);
create table if not exists storage.objects (
  id uuid default gen_random_uuid() primary key,
  bucket_id text, name text, owner uuid, metadata jsonb);
do $$ begin
  create role anon; exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin
  create role service_role; exception when duplicate_object then null; end $$;
SQL

fail=0
for f in supabase/migrations/*.sql; do
  if psql -h "$SOCK" -p "$PORT" -U postgres -d fieldcx_verify \
      -v ON_ERROR_STOP=1 -q -f "$f" >/tmp/fieldcx-mig.log 2>&1; then
    echo "  ok   $(basename "$f")"
  else
    echo "  FAIL $(basename "$f")"
    sed -n '1,6p' /tmp/fieldcx-mig.log | sed 's/^/       /'
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  n=$(psql -h "$SOCK" -p "$PORT" -U postgres -d fieldcx_verify -tAc \
    "select count(*) from pg_tables where schemaname='public';")
  pol=$(psql -h "$SOCK" -p "$PORT" -U postgres -d fieldcx_verify -tAc \
    "select count(*) from pg_policies where schemaname='public';")
  norls=$(psql -h "$SOCK" -p "$PORT" -U postgres -d fieldcx_verify -tAc \
    "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;")
  echo "  → テーブル ${n} / ポリシー ${pol} / RLS未設定 ${norls}"
  if [ "$norls" -gt 0 ]; then
    echo "  RLS が有効でないテーブル:"
    psql -h "$SOCK" -p "$PORT" -U postgres -d fieldcx_verify -tAc \
      "select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
       where n.nspname='public' and c.relkind='r' and not c.relrowsecurity order by 1;" | sed 's/^/       /'
  fi
fi
exit "$fail"
