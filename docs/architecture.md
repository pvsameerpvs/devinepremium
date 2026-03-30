# Devine Premium Architecture Plan

## Workspace Structure

```text
devinepremium
  - devinepremium-frontend
  - devinepremium-admin-dashboard
  - devinepremium-backend
```

Each project is designed to run and deploy separately.

## App Responsibilities

### `devinepremium-frontend`

- customer-facing website
- existing marketing UI kept intact
- customer email login and registration
- customer dashboard with booking history
- booking creation through backend API
- online payment continuation page

### `devinepremium-admin-dashboard`

- admin email login
- booking overview for all users
- update booking statuses
- update payment statuses
- review booking history and status history

### `devinepremium-backend`

- email auth API
- booking creation and booking history APIs
- admin dashboard APIs
- payment state handling
- SQLite local development
- Supabase Postgres production mode

## API-First Flow

1. Customer uses frontend and submits a booking.
2. Frontend sends booking data to backend.
3. Backend stores booking, status history, and payment record.
4. Customer dashboard reads booking history from backend.
5. Admin dashboard reads all bookings from backend.
6. Admin updates booking or payment status through backend APIs.
7. Updated status becomes visible in both dashboards.

## Auth Model

- Customer login is email + password.
- Admin login is email + password with `role=admin`.
- Backend issues JWT tokens.
- Frontend and admin store tokens locally and send them in API calls.

## Booking Statuses

- `pending`
- `accepted`
- `scheduled`
- `in_progress`
- `completed`
- `cancelled`
- `rejected`

## Payment Methods

- `cash`
- `online`

## Payment Statuses

- `cash_due`
- `pending`
- `paid`
- `failed`
- `refunded`

## Database Strategy

### Local development

- backend uses SQLite file: `devinepremium-backend/data/devinepremium.sqlite`

### Production

- backend switches to `DATABASE_DRIVER=postgres`
- use Supabase Postgres connection string in `DATABASE_URL`

## Key Data Models

### Users

- id
- fullName
- email
- phone
- passwordHash
- role

### Bookings

- bookingReference
- userId
- serviceTitle
- serviceOptions
- address
- schedule
- status
- paymentMethod
- paymentStatus
- totalAmount

### Payments

- bookingId
- userId
- payerEmail
- method
- provider
- status
- amount

### Booking Status History

- bookingId
- changedByUserId
- fromStatus
- toStatus
- note

## Notes For Next Implementation Steps

- Replace mock online payment with the real gateway of your choice later.
- Add forgot-password flow if needed.
- Add file uploads or invoices if required.
- Add admin filters and pagination when booking volume grows.
