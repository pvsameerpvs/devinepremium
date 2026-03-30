export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "cash_due",
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface BookingAddress {
  location: string;
  building?: string;
  apartment?: string;
  city: string;
  mapLink?: string;
  lat?: string;
  lng?: string;
}

export interface BookingSchedule {
  date: string;
  timeSlot: string;
}

export interface BookingPricingLineItem {
  label: string;
  amount: number;
}

export interface BookingPricing {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  lineItems: BookingPricingLineItem[];
}

export interface BookingContact {
  fullName: string;
  email: string;
  phone?: string;
  instructions?: string;
}
