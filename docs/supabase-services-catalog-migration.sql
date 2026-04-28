-- Devine Premium service catalog migration.
--
-- Run this once on an already-clean DB before starting the updated backend.
-- It keeps existing users/bookings and adds the simple dashboard-controlled
-- services table plus booking service snapshots.

begin;

create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  slug varchar(128) not null unique,
  description text,
  "imageUrl" text,
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 0,
  "basePrice" double precision not null default 0,
  "priceUnit" varchar(64),
  "pricingMode" varchar(32) not null default 'package',
  "pricingConfig" text not null default '{}',
  options text not null default '[]',
  expectations text not null default '[]',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

alter table public.bookings
  add column if not exists "serviceSnapshot" text;

create index if not exists "idx_services_slug" on public.services(slug);
create index if not exists "idx_services_isActive_sortOrder"
  on public.services("isActive", "sortOrder");

alter table public.services enable row level security;
revoke all on table public.services from anon, authenticated;

commit;

-- After this migration:
-- 1. Restart backend.
-- 2. Backend will seed the current services into public.services if empty.
-- 3. Verify:
--    select title, slug, "pricingMode", "isActive"
--    from public.services
--    order by "sortOrder", title;
