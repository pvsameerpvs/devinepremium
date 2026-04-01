"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"today" | "all">("today");

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const displayBookings = activeTab === "today"
    ? bookings.filter((b) => {
        const createdDateStr = (b as AdminBooking & { createdAt?: string }).createdAt ?? (b.statusHistory?.length ? b.statusHistory[b.statusHistory.length - 1].createdAt : null);
        if (createdDateStr) {
          try {
            const d = new Date(createdDateStr);
            const bookingDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return bookingDateStr === todayString;
          } catch {
            return false;
          }
        }
        return false;
      })
    : bookings;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Booking operations
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            Assign staff, manage status, and track customer requests
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("today")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "today"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "all"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          }`}
        >
          All
        </button>
      </div>

      <div className="space-y-4">
      {displayBookings.length ? (
        displayBookings.map((booking) => {
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
            {activeTab === "today" 
              ? "No new orders received today." 
              : "No bookings match this search."}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {activeTab === "today" 
              ? "Any orders customers place today will appear here." 
              : "Try customer name, email, booking reference, or booking ID."}
          </p>
        </div>
      )}
      </div>
    </section>
  );
}
