-- Devine Premium service categories migration.
--
-- Adds the service_categories table and a categoryId FK on services.
-- Run this once on your Supabase database before starting the updated backend.

begin;

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug varchar(128) not null unique,
  title varchar(255) not null,
  description text,
  "imageUrl" text,
  "sortOrder" integer not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

alter table public.service_categories enable row level security;
revoke all on table public.service_categories from anon, authenticated;

create index if not exists "idx_service_categories_slug"
  on public.service_categories(slug);

create index if not exists "idx_service_categories_isActive_sortOrder"
  on public.service_categories("isActive", "sortOrder");

alter table public.services
  add column if not exists "categoryId" varchar;

create index if not exists "idx_services_categoryId"
  on public.services("categoryId");

commit;

-- After this migration:
-- 1. Restart backend.
-- 2. Backend will seed default categories and link services to them.
-- 3. Verify:
--    select sc.title as category, s.title as service
--    from public.services s
--    left join public.service_categories sc on sc.id::varchar = s."categoryId"
--    order by sc."sortOrder", s."sortOrder";
