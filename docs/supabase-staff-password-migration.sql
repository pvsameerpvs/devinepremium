-- Devine Premium staff password hash migration.
--
-- Adds passwordHash column to staff_members so staff can log in
-- via the staff PWA. Run this once on your Supabase database.

begin;

alter table public.staff_members
  add column if not exists "passwordHash" varchar;

comment on column public.staff_members."passwordHash" is
  'bcrypt hash for staff PWA authentication';

commit;

-- After running:
-- 1. Set a password for each staff member via the admin dashboard.
-- 2. Staff can then log in at the staff PWA.
