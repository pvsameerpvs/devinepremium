export declare const USER_ROLES: readonly ["user", "admin"];
export type UserRole = (typeof USER_ROLES)[number];

export declare const BOOKING_STATUSES: readonly [
  "pending",
  "accepted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export declare const PAYMENT_METHODS: readonly ["cash", "online"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export declare const PAYMENT_STATUSES: readonly [
  "cash_due",
  "pending",
  "paid",
  "failed",
  "refunded",
];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
