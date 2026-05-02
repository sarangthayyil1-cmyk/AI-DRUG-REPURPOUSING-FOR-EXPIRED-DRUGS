-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: "insert or update on table 'analyses' violates foreign key constraint
--       analyses_user_id_fkey" (Postgres error code 23503)
--
-- Root cause: analyses.user_id was wired to profiles(id), but the
-- profiles row may not exist for users who signed up before the
-- handle_new_user trigger was applied. Repointing the FK to
-- auth.users(id) removes that dependency entirely — every authenticated
-- user is guaranteed to have a row in auth.users.
--
-- Run this once in your Supabase project (SQL Editor).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Backfill missing profile rows for any existing auth users (harmless if
--    profiles already covers them).
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2. Drop the old FK on analyses.user_id (which referenced profiles).
alter table public.analyses
  drop constraint if exists analyses_user_id_fkey;

-- 3. Add a new FK that references auth.users directly.
alter table public.analyses
  add constraint analyses_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- 4. Make sure RLS policies on analyses still allow each user to read/write
--    only their own rows (idempotent — re-creates if missing).
alter table public.analyses enable row level security;

drop policy if exists "Users can view their own analyses." on public.analyses;
create policy "Users can view their own analyses." on public.analyses
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own analyses." on public.analyses;
create policy "Users can insert their own analyses." on public.analyses
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own analyses." on public.analyses;
create policy "Users can delete their own analyses." on public.analyses
  for delete using (auth.uid() = user_id);
