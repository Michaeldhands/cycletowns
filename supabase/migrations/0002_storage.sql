-- Media bucket for town photos, article images and avatars. Public read; admins write; riders write their own avatars.
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects for insert with check (bucket_id = 'media' and (is_admin() or (storage.foldername(name))[1] = 'avatars'));
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update using (bucket_id = 'media' and (is_admin() or owner = auth.uid()));
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete using (bucket_id = 'media' and (is_admin() or owner = auth.uid()));

-- allow admins to insert towns with any status; keep updated_at fresh
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists towns_touch on towns;
create trigger towns_touch before update on towns for each row execute function touch_updated_at();
