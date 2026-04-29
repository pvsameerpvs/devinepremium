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

## Stripe Online Payments

The customer app uses Stripe Checkout for online booking payments.

Backend env required:

```text
CUSTOMER_APP_URL=https://www.devinepremium.com
STRIPE_SECRET_KEY=sk_test_or_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ALLOW_MOCK_PAYMENTS=false
```

Stripe webhook endpoint:

```text
https://api.devinepremium.com/api/v1/payments/stripe/webhook
```

Subscribe the endpoint to these events:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
payment_intent.payment_failed
charge.succeeded
charge.updated
charge.refunded
```

For local testing, forward Stripe events to the backend:

```bash
stripe listen --forward-to localhost:4000/api/v1/payments/stripe/webhook
```

Use sandbox keys first. When you go live, replace test keys with live keys and
create the live webhook endpoint/signing secret in the Stripe Dashboard.

If your production database already exists and `DB_SYNCHRONIZE=false`, run:

```text
docs/supabase-stripe-payments-migration.sql
```
