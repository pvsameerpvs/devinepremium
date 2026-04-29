# Devine Premium Database Architecture

## Overview

The project uses an API-first database architecture:

- `devinepremium-frontend` never connects to the database directly
- `devinepremium-admin-dashboard` never connects to the database directly
- `devinepremium-backend` is the only project that reads and writes database data

This means both frontend apps are separated from the database and use backend APIs only.

## Database Engine Strategy

The backend supports two database modes from the same TypeORM entity model:

- Local development: SQLite
- Production: Postgres, designed for Supabase

Database config is controlled in [env.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/config/env.ts) and [data-source.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/config/data-source.ts).

### Local

- driver: `sqlite`
- file: `devinepremium-backend/data/devinepremium.sqlite`

### Production

- driver: `postgres`
- connection: `DATABASE_URL`
- target: Supabase Postgres

## Current Tables

The current backend creates and uses these tables:

1. `users`
2. `bookings`
3. `payments`
4. `booking_status_history`
5. `saved_addresses`
6. `staff_members`

## Relationship Map

```text
users
 ├─< bookings
 ├─< payments
 ├─< saved_addresses
 └─< booking_status_history (changedByUserId)

staff_members
 └─< bookings (assignedStaffId)

bookings
 ├─< payments
 └─< booking_status_history
```

## Table-by-Table Schema

### 1. `users`

Source entity: [User.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/entities/User.ts)

Purpose:
- customer accounts
- admin accounts
- auth ownership for bookings and payments
- profile defaults for repeat bookings

Columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `email` | `varchar(255)` | unique |
| `fullName` | `varchar(255)` | required |
| `phone` | `varchar(255)` nullable | optional |
| `defaultInstructions` | `text` nullable | default booking notes |
| `passwordHash` | `varchar(255)` | stored hash, not plain password |
| `role` | `varchar(32)` | `user` or `admin` |
| `createdAt` | timestamp | auto-generated |
| `updatedAt` | timestamp | auto-generated |

Relations:
- one user has many bookings
- one user has many saved addresses
- one user can own many payments
- one user can create many booking status history records as admin/user actor

### 2. `bookings`

Source entity: [Booking.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/entities/Booking.ts)

Purpose:
- main service order table
- stores booking details, address, schedule, pricing, customer request, staff assignment

Columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `bookingReference` | `varchar(64)` | unique customer/admin reference like `DP-YYYYMMDD-XXXXXX` |
| `serviceId` | `varchar(128)` | internal service identifier |
| `serviceSlug` | `varchar(128)` | frontend route/service slug |
| `serviceTitle` | `varchar(255)` | display title |
| `serviceOptions` | `simple-json` | selected service options |
| `address` | `simple-json` | city, location, building, apartment, map info |
| `schedule` | `simple-json` | booking date and time slot |
| `pricing` | `simple-json` | subtotal, discount, VAT, total, line items |
| `status` | `varchar(32)` | booking workflow status |
| `paymentMethod` | `varchar(32)` | `cash` or `online` |
| `paymentStatus` | `varchar(32)` | `cash_due`, `pending`, `paid`, `failed`, `refunded` |
| `contactName` | `varchar(255)` | booking contact |
| `contactEmail` | `varchar(255)` | booking contact email |
| `contactPhone` | `varchar(32)` nullable | optional |
| `notes` | `text` nullable | customer instructions |
| `customerRequest` | `simple-json` nullable | cancel/reschedule request object |
| `assignedStaffId` | `varchar` nullable | FK to `staff_members.id` |
| `assignedAt` | `varchar` nullable | ISO timestamp of assignment |
| `subtotal` | `float` | pricing summary |
| `discountAmount` | `float` | pricing summary |
| `vatAmount` | `float` | pricing summary |
| `totalAmount` | `float` | pricing summary |
| `currency` | `varchar(8)` | currently `AED` |
| `userId` | `varchar` nullable | FK to `users.id` |
| `createdAt` | timestamp | auto-generated |
| `updatedAt` | timestamp | auto-generated |

Relations:
- belongs to one user, optional for guest-to-user attach flow
- belongs to one assigned staff member, optional
- has many payments
- has many status history records

#### `bookings.address` JSON structure

```json
{
  "location": "Dubai Marina",
  "building": "Marina Gate",
  "apartment": "1204",
  "city": "Dubai",
  "mapLink": "https://www.google.com/maps?q=25.08,55.14",
  "lat": "25.080000",
  "lng": "55.140000"
}
```

#### `bookings.schedule` JSON structure

```json
{
  "date": "2026-03-30",
  "timeSlot": "10:00"
}
```

#### `bookings.pricing` JSON structure

```json
{
  "subtotal": 200,
  "discount": 20,
  "vat": 9,
  "total": 189,
  "lineItems": [
    { "label": "Base Price", "amount": 200 },
    { "label": "Discount", "amount": -20 },
    { "label": "VAT (5%)", "amount": 9 }
  ]
}
```

#### `bookings.customerRequest` JSON structure

```json
{
  "type": "reschedule",
  "status": "pending",
  "note": "Need evening slot",
  "requestedSchedule": {
    "date": "2026-04-02",
    "timeSlot": "16:00"
  },
  "createdAt": "2026-03-30T10:00:00.000Z",
  "respondedAt": null,
  "respondedByUserId": null,
  "adminNote": null
}
```

### 3. `payments`

Source entity: [Payment.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/entities/Payment.ts)

Purpose:
- payment transaction tracking per booking
- supports cash and mock online flow now

Columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `bookingId` | `varchar` | FK to `bookings.id` |
| `userId` | `varchar` nullable | FK to `users.id` |
| `payerEmail` | `varchar(255)` | payer identity |
| `method` | `varchar(32)` | `cash` or `online` |
| `provider` | `varchar(64)` | `cash` or `stripe` |
| `status` | `varchar(32)` | payment state |
| `amount` | `float` | amount in AED |
| `currency` | `varchar(8)` | `AED` |
| `checkoutReference` | `varchar(96)` | unique payment reference |
| `providerSessionId` | `varchar` nullable | Stripe Checkout Session ID |
| `providerPaymentId` | `varchar` nullable | Stripe PaymentIntent ID |
| `receiptUrl` | `varchar` nullable | Stripe receipt URL when available |
| `failureReason` | `varchar` nullable | latest provider failure message |
| `metadata` | `simple-json` nullable | extra payment context |
| `paidAt` | `varchar` nullable | ISO string when marked paid |
| `createdAt` | timestamp | auto-generated |
| `updatedAt` | timestamp | auto-generated |

Relations:
- belongs to one booking
- optionally belongs to one user

#### `payments.metadata` JSON structure

```json
{
  "serviceTitle": "Deep Cleaning",
  "lineItems": [
    { "label": "Base Price", "amount": 200 }
  ]
}
```

### 4. `booking_status_history`

Source entity: [BookingStatusHistory.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/entities/BookingStatusHistory.ts)

Purpose:
- audit trail for booking lifecycle
- records admin actions, customer requests, staff assignment notes, and workflow changes

Columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `bookingId` | `varchar` | FK to `bookings.id` |
| `changedByUserId` | `varchar` nullable | FK to `users.id` |
| `fromStatus` | `varchar` nullable | previous booking status |
| `toStatus` | `varchar` | next/current status |
| `note` | `text` nullable | action note |
| `createdAt` | timestamp | auto-generated |

Relations:
- belongs to one booking
- optionally belongs to one user as the actor

### 5. `saved_addresses`

Source entity: [SavedAddress.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/entities/SavedAddress.ts)

Purpose:
- reusable customer addresses for faster repeat booking

Columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `userId` | `varchar` | FK to `users.id` |
| `label` | `varchar(80)` | `Home`, `Office`, etc. |
| `location` | `varchar(255)` | area/locality |
| `building` | `varchar(255)` nullable | optional |
| `apartment` | `varchar(255)` nullable | optional |
| `city` | `varchar(120)` | city |
| `mapLink` | `text` nullable | Google Maps link |
| `lat` | `varchar(48)` nullable | latitude |
| `lng` | `varchar(48)` nullable | longitude |
| `isDefault` | `boolean` | default customer address |
| `createdAt` | timestamp | auto-generated |
| `updatedAt` | timestamp | auto-generated |

Relations:
- belongs to one user

### 6. `staff_members`

Source entity: [StaffMember.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/entities/StaffMember.ts)

Purpose:
- operational staff registry for admin dashboard
- availability by weekday
- assignment target for bookings

Columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | primary key |
| `fullName` | `varchar(255)` | required |
| `email` | `varchar(255)` nullable | optional |
| `phone` | `varchar(64)` nullable | optional |
| `availabilityDays` | `simple-json` | weekday keys like `["mon","tue","wed"]` |
| `notes` | `text` nullable | coverage notes |
| `isActive` | `boolean` | assignable or not |
| `createdAt` | timestamp | auto-generated |
| `updatedAt` | timestamp | auto-generated |

Relations:
- one staff member can be assigned to many bookings

## Current Enum-Like Business Values

Source constants: [domain.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/types/domain.ts) and shared package

### User roles

- `user`
- `admin`

### Booking statuses

- `pending`
- `accepted`
- `scheduled`
- `in_progress`
- `completed`
- `cancelled`
- `rejected`

### Payment methods

- `cash`
- `online`

### Payment statuses

- `cash_due`
- `pending`
- `paid`
- `failed`
- `refunded`

### Customer request types

- `cancel`
- `reschedule`

### Customer request statuses

- `pending`
- `approved`
- `declined`

### Staff availability day keys

- `sun`
- `mon`
- `tue`
- `wed`
- `thu`
- `fri`
- `sat`

## App-to-Database Flow

### `devinepremium-frontend`

Uses backend APIs to indirectly read/write:

- `users`
- `saved_addresses`
- `bookings`
- `payments`
- `booking_status_history`

Main flows:
- register/login
- profile update
- create booking
- save address
- see own booking history
- send cancel/reschedule requests
- continue payment

### `devinepremium-admin-dashboard`

Uses backend admin APIs to indirectly read/write:

- `bookings`
- `payments`
- `booking_status_history`
- `staff_members`
- `users`

Main flows:
- admin login
- full booking overview
- booking search
- booking status update
- payment status update
- customer request approval/decline
- staff create/update
- staff assignment
- calendar by date and time

### `devinepremium-backend`

This is the only layer that touches the database directly.

Main service ownership:

- [authService.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/services/authService.ts)
  - `users`
- [accountService.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/services/accountService.ts)
  - `users`, `saved_addresses`
- [bookingService.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/services/bookingService.ts)
  - `bookings`, `payments`, `booking_status_history`, `staff_members`
- [paymentService.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/services/paymentService.ts)
  - `payments`, `bookings`
- [staffService.ts](/home/sameer/Documents/Project/justsearch-project/devinepremium/devinepremium-backend/src/services/staffService.ts)
  - `staff_members`

## Logical SQL-Style Schema

This is the logical schema based on the TypeORM entities:

```sql
users (
  id uuid primary key,
  email varchar(255) unique not null,
  fullName varchar(255) not null,
  phone varchar(255) null,
  defaultInstructions text null,
  passwordHash varchar(255) not null,
  role varchar(32) not null default 'user',
  createdAt timestamp not null,
  updatedAt timestamp not null
);

staff_members (
  id uuid primary key,
  fullName varchar(255) not null,
  email varchar(255) null,
  phone varchar(64) null,
  availabilityDays json/text not null,
  notes text null,
  isActive boolean not null default true,
  createdAt timestamp not null,
  updatedAt timestamp not null
);

bookings (
  id uuid primary key,
  bookingReference varchar(64) unique not null,
  serviceId varchar(128) not null,
  serviceSlug varchar(128) not null,
  serviceTitle varchar(255) not null,
  serviceOptions json/text not null,
  address json/text not null,
  schedule json/text not null,
  pricing json/text not null,
  status varchar(32) not null,
  paymentMethod varchar(32) not null,
  paymentStatus varchar(32) not null,
  contactName varchar(255) not null,
  contactEmail varchar(255) not null,
  contactPhone varchar(32) null,
  notes text null,
  customerRequest json/text null,
  assignedStaffId uuid null references staff_members(id),
  assignedAt varchar null,
  subtotal float not null,
  discountAmount float not null,
  vatAmount float not null,
  totalAmount float not null,
  currency varchar(8) not null default 'AED',
  userId uuid null references users(id),
  createdAt timestamp not null,
  updatedAt timestamp not null
);

payments (
  id uuid primary key,
  bookingId uuid not null references bookings(id),
  userId uuid null references users(id),
  payerEmail varchar(255) not null,
  method varchar(32) not null,
  provider varchar(64) not null,
  status varchar(32) not null,
  amount float not null,
  currency varchar(8) not null default 'AED',
  checkoutReference varchar(96) unique not null,
  metadata json/text null,
  paidAt varchar null,
  createdAt timestamp not null,
  updatedAt timestamp not null
);

booking_status_history (
  id uuid primary key,
  bookingId uuid not null references bookings(id),
  changedByUserId uuid null references users(id),
  fromStatus varchar null,
  toStatus varchar not null,
  note text null,
  createdAt timestamp not null
);

saved_addresses (
  id uuid primary key,
  userId uuid not null references users(id),
  label varchar(80) not null,
  location varchar(255) not null,
  building varchar(255) null,
  apartment varchar(255) null,
  city varchar(120) not null,
  mapLink text null,
  lat varchar(48) null,
  lng varchar(48) null,
  isDefault boolean not null default false,
  createdAt timestamp not null,
  updatedAt timestamp not null
);
```

## Important Architecture Notes

### 1. JSON-heavy booking design

The booking table intentionally stores several business objects as `simple-json`:

- `serviceOptions`
- `address`
- `schedule`
- `pricing`
- `customerRequest`

This is flexible and fast to build for a service-booking product, but it means some reporting queries are harder than with fully normalized tables.

### 2. Booking is the core aggregate

Everything important centers around `bookings`:

- user ownership
- payment state
- staff assignment
- status history
- customer change requests

### 3. Audit trail is already supported

`booking_status_history` acts as an audit trail for:

- booking creation
- status changes
- customer cancel/reschedule requests
- request approvals/declines
- staff assignment changes

### 4. Saved addresses improve repeat booking

Customer repeat-booking performance is handled through:

- `users.defaultInstructions`
- `saved_addresses`

### 5. Staff availability is weekday-based

Current staff scheduling is lightweight:

- no separate shift table
- no leave calendar table
- no exact timeslot availability table
- availability is stored as weekday keys in `staff_members.availabilityDays`

## Recommended Next DB Tables Later

If the project grows, these are the next logical tables to add:

1. `staff_shifts`
   - exact dates, times, and leave/holiday support
2. `payment_transactions`
   - real gateway webhooks and provider event logs
3. `booking_attachments`
   - photos, invoices, proof of work
4. `service_catalog`
   - normalized service definitions from frontend config
5. `notifications`
   - email/SMS/WhatsApp delivery history

## Source of Truth

The source of truth for the live DB structure is:

- entities in `devinepremium-backend/src/entities`
- DB config in `devinepremium-backend/src/config`
- service logic in `devinepremium-backend/src/services`

This document is based on the current real codebase as of this project state.
