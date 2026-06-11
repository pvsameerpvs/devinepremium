"use client";

import { useState } from "react";
import Image from "next/image";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@devinepremium/shared";
import { formatAddressLine, type AdminBooking, type StaffMember } from "@/lib/dashboard";
import { getBookingStatusColor, getPaymentStatusColor, toDisplayText } from "./dashboard-shared";

function getInitials(fullName?: string | null) {
  if (!fullName) return "NA";
  return fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed": return "✓";
    case "cancelled":
    case "rejected": return "✕";
    case "in_progress": return "●";
    default: return "○";
  }
}

function getBookingProgress(status: string): number {
  const order = ["pending", "accepted", "scheduled", "in_progress", "completed"];
  const idx = order.indexOf(status);
  return idx >= 0 ? ((idx + 1) / order.length) * 100 : 0;
}

function getAmountColor(booking: AdminBooking) {
  if (booking.paymentStatus === "paid") return "text-emerald-600";
  if (booking.paymentStatus === "cash_due") return "text-amber-600";
  if (booking.paymentStatus === "pending") return "text-blue-600";
  return "text-slate-600";
}

export function AdminBookingCard({
  booking,
  activeAction,
  assignableStaff,
  noAvailableStaff,
  onResolveCustomerRequest,
  onAssignStaff,
  onUpdateBookingStatus,
  onUpdatePaymentStatus,
}: {
  booking: AdminBooking;
  activeAction: string;
  assignableStaff: StaffMember[];
  noAvailableStaff: boolean;
  onResolveCustomerRequest: (
    bookingId: string,
    decision: "approved" | "declined",
  ) => Promise<void>;
  onAssignStaff: (bookingId: string, staffId: string | null) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: string) => Promise<void>;
  onUpdatePaymentStatus: (paymentId: string, status: string) => Promise<void>;
}) {
  const firstPayment = booking.payments[0];
  const request = booking.customerRequest;
  const requestStatus = request?.status;
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled" || booking.status === "rejected";

  const [isExpanded, setIsExpanded] = useState(requestStatus === "pending" || false);
  const [localBookingStatus, setLocalBookingStatus] = useState(booking.status);
  const [localPaymentStatus, setLocalPaymentStatus] = useState(booking.paymentStatus);

  const displayStatus = localBookingStatus;
  const displayPaymentStatus = localPaymentStatus;
  const progress = getBookingProgress(displayStatus);

  return (
    <article className={`overflow-hidden rounded-[32px] border shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition-all duration-200 ${
      isCompleted
        ? "border-emerald-200 bg-white"
        : isCancelled
          ? "border-rose-200 bg-white opacity-75"
          : "border-slate-200 bg-white"
    }`}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative cursor-pointer select-none px-5 py-5 sm:px-6 transition-colors hover:bg-slate-50"
      >
        {/* Progress bar (thin line at top) */}
        {!isCancelled && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-[32px] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {booking.bookingReference}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400">{booking.schedule.date}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400">{booking.schedule.timeSlot}</span>
            </div>
            <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
              {booking.serviceTitle}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>{booking.contactName}</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline">{booking.contactEmail}</span>
              <span className="text-slate-300">|</span>
              <span className={`font-bold ${getAmountColor(booking)}`}>
                {booking.totalAmount.toFixed(2)} {booking.currency}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm ${getBookingStatusColor(displayStatus)}`}>
              <span className="text-xs">{getStatusIcon(displayStatus)}</span>
              {toDisplayText(displayStatus)}
            </span>
            <span className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm ${getPaymentStatusColor(displayPaymentStatus)}`}>
              {toDisplayText(displayPaymentStatus)}
            </span>
            {booking.assignedStaff ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                {booking.assignedStaff.profilePhotoUrl ? (
                  <Image
                    src={booking.assignedStaff.profilePhotoUrl}
                    alt={`${booking.assignedStaff.fullName} profile`}
                    width={18}
                    height={18}
                    unoptimized
                    className="h-[18px] w-[18px] rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[8px] font-bold text-slate-600 border border-slate-200">
                    {getInitials(booking.assignedStaff.fullName)}
                  </span>
                )}
                {booking.assignedStaff.fullName}
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                Unassigned
              </span>
            )}
            <button
              type="button"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 shadow-sm transition-all duration-200"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        </div>

        {/* Completed banner */}
        {isCompleted && !isExpanded && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Job Completed</p>
              <p className="text-xs text-emerald-600">
                Payment: {toDisplayText(displayPaymentStatus)} &middot; {booking.totalAmount.toFixed(2)} {booking.currency}
                {booking.assignedStaff && <> &middot; Staff: {booking.assignedStaff.fullName}</>}
              </p>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
      <div className="border-t border-slate-100">
        {/* Completion Summary Banner */}
        {isCompleted && (
          <div className="mx-5 sm:mx-6 mt-5 rounded-[24px] bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 border-2 border-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h4 className="text-base font-black text-emerald-900">Service Successfully Completed</h4>
                <p className="mt-1 text-sm text-emerald-700">
                  {booking.serviceTitle} for {booking.contactName}
                  {booking.assignedStaff ? <> &mdash; handled by {booking.assignedStaff.fullName}</> : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-emerald-600">
                  <span className="font-semibold">{booking.schedule.date}</span>
                  <span className="font-semibold">{booking.schedule.timeSlot}</span>
                  <span className="font-semibold">{booking.totalAmount.toFixed(2)} {booking.currency}</span>
                  <span className="font-semibold">{toDisplayText(displayPaymentStatus)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 px-5 py-5 sm:px-6 sm:py-6 xl:grid-cols-[1fr_0.95fr] animate-in fade-in slide-in-from-top-2">
          <div className="space-y-6">
            {/* Customer Request Section */}
            {request && (
              <div
                className={`rounded-[24px] border p-5 ${
                  requestStatus === "pending"
                    ? "border-amber-200 bg-amber-50"
                    : requestStatus === "approved"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    requestStatus === "pending" ? "bg-amber-100 text-amber-600" :
                    requestStatus === "approved" ? "bg-emerald-100 text-emerald-600" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                          Customer Request
                        </p>
                        <div className="mt-2 space-y-1.5 text-sm text-slate-700">
                          <p><span className="font-semibold text-slate-900">Type:</span> {toDisplayText(request.type)}</p>
                          <p><span className="font-semibold text-slate-900">Status:</span>
                            <span className={`ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                              requestStatus === "pending" ? "bg-amber-100 text-amber-700" :
                              requestStatus === "approved" ? "bg-emerald-100 text-emerald-700" :
                              "bg-slate-200 text-slate-600"
                            }`}>{toDisplayText(request.status)}</span>
                          </p>
                          {request.requestedSchedule && (
                            <p><span className="font-semibold text-slate-900">Requested:</span> {request.requestedSchedule.date} at {request.requestedSchedule.timeSlot}</p>
                          )}
                          {request.note && <p><span className="font-semibold text-slate-900">Note:</span> {request.note}</p>}
                          {request.adminNote && <p><span className="font-semibold text-slate-900">Admin:</span> {request.adminNote}</p>}
                        </div>
                      </div>
                      {requestStatus === "pending" && (
                        <div className="flex flex-col gap-2 sm:flex-row shrink-0">
                          <button
                            type="button"
                            onClick={() => void onResolveCustomerRequest(booking.id, "approved")}
                            disabled={activeAction === `request:${booking.id}:approved`}
                            className="rounded-full bg-[#37543B] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d4631] disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
                          >
                            {activeAction === `request:${booking.id}:approved` ? "Approving..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void onResolveCustomerRequest(booking.id, "declined")}
                            disabled={activeAction === `request:${booking.id}:declined`}
                            className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
                          >
                            {activeAction === `request:${booking.id}:declined` ? "Declining..." : "Decline"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Schedule & Location */}
              <div className="rounded-[24px] border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Schedule & Location</p>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-16 shrink-0">Date</span>
                    <span className="font-semibold text-slate-900">{booking.schedule.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-16 shrink-0">Time</span>
                    <span className="font-semibold text-slate-900">{booking.schedule.timeSlot}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-slate-400 w-16 shrink-0 pt-0.5">Address</span>
                    <span className="text-slate-600">{formatAddressLine(booking)}</span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-[24px] border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Customer</p>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-16 shrink-0">Name</span>
                    <span className="font-semibold text-slate-900">{booking.contactName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-16 shrink-0">Email</span>
                    <span className="text-slate-600">{booking.contactEmail}</span>
                  </div>
                  {booking.user && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-16 shrink-0">User</span>
                      <span className="text-xs text-slate-500">ID: {booking.user.id.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Assignment */}
              <div className={`rounded-[24px] border p-5 ${
                booking.assignedStaff ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    booking.assignedStaff ? "bg-emerald-100" : "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={booking.assignedStaff ? "text-emerald-600" : "text-slate-500"}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Staff</p>
                </div>
                <div>
                  {booking.assignedStaff ? (
                    <div className="flex items-center gap-3">
                      {booking.assignedStaff.profilePhotoUrl ? (
                        <Image
                          src={booking.assignedStaff.profilePhotoUrl}
                          alt={`${booking.assignedStaff.fullName} profile`}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 rounded-full border-2 border-emerald-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 text-sm font-bold text-emerald-700">
                          {getInitials(booking.assignedStaff.fullName)}
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-bold text-slate-900">{booking.assignedStaff.fullName}</p>
                        {booking.assignedStaff.phone && (
                          <p className="text-slate-500">{booking.assignedStaff.phone}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No staff assigned yet</p>
                  )}
                </div>
              </div>

              {/* Payment Card */}
              <div className={`rounded-[24px] border p-5 ${
                booking.paymentStatus === "paid" ? "border-emerald-200 bg-emerald-50/30" :
                booking.paymentStatus === "cash_due" ? "border-fuchsia-200 bg-fuchsia-50/30" :
                booking.paymentStatus === "pending" ? "border-amber-200 bg-amber-50/30" :
                "border-slate-200"
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    booking.paymentStatus === "paid" ? "bg-emerald-100" :
                    booking.paymentStatus === "cash_due" ? "bg-fuchsia-100" :
                    booking.paymentStatus === "pending" ? "bg-amber-100" :
                    "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={
                      booking.paymentStatus === "paid" ? "text-emerald-600" :
                      booking.paymentStatus === "cash_due" ? "text-fuchsia-600" :
                      booking.paymentStatus === "pending" ? "text-amber-600" :
                      "text-slate-500"
                    }><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Payment</p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Method</span>
                    <span className="font-semibold text-slate-900">{toDisplayText(booking.paymentMethod)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPaymentStatusColor(displayPaymentStatus)}`}>
                      {toDisplayText(displayPaymentStatus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-black text-slate-900">{booking.totalAmount.toFixed(2)} {booking.currency}</span>
                  </div>
                  {firstPayment && firstPayment.id && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Payment ID</span>
                      <span className="text-xs text-slate-400">{firstPayment.id.slice(0, 12)}...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Controls */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {/* Assign Staff */}
              <div className={`rounded-[24px] border p-5 ${
                isCompleted || isCancelled ? "bg-slate-50 border-slate-200" : "border-slate-200"
              }`}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 mb-1">Assign Staff</p>
                <p className="text-[11px] text-slate-400 mb-3">
                  {isCompleted || isCancelled
                    ? "Staff assignment locked — job is finished"
                    : `Staff available on ${booking.schedule.date}`
                  }
                </p>
                <select
                  value={booking.assignedStaff?.id ?? ""}
                  onChange={(event) => void onAssignStaff(booking.id, event.target.value || null)}
                  disabled={activeAction === `assign:${booking.id}` || isCompleted || isCancelled}
                  className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50 ${
                    isCompleted || isCancelled
                      ? "border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Unassigned</option>
                  {assignableStaff.map((staffMember) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.fullName}
                      {!staffMember.isActive ? " (inactive)" : ""}
                    </option>
                  ))}
                </select>
                {(isCompleted || isCancelled) && booking.assignedStaff && (
                  <p className="mt-3 text-xs text-slate-500">
                    Job handled by <span className="font-semibold text-slate-700">{booking.assignedStaff.fullName}</span>
                  </p>
                )}
                {noAvailableStaff && !isCompleted && !isCancelled && (
                  <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    No active staff available on this day.
                  </p>
                )}
              </div>

              {/* Booking Status */}
              <div className="rounded-[24px] border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 mb-1">Booking Status</p>
                <p className="text-[11px] text-slate-400 mb-3">Current: {toDisplayText(displayStatus)}</p>
                <select
                  value={displayStatus}
                  onChange={(event) => {
                    setLocalBookingStatus(event.target.value);
                    void onUpdateBookingStatus(booking.id, event.target.value);
                  }}
                  disabled={activeAction === `booking:${booking.id}`}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                >
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {toDisplayText(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div className="rounded-[24px] border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 mb-1">Payment Status</p>
                <p className="text-[11px] text-slate-400 mb-3">Current: {toDisplayText(displayPaymentStatus)}</p>
                <select
                  value={displayPaymentStatus}
                  onChange={(event) => {
                    setLocalPaymentStatus(event.target.value);
                    firstPayment && void onUpdatePaymentStatus(firstPayment.id, event.target.value);
                  }}
                  disabled={!firstPayment || activeAction === `payment:${firstPayment?.id}`}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {toDisplayText(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: History / Timeline */}
          <div className="rounded-[26px] border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <p className="text-sm font-bold text-slate-900">Activity Timeline</p>
              </div>
              <span className="text-xs text-slate-400">{booking.statusHistory.length} events</span>
            </div>
            <div className="space-y-0">
              {booking.statusHistory.length ? (
                [...booking.statusHistory].reverse().map((entry, idx) => (
                  <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {idx < booking.statusHistory.length - 1 && (
                      <div className="absolute left-[13px] top-[30px] bottom-0 w-px bg-slate-200" />
                    )}
                    {/* Timeline dot */}
                    <div className={`relative z-10 mt-1.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 ${
                      entry.toStatus === "completed" ? "border-emerald-500 bg-emerald-50" :
                      entry.toStatus === "cancelled" || entry.toStatus === "rejected" ? "border-rose-400 bg-rose-50" :
                      entry.toStatus === "in_progress" ? "border-amber-400 bg-amber-50" :
                      "border-slate-300 bg-white"
                    }`}>
                      <span className={`text-[10px] font-black ${
                        entry.toStatus === "completed" ? "text-emerald-600" :
                        entry.toStatus === "cancelled" || entry.toStatus === "rejected" ? "text-rose-500" :
                        entry.toStatus === "in_progress" ? "text-amber-500" :
                        "text-slate-400"
                      }`}>
                        {entry.toStatus === "completed" ? "✓" :
                         entry.toStatus === "in_progress" ? "●" :
                         entry.toStatus === "cancelled" ? "✕" :
                         entry.toStatus === "rejected" ? "✕" :
                         idx + 1}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {entry.fromStatus
                            ? `${toDisplayText(entry.fromStatus)} → ${toDisplayText(entry.toStatus)}`
                            : toDisplayText(entry.toStatus)
                          }
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(entry.createdAt).toLocaleString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                      {entry.note && (
                        <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                          <p className="text-xs text-slate-600 leading-relaxed">{entry.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No activity recorded yet</p>
                  <p className="mt-1 text-xs text-slate-300">Status changes will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </article>
  );
}