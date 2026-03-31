"use client";

import type { AdminBooking, StaffMember } from "@/lib/dashboard";
import { getAvailableStaffForDate } from "@/lib/dashboard";
import { AdminBookingCard } from "./AdminBookingCard";
import { getAssignableStaff } from "./dashboard-shared";

export function BookingOperationsPanel({
  bookings,
  staffMembers,
  activeAction,
  onResolveCustomerRequest,
  onAssignStaff,
  onUpdateBookingStatus,
  onUpdatePaymentStatus,
}: {
  bookings: AdminBooking[];
  staffMembers: StaffMember[];
  activeAction: string;
  onResolveCustomerRequest: (
    bookingId: string,
    decision: "approved" | "declined",
  ) => Promise<void>;
  onAssignStaff: (bookingId: string, staffId: string | null) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: string) => Promise<void>;
  onUpdatePaymentStatus: (paymentId: string, status: string) => Promise<void>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Booking operations
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            Assign staff, manage status, and track customer requests
          </h2>
        </div>
      </div>

      {bookings.length ? (
        bookings.map((booking) => {
          const assignableStaff = getAssignableStaff(
            booking,
            staffMembers,
            getAvailableStaffForDate,
          );
          const noAvailableStaff = assignableStaff.length === 0;

          return (
            <AdminBookingCard
              key={booking.id}
              booking={booking}
              activeAction={activeAction}
              assignableStaff={assignableStaff}
              noAvailableStaff={noAvailableStaff}
              onResolveCustomerRequest={onResolveCustomerRequest}
              onAssignStaff={onAssignStaff}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onUpdatePaymentStatus={onUpdatePaymentStatus}
            />
          );
        })
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            No bookings match this search
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Try customer name, email, booking reference, or booking ID.
          </p>
        </div>
      )}
    </section>
  );
}
