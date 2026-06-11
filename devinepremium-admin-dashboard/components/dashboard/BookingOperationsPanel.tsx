"use client";

import { useState } from "react";
import { BOOKING_STATUSES } from "@devinepremium/shared";
import type { AdminBooking, StaffMember } from "@/lib/dashboard";
import { getAvailableStaffForDate } from "@/lib/dashboard";
import { AdminBookingCard } from "./AdminBookingCard";
import { getAssignableStaff, getBookingStatusColor } from "./dashboard-shared";

function toDisplayText(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

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
  const [activeTab, setActiveTab] = useState<"today" | "all" | string>("all");

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

  const completedCount = getCount("completed");
  const pendingRequestsCount = bookings.filter(b => b.customerRequest?.status === "pending").length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Booking operations
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            Assign staff, manage status, and track customer requests
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-700">{completedCount} completed</span>
          </div>
          {pendingRequestsCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold text-amber-600">{pendingRequestsCount} pending requests</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="font-semibold text-slate-700">{bookings.length} total</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition shadow-sm ${
            activeTab === "today"
              ? "bg-slate-800 text-white shadow-lg shadow-slate-800/10"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Today
          <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-bold ${activeTab === 'today' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{todayCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition shadow-sm ${
            activeTab === "all"
              ? "bg-slate-800 text-white shadow-lg shadow-slate-800/10"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          All
          <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-bold ${activeTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{bookings.length}</span>
        </button>

        <div className="h-10 w-px bg-slate-200 mx-1 hidden md:block" />

        {BOOKING_STATUSES.map((status) => {
          const count = getCount(status);
          if (count === 0 && activeTab !== status) return null;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveTab(status)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition shadow-sm ${
                activeTab === status
                  ? "bg-slate-800 text-white shadow-lg shadow-slate-800/10"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${getBookingStatusColor(status).split(' ')[0]}`} />
              <span>{toDisplayText(status)}</span>
              {count > 0 && (
                <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-bold ${activeTab === status ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking List */}
      <div className="space-y-5">
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
        <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-5 border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {activeTab === "today"
              ? "No orders received today"
              : "No bookings in this status"}
          </p>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            {activeTab === "today"
              ? "Orders placed by customers today will show up here automatically."
              : "Try selecting a different status filter to find what you need."}
          </p>
        </div>
      )}
      </div>
    </section>
  );
}