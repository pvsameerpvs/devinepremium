import type {
  BookingRecord,
  SavedAddressPayload,
  SavedAddressRecord,
} from "@/lib/account";

export interface ProfileFormState {
  fullName: string;
  phone: string;
  defaultInstructions: string;
}

export interface AddressFormState extends SavedAddressPayload {}

export interface AccountOverviewStats {
  total: number;
  active: number;
  pendingRequests: number;
  savedAddresses: number;
}

export const emptyAddressForm: AddressFormState = {
  label: "",
  location: "",
  building: "",
  apartment: "",
  city: "",
  mapLink: "",
  lat: "",
  lng: "",
  isDefault: false,
};

export const accountSectionLinks = [
  {
    id: "profile",
    label: "Personal details",
    description: "Name, phone, and booking note",
  },
  {
    id: "addresses",
    label: "Faster repeat booking",
    description: "Saved addresses for quick checkout",
  },
  {
    id: "orders",
    label: "Booking history and order actions",
    description: "Track status, payment, and requests",
  },
] as const;

export type AccountSectionId = (typeof accountSectionLinks)[number]["id"];

export const shellCardClass =
  "rounded-[30px] border border-slate-200/90 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur";

export function canManageBooking(booking: BookingRecord) {
  return !["completed", "cancelled", "rejected"].includes(booking.status);
}

export function hasOutstandingPayment(booking: BookingRecord) {
  return booking.paymentMethod === "online" && booking.paymentStatus !== "paid";
}

export function hasCustomerAction(booking: BookingRecord) {
  const requestStatus = booking.customerRequest?.status;

  return (
    hasOutstandingPayment(booking) ||
    requestStatus === "pending" ||
    canManageBooking(booking)
  );
}

export function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function formatAddressLine(
  address: BookingRecord["address"] | SavedAddressRecord,
) {
  return [
    address.building,
    address.apartment,
    address.location,
    address.city,
  ]
    .filter(Boolean)
    .join(", ");
}
