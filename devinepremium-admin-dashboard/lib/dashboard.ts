export interface DashboardSummary {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  paidBookings: number;
  cashDueBookings: number;
  pendingCustomerRequests: number;
  revenueCollected: number;
}

export type StaffAvailabilityDay =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

export interface StaffMember {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  availabilityDays: StaffAvailabilityDay[];
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingChangeRequest {
  type: "cancel" | "reschedule";
  status: "pending" | "approved" | "declined";
  note?: string | null;
  requestedSchedule?: {
    date: string;
    timeSlot: string;
  } | null;
  createdAt: string;
  respondedAt?: string | null;
  adminNote?: string | null;
}

export interface AdminBooking {
  id: string;
  bookingReference: string;
  serviceTitle: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  contactName: string;
  contactEmail: string;
  address: {
    city: string;
    location: string;
    building?: string;
    apartment?: string;
  };
  schedule: {
    date: string;
    timeSlot: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  assignedStaffId?: string | null;
  assignedAt?: string | null;
  assignedStaff?: StaffMember | null;
  payments: Array<{
    id: string;
    status: string;
    method: string;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    createdAt: string;
    note: string | null;
  }>;
  customerRequest?: BookingChangeRequest | null;
}

export interface AdminDashboardResponse {
  summary: DashboardSummary;
  bookings: AdminBooking[];
  staffMembers: StaffMember[];
}

export const STAFF_DAY_OPTIONS: Array<{
  key: StaffAvailabilityDay;
  label: string;
}> = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

export function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function formatAddressLine(booking: Pick<AdminBooking, "address">) {
  return [
    booking.address.building,
    booking.address.apartment,
    booking.address.location,
    booking.address.city,
  ]
    .filter(Boolean)
    .join(", ");
}

export function parseBookingDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function getWeekdayKey(date: string): StaffAvailabilityDay {
  return STAFF_DAY_OPTIONS[parseBookingDate(date).getDay()].key;
}

export function isStaffAvailableForDate(staffMember: StaffMember, date: string) {
  return staffMember.isActive && staffMember.availabilityDays.includes(getWeekdayKey(date));
}

export function getAvailableStaffForDate(
  staffMembers: StaffMember[],
  date: string,
) {
  return staffMembers.filter((staffMember) =>
    isStaffAvailableForDate(staffMember, date),
  );
}

export function matchesBookingSearch(booking: AdminBooking, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    booking.id,
    booking.bookingReference,
    booking.contactName,
    booking.contactEmail,
    booking.user?.id,
    booking.user?.email,
    booking.user?.fullName,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}
