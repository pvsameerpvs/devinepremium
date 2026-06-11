export interface StaffBookingAddress {
  location: string;
  building?: string;
  apartment?: string;
  city: string;
  mapLink?: string;
}

export interface StaffBookingSchedule {
  date: string;
  timeSlot: string;
}

export interface StaffBookingStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
  note: string | null;
}

export interface StaffPayment {
  id: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
}

export interface StaffBooking {
  id: string;
  bookingReference: string;
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  status: string;
  schedule: StaffBookingSchedule;
  address: StaffBookingAddress;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string;
  notes: string | null;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  payments: StaffPayment[];
  statusHistory: StaffBookingStatusHistory[];
}
