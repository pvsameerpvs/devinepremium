# Devine Premium Workspace

This repository is now organized as three separate deployable projects:

- `devinepremium-frontend`: customer website and booking experience
- `devinepremium-admin-dashboard`: admin operations dashboard
- `devinepremium-backend`: API, auth, booking logic, payment state, and database access

## Stack

- Frontend: Next.js App Router
- Admin dashboard: Next.js App Router
- Backend: Express + TypeORM
- Database:
  - Local development: SQLite
  - Production: Supabase Postgres

## Run Each Project

Install workspace dependencies from the repository root:

```bash
npm install
```

Run everything together:

```bash
npm run dev
```

Run each project separately:

```bash
npm run dev:frontend
npm run dev:admin
npm run dev:backend
```

## Default Local URLs

- Frontend: `http://localhost:3000`
- Admin dashboard: `http://localhost:3001`
- Backend API: `http://localhost:4000`

## Product Scope

- Email login and registration
- User dashboard with booking history
- Admin dashboard with all bookings, payment states, and status controls
- Cash payment and mock online payment flow
- Booking status history for users and admin
- API-first communication between all separate hosts

## Docs

- [Architecture plan](./docs/architecture.md)
- [Setup guide](./docs/setup.md)
