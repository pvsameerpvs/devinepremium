"use client";

import { useState } from "react";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@devinepremium/shared";
import { formatAddressLine, formatStatusLabel, type AdminBooking, type StaffMember } from "@/lib/dashboard";

function toDisplayText(value: string) {
  return formatStatusLabel(value).replace(/\b\w/g, (char) => char.toUpperCase());
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

  const [isExpanded, setIsExpanded] = useState(requestStatus === "pending");

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer select-none flex-col gap-4 border-b border-slate-100 bg-slate-50 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between transition-colors hover:bg-slate-100 focus:bg-slate-100"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            {booking.bookingReference}
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
            {booking.serviceTitle}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {booking.contactName} • {booking.contactEmail}
          </p>
          <p className="mt-2 text-xs text-slate-500">Booking ID: {booking.id}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            {toDisplayText(booking.status)}
          </span>
          <span className="rounded-full bg-fuchsia-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
            {toDisplayText(booking.paymentStatus)}
          </span>
          {booking.assignedStaff ? (
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {booking.assignedStaff.fullName}
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Unassigned
            </span>
          )}
          <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      {isExpanded && (
      <div className="grid gap-6 px-5 py-5 sm:px-6 sm:py-6 xl:grid-cols-[1fr_0.95fr] animate-in fade-in slide-in-from-top-2">
        <div className="space-y-6">
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
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Customer request
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>Type: {toDisplayText(request.type)}</p>
                    <p>Status: {toDisplayText(request.status)}</p>
                    {request.requestedSchedule && (
                      <p>
                        Requested schedule: {request.requestedSchedule.date} at{" "}
                        {request.requestedSchedule.timeSlot}
                      </p>
                    )}
                    {request.note && <p>Customer note: {request.note}</p>}
                    {request.adminNote && <p>Admin note: {request.adminNote}</p>}
                  </div>
                </div>

                {requestStatus === "pending" && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        void onResolveCustomerRequest(booking.id, "approved")
                      }
                      disabled={activeAction === `request:${booking.id}:approved`}
                      className="rounded-full bg-[#37543B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4631] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void onResolveCustomerRequest(booking.id, "declined")
                      }
                      disabled={activeAction === `request:${booking.id}:declined`}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Booking info
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>
                  {booking.schedule.date} at {booking.schedule.timeSlot}
                </p>
                <p>{formatAddressLine(booking)}</p>
                <p>Total: {booking.totalAmount.toFixed(2)} AED</p>
                <p>Customer account: {booking.user?.email || "User not linked"}</p>
              </div>
            </div>

            <div className="rounded-[24px] bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Payment
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>Method: {toDisplayText(booking.paymentMethod)}</p>
                <p>Status: {toDisplayText(booking.paymentStatus)}</p>
                <p>Currency: {booking.currency}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 p-5">
            <label className="block text-sm font-semibold text-slate-900">
              Assign staff for this booking day
            </label>
            <select
              value={booking.assignedStaff?.id ?? ""}
              onChange={(event) =>
                void onAssignStaff(booking.id, event.target.value || null)
              }
              disabled={activeAction === `assign:${booking.id}`}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
            >
              <option value="">Unassigned</option>
              {assignableStaff.map((staffMember) => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.fullName}
                  {!staffMember.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs text-slate-500">
              Only staff available on {booking.schedule.date} are shown here.
            </p>
            {noAvailableStaff && (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No active staff is available on this booking day yet.
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 p-5">
              <label className="block text-sm font-semibold text-slate-900">
                Update booking status
              </label>
              <select
                value={booking.status}
                onChange={(event) =>
                  void onUpdateBookingStatus(booking.id, event.target.value)
                }
                disabled={activeAction === `booking:${booking.id}`}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              >
                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[24px] border border-slate-200 p-5">
              <label className="block text-sm font-semibold text-slate-900">
                Update payment status
              </label>
              <select
                value={booking.paymentStatus}
                onChange={(event) =>
                  firstPayment &&
                  void onUpdatePaymentStatus(firstPayment.id, event.target.value)
                }
                disabled={
                  !firstPayment || activeAction === `payment:${firstPayment?.id}`
                }
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-900">Status history</p>
          <div className="mt-4 space-y-3">
            {booking.statusHistory.length ? (
              booking.statusHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <p className="font-medium">
                    {entry.fromStatus ? `${toDisplayText(entry.fromStatus)} -> ` : ""}
                    {toDisplayText(entry.toStatus)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                  {entry.note && (
                    <p className="mt-2 text-xs text-slate-600">{entry.note}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No status history yet.</p>
            )}
          </div>
        </div>
      </div>
      )}
    </article>
  );
}
