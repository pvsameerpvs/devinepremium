"use client";

import { useState } from "react";
import { BOOKING_STATUSES } from "@devinepremium/shared";
import type { AdminBooking, StaffMember } from "@/lib/dashboard";
import { getAvailableStaffForDate } from "@/lib/dashboard";
import { AdminBookingCard } from "./AdminBookingCard";
import { getAssignableStaff, getBookingStatusColor } from "./dashboard-shared";

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
  const [activeTab, setActiveTab] = useState<"today" | "all" | string>("today");

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const displayBookings = activeTab === "all" 
    ? bookings 
    : activeTab === "today"
      ? bookings.filter((b) => {
          if (!b.createdAt) return false;
          try {
            const d = new Date(b.createdAt);
            const bookingDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return bookingDateStr === todayString;
          } catch {
            return false;
          }
        })
      : bookings.filter((b) => b.status === activeTab);

  const getCount = (status: string) => bookings.filter(b => b.status === status).length;
  const todayCount = bookings.filter(b => {
    if (!b.createdAt) return false;
    const d = new Date(b.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` === todayString;
  }).length;

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

      <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition shadow-sm ${
            activeTab === "today"
              ? "bg-slate-800 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Today <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] ${activeTab === 'today' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{todayCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition shadow-sm ${
            activeTab === "all"
              ? "bg-slate-800 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Bookings <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] ${activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{bookings.length}</span>
        </button>

        <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden md:block" />

        {BOOKING_STATUSES.map((status) => {
          const count = getCount(status);
          if (count === 0 && activeTab !== status) return null;
          
          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveTab(status)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition shadow-sm ${
                activeTab === status
                  ? "bg-slate-800 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${getBookingStatusColor(status).split(' ')[0]}`} />
              <span className="capitalize">{status.replace('_', ' ')}</span>
              <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] ${activeTab === status ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
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
