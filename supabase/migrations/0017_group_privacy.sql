-- Private groups were not private.
--
-- Three separate holes, all of which let a signed-out visitor read what the UI labelled
-- "🔒 Private group":
--
--   1. posts_read allowed any published post to be read by anyone, and a post written inside
--      a group carries both group_id and town_id — so it appeared on /feed and on the town
--      guide, and could be read straight from PostgREST with the public key.
--   2. gm_own constrained user_id but not role, so any signed-in user could insert themselves
--      into any group as 'admin', bypassing the approval gate the UI politely implements.
--   3. gm_read was `using (true)`, exposing a private group's full member roster.
--
-- The UI's approval flow was courtesy, not enforcement. This migration moves the rule into
-- the database, where it cannot be bypassed by talking to the API directly.

-- ---------------------------------------------------------------- helpers
-- security definer so these can read group_members without recursing through its own policies.

/** Is the caller an approved member of this group? */
create or replace function is_group_member(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from group_members
    where group_id = g and user_id = auth.uid() and role in ('member', 'admin')
  );
$$;

/** Does the caller run this group? */
create or replace function is_group_admin(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from group_members
    where group_id = g and user_id = auth.uid() and role = 'admin'
  );
$$;

/** May the caller see what happens inside this group? */
create or replace function can_see_group(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select privacy = 'public' from groups where id = g),
    false
  ) or is_group_member(g) or is_admin();
$$;

grant execute on function is_group_member(uuid), is_group_admin(uuid), can_see_group(uuid) to anon, authenticated;

-- ---------------------------------------------------------------- posts
-- A post inside a group is visible only to people who can see that group. Posts with no
-- group_id are ordinary town posts and stay public.
drop policy if exists posts_read on posts;
create policy posts_read on posts for select using (
  (status = 'published' and (group_id is null or can_see_group(group_id)))
  or auth.uid() = user_id
  or is_admin()
);

-- ---------------------------------------------------------------- membership
-- The roster of a private group is part of the private group.
drop policy if exists gm_read on group_members;
create policy gm_read on group_members for select using (can_see_group(group_id) or auth.uid() = user_id);

-- Joining. You may only add YOURSELF, never as 'admin', and only straight to 'member' when
-- the group is public — a private group must go through 'pending'. Creating a group makes you
-- its admin via the trigger below, not by inserting the row yourself.
drop policy if exists gm_own on group_members;
drop policy if exists gm_join on group_members;
create policy gm_join on group_members for insert with check (
  is_admin()
  or (
    auth.uid() = user_id
    and (
      role = 'pending'
      or (role = 'member' and coalesce((select privacy = 'public' from groups where id = group_id), false))
    )
  )
);

-- Leaving, and being approved. You can always remove yourself; a group's admin can approve
-- or remove its members. Nobody can promote themselves.
drop policy if exists gm_leave on group_members;
create policy gm_leave on group_members for delete using (auth.uid() = user_id or is_group_admin(group_id) or is_admin());

drop policy if exists gm_manage on group_members;
create policy gm_manage on group_members for update using (is_group_admin(group_id) or is_admin())
  with check (role in ('pending', 'member', 'admin'));

-- ---------------------------------------------------------------- groups
-- The directory entry stays readable so a rider can find a private group and ask to join —
-- that is what "private" means here: the members and the conversation are private, the
-- group's existence is not. Its description is written to be listed, so it stays public too.
-- Only the group's own admins (or a site admin) may edit or delete it.
drop policy if exists groups_write on groups;
drop policy if exists groups_update on groups;
create policy groups_update on groups for update using (is_group_admin(id) or is_admin());
drop policy if exists groups_delete on groups;
create policy groups_delete on groups for delete using (is_group_admin(id) or is_admin());

-- Whoever creates a group becomes its admin, rather than inserting that row from the browser
-- (which gm_join now correctly refuses).
create or replace function on_group_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into group_members (group_id, user_id, role)
    values (new.id, new.created_by, 'admin')
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists groups_owner on groups;
create trigger groups_owner after insert on groups for each row execute function on_group_insert();
