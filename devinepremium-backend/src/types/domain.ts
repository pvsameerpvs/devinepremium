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

export const BOOKING_CHANGE_REQUEST_TYPES = [
  "cancel",
  "reschedule",
] as const;
export type BookingChangeRequestType =
  (typeof BOOKING_CHANGE_REQUEST_TYPES)[number];

export const BOOKING_CHANGE_REQUEST_STATUSES = [
  "pending",
  "approved",
  "declined",
] as const;
export type BookingChangeRequestStatus =
  (typeof BOOKING_CHANGE_REQUEST_STATUSES)[number];

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

export interface SavedAddressInput extends BookingAddress {
  label: string;
  isDefault?: boolean;
}

export interface SavedAddressRecord extends SavedAddressInput {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingChangeRequest {
  type: BookingChangeRequestType;
  status: BookingChangeRequestStatus;
  note?: string | null;
  requestedSchedule?: BookingSchedule | null;
  createdAt: string;
  respondedAt?: string | null;
  respondedByUserId?: string | null;
  adminNote?: string | null;
}

export const STAFF_AVAILABILITY_DAYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;
export type StaffAvailabilityDay =
  (typeof STAFF_AVAILABILITY_DAYS)[number];

export interface StaffMemberInput {
  fullName: string;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  availabilityDays: StaffAvailabilityDay[];
  notes?: string | null;
  profilePhotoUrl?: string | null;
  documentImageUrls?: string[] | null;
  isActive?: boolean;
}
