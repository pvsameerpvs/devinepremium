import type { StoredUser } from "@/lib/auth";

export type CustomerAccountUser = StoredUser & {
  defaultInstructions?: string | null;
};

export interface SavedAddressRecord {
  id: string;
  label: string;
  location: string;
  building?: string | null;
  apartment?: string | null;
  city: string;
  mapLink?: string | null;
  lat?: string | null;
  lng?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAccountResponse {
  user: CustomerAccountUser;
  savedAddresses: SavedAddressRecord[];
}

export interface BookingStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  method: string;
  status: string;
  amount: number;
  createdAt: string;
}

export interface BookingCustomerRequest {
  type: "cancel" | "reschedule";
  status: "pending" | "approved" | "declined";
  note?: string | null;
  requestedSchedule?: {
    date: string;
    timeSlot: string;
  } | null;
  createdAt: string;
  respondedAt?: string | null;
  respondedByUserId?: string | null;
  adminNote?: string | null;
}

export interface AssignedStaff {
  id: string;
  fullName: string;
  phone: string | null;
  profilePhotoUrl: string | null;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  serviceTitle: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  schedule: {
    date: string;
    timeSlot: string;
  };
  address: {
    city: string;
    location: string;
    building?: string;
    apartment?: string;
    mapLink?: string;
    lat?: string;
    lng?: string;
  };
  contactName: string;
  createdAt: string;
  statusHistory: BookingStatusHistory[];
  payments: PaymentRecord[];
  customerRequest?: BookingCustomerRequest | null;
  assignedStaff?: AssignedStaff | null;
  assignedAt?: string | null;
}

export interface BookingHistoryResponse {
  user: StoredUser;
  bookings: BookingRecord[];
}

export interface SavedAddressPayload {
  label: string;
  location: string;
  building?: string;
  apartment?: string;
  city: string;
  mapLink?: string;
  lat?: string;
  lng?: string;
  isDefault?: boolean;
}
