-- Senacare Phase 0 — Row Level Security
-- Every table has RLS enabled, with explicit policies per §3 of requirements.

-- ---------- helper functions ----------
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.is_salon_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'salon_admin'
  );
$$;

create or replace function public.is_therapist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'therapist'
  );
$$;

create or replace function public.is_client()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'client'
  );
$$;

create or replace function public.is_nutritionist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'nutritionist'
  );
$$;

create or replace function public.my_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clients where user_id = auth.uid();
$$;

create or replace function public.my_therapist_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.therapists where user_id = auth.uid();
$$;

create or replace function public.is_assigned_therapist(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.clients c
    join public.therapists t on t.id = c.primary_therapist_id
    where c.id = p_client_id and t.user_id = auth.uid()
  );
$$;

-- ---------- enable RLS ----------
alter table organizations    enable row level security;
alter table locations        enable row level security;
alter table users            enable row level security;
alter table profiles         enable row level security;
alter table therapists       enable row level security;
alter table nutritionists    enable row level security;
alter table clients          enable row level security;
alter table course_templates enable row level security;
alter table client_courses   enable row level security;
alter table appointments     enable row level security;
alter table treatment_records enable row level security;
alter table progress_photos  enable row level security;
alter table self_logs        enable row level security;
alter table meal_logs        enable row level security;
alter table meal_feedbacks   enable row level security;
alter table conversations    enable row level security;
alter table messages         enable row level security;
alter table subscriptions    enable row level security;
alter table revenue_shares   enable row level security;
alter table invites          enable row level security;
alter table audit_logs       enable row level security;

-- ---------- organizations ----------
create policy organizations_select on organizations for select
  using (is_super_admin() or id = current_org_id());
create policy organizations_update on organizations for update
  using (is_super_admin() or (is_salon_admin() and id = current_org_id()));
create policy organizations_insert on organizations for insert
  with check (is_super_admin());

-- ---------- locations ----------
create policy locations_select on locations for select
  using (is_super_admin() or organization_id = current_org_id());
create policy locations_write on locations for all
  using (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()))
  with check (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()));

-- ---------- users ----------
create policy users_select_self on users for select
  using (id = auth.uid() or is_super_admin() or (is_salon_admin() and organization_id = current_org_id()));
create policy users_update_self on users for update
  using (id = auth.uid() or is_super_admin() or (is_salon_admin() and organization_id = current_org_id()));
create policy users_insert_admin on users for insert
  with check (is_super_admin() or is_salon_admin());

-- ---------- profiles ----------
create policy profiles_select on profiles for select
  using (
    user_id = auth.uid()
    or is_super_admin()
    or (is_salon_admin() and exists (
      select 1 from users u where u.id = profiles.user_id and u.organization_id = current_org_id()
    ))
    or (is_therapist() and exists (
      select 1 from clients c where c.user_id = profiles.user_id and c.primary_therapist_id = my_therapist_id()
    ))
  );
create policy profiles_write on profiles for all
  using (user_id = auth.uid() or is_super_admin())
  with check (user_id = auth.uid() or is_super_admin());

-- ---------- therapists ----------
create policy therapists_select on therapists for select
  using (
    is_super_admin()
    or organization_id = current_org_id()
  );
create policy therapists_write on therapists for all
  using (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()))
  with check (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()));

-- ---------- nutritionists ----------
create policy nutritionists_select on nutritionists for select
  using (is_super_admin() or user_id = auth.uid() or is_salon_admin());
create policy nutritionists_write on nutritionists for all
  using (is_super_admin())
  with check (is_super_admin());

-- ---------- clients ----------
create policy clients_select on clients for select
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_client() and user_id = auth.uid())
    or (is_therapist() and primary_therapist_id = my_therapist_id())
  );
create policy clients_update on clients for update
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_client() and user_id = auth.uid())
  );
create policy clients_insert on clients for insert
  with check (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()));

-- ---------- course templates ----------
create policy course_templates_select on course_templates for select
  using (is_super_admin() or organization_id = current_org_id());
create policy course_templates_write on course_templates for all
  using (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()))
  with check (is_super_admin() or (is_salon_admin() and organization_id = current_org_id()));

-- ---------- client courses ----------
create policy client_courses_select on client_courses for select
  using (
    is_super_admin()
    or exists (
      select 1 from clients c
      where c.id = client_courses.client_id
        and (
          (is_salon_admin() and c.organization_id = current_org_id())
          or (is_client() and c.user_id = auth.uid())
          or (is_therapist() and c.primary_therapist_id = my_therapist_id())
        )
    )
  );
create policy client_courses_write on client_courses for all
  using (
    is_super_admin()
    or exists (
      select 1 from clients c
      where c.id = client_courses.client_id
        and is_salon_admin() and c.organization_id = current_org_id()
    )
  )
  with check (
    is_super_admin()
    or exists (
      select 1 from clients c
      where c.id = client_courses.client_id
        and is_salon_admin() and c.organization_id = current_org_id()
    )
  );

-- ---------- appointments ----------
create policy appointments_select on appointments for select
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );
create policy appointments_insert on appointments for insert
  with check (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );
create policy appointments_update on appointments for update
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );
create policy appointments_delete on appointments for delete
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
  );

-- ---------- treatment records ----------
create policy treatment_records_select on treatment_records for select
  using (
    is_super_admin()
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = treatment_records.client_id and c.organization_id = current_org_id()
    ))
    or (is_therapist() and is_assigned_therapist(client_id))
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );
create policy treatment_records_insert on treatment_records for insert
  with check (
    is_super_admin()
    or (is_therapist() and therapist_id = my_therapist_id() and is_assigned_therapist(client_id))
  );
create policy treatment_records_update on treatment_records for update
  using (
    is_super_admin()
    or (is_therapist() and therapist_id = my_therapist_id() and locked_at is null)
  );

-- ---------- progress photos ----------
create policy progress_photos_select on progress_photos for select
  using (
    is_super_admin()
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = progress_photos.client_id and c.organization_id = current_org_id()
    ))
    or (is_therapist() and is_assigned_therapist(client_id))
    or (is_client() and client_id = my_client_id())
  );
create policy progress_photos_insert on progress_photos for insert
  with check (
    is_super_admin()
    or (is_therapist() and is_assigned_therapist(client_id))
  );
create policy progress_photos_update on progress_photos for update
  using (
    is_super_admin()
    or (is_therapist() and is_assigned_therapist(client_id))
    or (is_client() and client_id = my_client_id())
  );

-- ---------- self logs ----------
create policy self_logs_select on self_logs for select
  using (
    is_super_admin()
    or (is_client() and client_id = my_client_id())
    or (is_therapist() and is_assigned_therapist(client_id))
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = self_logs.client_id and c.organization_id = current_org_id()
    ))
  );
create policy self_logs_insert on self_logs for insert
  with check (is_super_admin() or (is_client() and client_id = my_client_id()));

-- ---------- meal logs ----------
create policy meal_logs_select on meal_logs for select
  using (
    is_super_admin()
    or (is_client() and client_id = my_client_id())
    or is_nutritionist()
    or (is_salon_admin() and exists (
      select 1 from clients c where c.id = meal_logs.client_id and c.organization_id = current_org_id()
    ))
  );
create policy meal_logs_insert on meal_logs for insert
  with check (is_super_admin() or (is_client() and client_id = my_client_id()));

-- ---------- meal feedbacks ----------
create policy meal_feedbacks_select on meal_feedbacks for select
  using (
    is_super_admin()
    or is_nutritionist()
    or (is_client() and exists (
      select 1 from meal_logs ml where ml.id = meal_feedbacks.meal_log_id and ml.client_id = my_client_id()
    ))
  );
create policy meal_feedbacks_update on meal_feedbacks for update
  using (is_super_admin() or is_nutritionist());
create policy meal_feedbacks_insert on meal_feedbacks for insert
  with check (is_super_admin() or is_nutritionist());

-- ---------- conversations ----------
create policy conversations_select on conversations for select
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );
create policy conversations_insert on conversations for insert
  with check (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );
create policy conversations_update on conversations for update
  using (
    is_super_admin()
    or (is_therapist() and therapist_id = my_therapist_id())
    or (is_client() and client_id = my_client_id())
  );

-- ---------- messages ----------
create policy messages_select on messages for select
  using (
    is_super_admin()
    or exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (
          (is_salon_admin() and c.organization_id = current_org_id())
          or (is_therapist() and c.therapist_id = my_therapist_id())
          or (is_client() and c.client_id = my_client_id())
        )
    )
  );
create policy messages_insert on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (
          (is_therapist() and c.therapist_id = my_therapist_id())
          or (is_client() and c.client_id = my_client_id())
        )
    )
  );
create policy messages_update on messages for update
  using (
    is_super_admin()
    or exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (
          (is_therapist() and c.therapist_id = my_therapist_id())
          or (is_client() and c.client_id = my_client_id())
        )
    )
  );

-- ---------- subscriptions ----------
create policy subscriptions_select on subscriptions for select
  using (
    is_super_admin()
    or (subject_type = 'organization' and subject_id = current_org_id() and is_salon_admin())
    or (subject_type = 'client' and exists (
      select 1 from clients c where c.id = subscriptions.subject_id and c.user_id = auth.uid()
    ))
  );

-- ---------- revenue shares ----------
create policy revenue_shares_select on revenue_shares for select
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
  );

-- ---------- invites ----------
create policy invites_select on invites for select
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
  );
create policy invites_insert on invites for insert
  with check (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
  );
create policy invites_update on invites for update
  using (
    is_super_admin()
    or (is_salon_admin() and organization_id = current_org_id())
  );

-- ---------- audit logs ----------
-- Read-only for SuperAdmin; writes happen via service-role only.
create policy audit_logs_select on audit_logs for select
  using (is_super_admin());
