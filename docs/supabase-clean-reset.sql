-- Devine Premium clean Supabase reset.
--
-- WARNING:
-- This drops every table in the public schema and permanently deletes all data
-- in those tables. It also drops any custom non-Supabase schemas if present.
-- It does not drop Supabase-managed auth/storage/realtime schemas, API keys,
-- project ID, extensions, or Postgres system schemas.
--
-- Use when this Supabase project should become a clean Devine Premium DB.
-- After running it, keep devinepremium-backend DB_SYNCHRONIZE=false and restart
-- the backend so it can seed the admin user.

begin;

create extension if not exists pgcrypto;

do $$
declare
  schema_record record;
  table_record record;
begin
  for schema_record in
    select schema_name
    from information_schema.schemata
    where schema_name not in (
      'auth',
      'extensions',
      'graphql',
      'graphql_public',
      'information_schema',
      'net',
      'pg_catalog',
      'pgbouncer',
      'public',
      'realtime',
      'storage',
      'supabase_functions',
      'supabase_migrations',
      'vault'
    )
    and schema_name not like 'pg_temp_%'
    and schema_name not like 'pg_toast%'
  loop
    execute format('drop schema if exists %I cascade', schema_record.schema_name);
  end loop;

  for table_record in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('drop table if exists public.%I cascade', table_record.tablename);
  end loop;
end $$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  "fullName" varchar(255) not null,
  phone varchar(255),
  "defaultInstructions" text,
  "passwordHash" varchar(255) not null,
  role varchar(32) not null default 'user',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  "fullName" varchar(255) not null,
  slug varchar(255) unique,
  email varchar(255),
  phone varchar(64),
  "availabilityDays" text not null,
  notes text,
  "profilePhotoUrl" text,
  "documentImageUrls" text,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  "bookingReference" varchar(64) not null unique,
  "serviceId" varchar(128) not null,
  "serviceSlug" varchar(128) not null,
  "serviceTitle" varchar(255) not null,
  "serviceOptions" text not null,
  address text not null,
  schedule text not null,
  pricing text not null,
  status varchar(32) not null default 'pending',
  "paymentMethod" varchar(32) not null default 'cash',
  "paymentStatus" varchar(32) not null default 'cash_due',
  "contactName" varchar(255) not null,
  "contactEmail" varchar(255) not null,
  "contactPhone" varchar(32),
  notes text,
  "customerRequest" text,
  "assignedStaffId" uuid references public.staff_members(id) on delete set null,
  "assignedAt" varchar,
  subtotal double precision not null default 0,
  "discountAmount" double precision not null default 0,
  "vatAmount" double precision not null default 0,
  "totalAmount" double precision not null default 0,
  currency varchar(8) not null default 'AED',
  "userId" uuid references public.users(id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  "bookingId" uuid not null references public.bookings(id) on delete cascade,
  "userId" uuid references public.users(id) on delete set null,
  "payerEmail" varchar(255) not null,
  method varchar(32) not null,
  provider varchar(64) not null,
  status varchar(32) not null,
  amount double precision not null default 0,
  currency varchar(8) not null default 'AED',
  "checkoutReference" varchar(96) not null unique,
  metadata text,
  "paidAt" varchar,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  "bookingId" uuid not null references public.bookings(id) on delete cascade,
  "changedByUserId" uuid references public.users(id) on delete set null,
  "fromStatus" varchar,
  "toStatus" varchar not null,
  note text,
  "createdAt" timestamptz not null default now()
);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  label varchar(80) not null,
  location varchar(255) not null,
  building varchar(255),
  apartment varchar(255),
  city varchar(120) not null,
  "mapLink" text,
  lat varchar(48),
  lng varchar(48),
  "isDefault" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index "idx_bookings_userId" on public.bookings("userId");
create index "idx_bookings_assignedStaffId" on public.bookings("assignedStaffId");
create index "idx_bookings_status" on public.bookings(status);
create index "idx_bookings_paymentStatus" on public.bookings("paymentStatus");
create index "idx_payments_bookingId" on public.payments("bookingId");
create index "idx_payments_userId" on public.payments("userId");
create index "idx_booking_status_history_bookingId"
  on public.booking_status_history("bookingId");
create index "idx_saved_addresses_userId" on public.saved_addresses("userId");

alter table public.users enable row level security;
alter table public.staff_members enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.saved_addresses enable row level security;

revoke all on table public.users from anon, authenticated;
revoke all on table public.staff_members from anon, authenticated;
revoke all on table public.bookings from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.booking_status_history from anon, authenticated;
revoke all on table public.saved_addresses from anon, authenticated;

commit;

-- Verify after running:
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;
