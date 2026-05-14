-- Senacare Phase 0 — Audit log triggers
-- Records every write (INSERT/UPDATE/DELETE) on sensitive tables.

create or replace function public.audit_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_id text;
  v_metadata  jsonb;
begin
  if tg_op = 'DELETE' then
    v_target_id := coalesce(old.id::text, '');
    v_metadata := jsonb_build_object('before', to_jsonb(old));
  elsif tg_op = 'UPDATE' then
    v_target_id := coalesce(new.id::text, old.id::text, '');
    v_metadata := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
  else
    v_target_id := coalesce(new.id::text, '');
    v_metadata := jsonb_build_object('after', to_jsonb(new));
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    v_target_id,
    v_metadata
  );

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

-- Attach to sensitive tables only (avoid log explosion on high-volume tables like messages).
create trigger trg_audit_progress_photos
  after insert or update or delete on progress_photos
  for each row execute function audit_write();

create trigger trg_audit_treatment_records
  after insert or update or delete on treatment_records
  for each row execute function audit_write();

create trigger trg_audit_meal_feedbacks
  after insert or update or delete on meal_feedbacks
  for each row execute function audit_write();

create trigger trg_audit_clients
  after insert or update or delete on clients
  for each row execute function audit_write();

create trigger trg_audit_users
  after insert or update or delete on users
  for each row execute function audit_write();

create trigger trg_audit_invites
  after insert or update or delete on invites
  for each row execute function audit_write();

create trigger trg_audit_subscriptions
  after insert or update or delete on subscriptions
  for each row execute function audit_write();
