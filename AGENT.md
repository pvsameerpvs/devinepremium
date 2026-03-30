# Devine Premium Agent Guide

## Project Guardrails

- Keep the existing `devinepremium-frontend` landing and marketing UI intact unless the user explicitly asks for a visual change.
- Add new product features through new routes, helpers, and backend APIs first.
- Treat `devinepremium-backend` as the single source of truth for auth, bookings, statuses, and payments.
- Keep `devinepremium-frontend`, `devinepremium-admin-dashboard`, and `devinepremium-backend` deployable on separate hosts.

## Workspace Map

- `devinepremium-frontend`: public customer-facing Next.js app.
- `devinepremium-admin-dashboard`: separate Next.js admin app for operations.
- `devinepremium-backend`: Express + TypeORM API for auth, bookings, payment state, and admin controls.
- `docs`: architecture, setup, and workflow notes.

## Data Strategy

- Local development uses SQLite by default.
- Production can use Supabase Postgres by switching backend env values.
- Never let frontend or admin apps talk directly to the database.

## Product Rules

- Email login is required for user dashboard and admin dashboard access.
- Every booking must have a booking status and a payment status.
- Users should see their own booking history.
- Admin should see all booking history, payment state, and status changes.
- Cash and online payments should use the same booking model so the UI stays consistent.
