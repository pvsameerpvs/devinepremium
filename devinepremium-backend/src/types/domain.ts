export {
  USER_ROLES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from "@devinepremium/shared";

export type {
  UserRole,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@devinepremium/shared";

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
