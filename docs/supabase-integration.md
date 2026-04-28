# Supabase Integration Guide

## What Supabase Means In This Project

Supabase is used in two different ways here:

1. Database
   - `devinepremium-backend` can use Supabase Postgres instead of local SQLite
2. Google authentication
   - `devinepremium-frontend` uses Supabase Auth for Google sign-in

Important:

- frontend does not read/write Supabase database directly
- admin dashboard does not read/write Supabase database directly
- backend is the only layer that talks to the database
- Supabase Auth is only used for Google login verification in the current code

## Current Integration Points

### Frontend

Frontend Supabase browser client:

- [lib/supabase.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-frontend/lib/supabase.ts)
- [app/login/page.tsx](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-frontend/app/login/page.tsx)
- [app/auth/callback/page.tsx](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-frontend/app/auth/callback/page.tsx)

### Backend

Backend Supabase auth verification:

- [src/lib/supabase.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/lib/supabase.ts)
- [src/services/authService.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/services/authService.ts)

### Database driver switch

- [src/config/env.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/config/env.ts)
- [src/config/data-source.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/config/data-source.ts)

## Step 1: Create A Supabase Project

In Supabase:

1. Create a new project
2. Wait until the database is ready
3. Copy these values:
   - Project URL
   - Anon public key
   - Postgres connection string

You will use:

- Project URL + anon key in frontend
- Project URL + anon key in backend for Google token verification
- Postgres connection string in backend for the database

## Step 2: Configure Backend To Use Supabase Postgres

Create `devinepremium-backend/.env` from the example and set:

```env
PORT=4000
NODE_ENV=development

DATABASE_DRIVER=postgres
DATABASE_URL=postgresql://YOUR_SUPABASE_CONNECTION_STRING
DATABASE_SSL=true
DB_SYNCHRONIZE=false

JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

SEED_ADMIN_EMAIL=admin@devinepremium.com
SEED_ADMIN_PASSWORD=Admin@12345

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Notes:

- keep `DB_SYNCHRONIZE=false` for Supabase/Postgres
- use migrations or reviewed SQL for database changes instead of TypeORM auto-sync
- keep `DATABASE_SSL=true` for Supabase

## Step 3: Configure Frontend For Supabase Google Login

Create `devinepremium-frontend/.env` from the example and set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

This enables:

- Google sign-in button on frontend login page
- Supabase browser OAuth session
- callback handling in `/auth/callback`

## Step 4: Enable Google Provider In Supabase

In your Supabase project:

1. Open Authentication
2. Open Providers
3. Enable Google
4. Add your Google client ID
5. Add your Google client secret

## Step 5: Configure Google Cloud OAuth

In Google Cloud Console:

1. Create OAuth credentials
2. Add the authorized redirect URI required by Supabase

Use the Supabase callback URI format:

```text
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

This is the redirect URI Google should trust.

## Step 6: Configure Redirect URLs In Supabase Auth

Your frontend sends users to:

```text
http://localhost:3000/auth/callback
```

So in Supabase Auth URL configuration, allow:

```text
http://localhost:3000/auth/callback
```

For production, also allow your real frontend domain callback, for example:

```text
https://www.devinepremium.com/auth/callback
```

Why:

- Supabase finishes Google sign-in
- then sends the user back to your frontend callback page
- your frontend callback page sends the Supabase access token to your backend
- your backend verifies the token and creates/logs in the local project user

## Step 7: Understand The Real Auth Flow

The current Google login flow is:

1. Customer clicks `Continue with Google`
2. Frontend uses Supabase OAuth
3. Supabase returns user to `devinepremium-frontend/auth/callback`
4. Frontend reads the Supabase session access token
5. Frontend calls backend:
   - `POST /api/v1/auth/google`
6. Backend verifies the access token with Supabase
7. Backend finds or creates a local `users` table record
8. Backend returns the project JWT token
9. Frontend stores the project JWT and uses it for bookings/account APIs

So:

- Supabase handles Google identity
- your backend still controls app users, roles, bookings, and permissions

## Step 8: Start The Project

Run:

```bash
npm install
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

Check:

- backend health: `http://localhost:4000/health`
- frontend login: `http://localhost:3000/login`
- admin login: `http://localhost:3001/login`

## Step 9: First-Time Database Creation

For a first-time Supabase database, create tables with a reviewed migration or SQL script. Do not rely on TypeORM auto-sync against Supabase/Postgres:

```env
DATABASE_DRIVER=postgres
DB_SYNCHRONIZE=false
```

The current backend-owned tables are:

- `users`
- `services`
- `bookings`
- `payments`
- `booking_status_history`
- `saved_addresses`
- `staff_members`

If your DB was already cleaned before the service dashboard feature, run:

```sql
-- docs/supabase-services-catalog-migration.sql
```

Then restart the backend. The backend seeds the current service catalog into
`public.services` when the table is empty.

## Troubleshooting

### Error: `Tenant or user not found`

This error usually means the backend is reaching a Supabase pooler, but one of these values is wrong:

- the pooler hostname
- the pooler username
- the database password

Use this order to fix it:

1. Open Supabase dashboard
2. Click `Connect`
3. Choose the pooled Postgres connection string shown by Supabase for your project
4. Copy the exact hostname and username from that string
5. Put that exact full connection string into `devinepremium-backend/.env`

Important:

- do not guess the pooler hostname from the region
- do not change `aws-0` to `aws-1` manually or the reverse
- use the exact host Supabase shows in your own project
- if your laptop cannot reach the direct host `db.<project-ref>.supabase.co`, use the pooled connection string instead

If it still fails after copying the exact pooled string:

1. Reset the Supabase database password
2. Use a simple password with only letters and numbers for the first test
3. Update `DATABASE_URL`
4. Restart the backend

### Error: `ENETUNREACH` on `db.<project-ref>.supabase.co`

This means your network cannot reach the direct database host, commonly because the host resolves to IPv6 only on your machine.

In that case:

- do not use the direct `db.<project-ref>.supabase.co` host
- use the pooled Postgres connection string from `Connect` instead

## Recommended Production Values

### Backend production

```env
NODE_ENV=production
DATABASE_DRIVER=postgres
DATABASE_URL=postgresql://YOUR_SUPABASE_CONNECTION_STRING
DATABASE_SSL=true
DB_SYNCHRONIZE=false
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Frontend production

```env
NEXT_PUBLIC_API_BASE_URL=https://api.devinepremium.com
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Admin production

```env
NEXT_PUBLIC_API_BASE_URL=https://api.devinepremium.com
```

## Common Mistakes

### Google button shows config error

Cause:

- missing frontend env values

Fix:

- set `NEXT_PUBLIC_SUPABASE_URL`
- set `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend says Supabase auth not configured

Cause:

- missing backend `SUPABASE_URL` or `SUPABASE_ANON_KEY`

Fix:

- set both values in `devinepremium-backend/.env`

### Google login returns but callback fails

Cause:

- callback URL not allowed in Supabase Auth
- wrong Google OAuth redirect URI

Fix:

- allow `http://localhost:3000/auth/callback`
- set Google redirect to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Backend cannot connect to Supabase database

Cause:

- wrong `DATABASE_URL`
- SSL disabled

Fix:

- use the correct Postgres connection string
- keep `DATABASE_SSL=true`

## Current Limitation

Right now Supabase is not replacing your whole auth system.

Current state:

- email/password login is handled by your backend `users` table and JWT
- Google login is handled through Supabase Auth, then converted into your backend JWT session

If later you want, the project can be upgraded further to:

1. use Supabase Postgres only for database
2. keep backend JWT auth as now
3. or fully migrate all auth to Supabase Auth for email/password too

The current code already supports option 1 and the Google part of option 3.
