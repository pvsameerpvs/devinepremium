-- Supabase hardening for backend-owned tables.
--
-- The frontend/admin apps do not query these tables through the Supabase anon
-- client. They go through devinepremium-backend, which connects with
-- DATABASE_URL and performs app-level authorization.
--
-- Run this in Supabase SQL Editor after confirming the backend is using the
-- Postgres connection string, not the public anon key, for these tables.

begin;

alter table public.users enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.staff_members enable row level security;
alter table public.services enable row level security;

revoke all on table public.users from anon, authenticated;
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.booking_status_history from anon, authenticated;
revoke all on table public.saved_addresses from anon, authenticated;
revoke all on table public.staff_members from anon, authenticated;
revoke all on table public.services from anon, authenticated;

commit;

-- Verification:
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in (
--     'users',
--     'bookings',
--     'payments',
--     'booking_status_history',
--     'saved_addresses',
--     'services',
--     'staff_members'
--   )
-- order by tablename;
