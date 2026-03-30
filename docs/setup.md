# Setup Guide

## 1. Install workspace dependencies

```bash
npm install
```

## 2. Create env files

Copy these examples:

- `devinepremium-frontend/.env.example`
- `devinepremium-admin-dashboard/.env.example`
- `devinepremium-backend/.env.example`

## 3. Start the backend

```bash
npm run dev:backend
```

Default local API URL:

```text
http://localhost:4000
```

Default seeded admin account:

```text
email: admin@devinepremium.com
password: Admin@12345
```

Change this in backend env before production.

## 4. Start the customer frontend

```bash
npm run dev:frontend
```

Default local URL:

```text
http://localhost:3000
```

## 5. Start the admin dashboard

```bash
npm run dev:admin
```

Default local URL:

```text
http://localhost:3001
```

## Separate Hosting Recommendation

- Host `devinepremium-frontend` on one domain/subdomain.
- Host `devinepremium-admin-dashboard` on a separate admin domain/subdomain.
- Host `devinepremium-backend` on its own API domain/subdomain.

Example:

- `www.devinepremium.com`
- `admin.devinepremium.com`
- `api.devinepremium.com`

## Supabase Production Setup

Use the Supabase Postgres connection string in backend env:

```text
DATABASE_DRIVER=postgres
DATABASE_URL=postgresql://...
DATABASE_SSL=true
DB_SYNCHRONIZE=false
```

Before turning off `DB_SYNCHRONIZE`, create a real migration workflow.
