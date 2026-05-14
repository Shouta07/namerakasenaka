-- Senacare Phase 0 — Storage buckets and policies
-- Progress photos are 要配慮個人情報相当 (sensitive). Private bucket; signed URLs only.

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', false)
on conflict (id) do nothing;

-- Object path convention:
--   progress-photos/<organization_id>/<client_id>/<photo_id>.<ext>
--   meal-photos/<client_id>/<meal_log_id>.<ext>
--   message-attachments/<conversation_id>/<message_id>.<ext>

-- ---------- progress-photos ----------
create policy "progress_photos_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'progress-photos'
  and (
    public.is_super_admin()
    or exists (
      select 1
      from public.progress_photos p
      join public.clients c on c.id = p.client_id
      where p.storage_path = storage.objects.name
        and (
          (public.is_salon_admin() and c.organization_id = public.current_org_id())
          or (public.is_therapist() and public.is_assigned_therapist(c.id))
          or (public.is_client() and c.user_id = auth.uid())
        )
    )
  )
);

create policy "progress_photos_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'progress-photos'
  and (public.is_therapist() or public.is_salon_admin() or public.is_super_admin())
);

create policy "progress_photos_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'progress-photos'
  and (public.is_super_admin() or public.is_salon_admin())
);

-- ---------- meal-photos ----------
create policy "meal_photos_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meal-photos'
  and (
    public.is_super_admin()
    or public.is_nutritionist()
    or exists (
      select 1 from public.meal_logs ml
      where ml.storage_path = storage.objects.name
        and ml.client_id = public.my_client_id()
    )
  )
);

create policy "meal_photos_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meal-photos'
  and public.is_client()
);

-- ---------- message-attachments ----------
create policy "message_attachments_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'message-attachments'
  and (public.is_super_admin() or auth.role() = 'authenticated')
);

create policy "message_attachments_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'message-attachments'
  and auth.role() = 'authenticated'
);
