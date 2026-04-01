"use client";

import Link from "next/link";
import type { BookingRecord, BookingStatusHistory } from "@/lib/account";
import { formatAddressLine, formatStatusLabel, canManageBooking } from "./account-shared";
import { OrderActionPanel } from "./OrderActionPanel";

export function getNextStepMessage(booking: BookingRecord) {
  if (booking.customerRequest?.status === "pending") {
    return "Your request is waiting for admin review.";
  }

  if (booking.paymentMethod === "online" && booking.paymentStatus !== "paid") {
    return "Finish the online payment to confirm this booking.";
  }

  switch (booking.status) {
    case "pending":
      return "Your booking is received and waiting for confirmation.";
    case "accepted":
      return "Your booking is accepted. The team will prepare the visit.";
    case "scheduled":
      return "Your service slot is confirmed and scheduled.";
    case "in_progress":
      return "The service is currently in progress.";
    case "completed":
      return "This booking is completed successfully.";
    case "cancelled":
      return "This booking has been cancelled.";
    case "rejected":
      return "This booking could not be accepted.";
    default:
      return "Track the latest updates for this booking here.";
  }
}

export function toDisplayText(value: string) {
  return formatStatusLabel(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

export function badgeClass(tone: "cyan" | "fuchsia" | "amber") {
  if (tone === "cyan") {
    return "bg-cyan-100 text-cyan-700";
  }
  if (tone === "fuchsia") {
    return "bg-fuchsia-100 text-fuchsia-700";
  }
  return "bg-amber-100 text-amber-700";
}

interface OrderCardProps {
  booking: BookingRecord;
  isActionOpen: boolean;
  activePanelType?: "cancel" | "reschedule" | null;
  activeMutation: string;
  inlineMessage: string;
  onOpenCancel: (booking: BookingRecord) => void;
  onOpenReschedule: (booking: BookingRecord) => void;
  onCloseAction: () => void;
  onSubmitAction: (bookingId: string) => void;
  requestNote: string;
  setRequestNote: (note: string) => void;
  requestedDate: string;
  setRequestedDate: (date: string) => void;
  requestedTimeSlot: string;
  setRequestedTimeSlot: (time: string) => void;
}

export function OrderCard({
  booking,
  isActionOpen,
  activePanelType,
  activeMutation,
  inlineMessage,
  onOpenCancel,
  onOpenReschedule,
  onCloseAction,
  onSubmitAction,
  requestNote,
  setRequestNote,
  requestedDate,
  setRequestedDate,
  requestedTimeSlot,
  setRequestedTimeSlot,
}: OrderCardProps) {
  const firstPayment = booking.payments?.[0];
  const requestStatus = booking.customerRequest?.status;
  const hasPendingRequest = requestStatus === "pending";
  const nextStepMessage = getNextStepMessage(booking);

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 px-4 pb-4 pt-5 sm:px-6 sm:pt-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">
            {booking.bookingReference}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {booking.serviceTitle}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {booking.schedule.date} at {booking.schedule.timeSlot}
          </p>
          <p className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">What happens next:</span> {nextStepMessage}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass("cyan")}`}>
            {toDisplayText(booking.status)}
          </span>
          <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass("fuchsia")}`}>
            {toDisplayText(booking.paymentStatus)}
          </span>
          {booking.customerRequest && (
            <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass("amber")}`}>
              {toDisplayText(booking.customerRequest.type)} request {toDisplayText(booking.customerRequest.status)}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 border-t border-slate-100 px-5 py-5 sm:px-6 sm:py-6 xl:grid-cols-[1.04fr_0.96fr] bg-slate-50/50">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Booking summary
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>Total: {booking.totalAmount.toFixed(2)} AED</p>
                <p>Payment method: {toDisplayText(booking.paymentMethod)}</p>
                <p>Address: {formatAddressLine(booking.address)}</p>
                <p>Contact: {booking.contactName}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Current progress
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>Booking: {toDisplayText(booking.status)}</p>
                <p>Payment: {toDisplayText(booking.paymentStatus)}</p>
                <p>Date: {booking.schedule.date}</p>
                <p>Time: {booking.schedule.timeSlot}</p>
              </div>
            </div>
          </div>

          {booking.customerRequest && (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                Latest request
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>Type: {toDisplayText(booking.customerRequest.type)}</p>
                <p>Status: {toDisplayText(booking.customerRequest.status)}</p>
                {booking.customerRequest.requestedSchedule && (
                  <p>
                    Requested schedule: {booking.customerRequest.requestedSchedule.date} at {booking.customerRequest.requestedSchedule.timeSlot}
                  </p>
                )}
                {booking.customerRequest.note && (
                  <p>Note: {booking.customerRequest.note}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap pt-2">
            {booking.paymentMethod === "online" && booking.paymentStatus !== "paid" && firstPayment && (
              <Link
                href={`/payment/checkout?paymentId=${firstPayment.id}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#7B2D8B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#632271] sm:w-auto shadow-md"
              >
                Continue payment
              </Link>
            )}

            {canManageBooking(booking) && !hasPendingRequest && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenReschedule(booking)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300 bg-cyan-50 px-6 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 hover:text-cyan-900 sm:w-auto"
                >
                  Change time
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCancel(booking)}
                  className="inline-flex w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 sm:w-auto"
                >
                  Cancel booking
                </button>
              </>
            )}
          </div>

          {isActionOpen && (
            <OrderActionPanel
              activePanelType={activePanelType!}
              activeMutation={activeMutation}
              inlineMessage={inlineMessage}
              requestNote={requestNote}
              setRequestNote={setRequestNote}
              requestedDate={requestedDate}
              setRequestedDate={setRequestedDate}
              requestedTimeSlot={requestedTimeSlot}
              setRequestedTimeSlot={setRequestedTimeSlot}
              onSubmit={() => onSubmitAction(booking.id)}
              onClose={onCloseAction}
            />
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-3">
            Recent updates
          </p>
          <div className="space-y-4">
            {booking.statusHistory?.length ? (
              booking.statusHistory.map((entry: BookingStatusHistory) => (
                <div key={entry.id} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-cyan-500 after:absolute after:bottom-[-20px] after:left-[14.5px] after:top-5 after:w-[1px] after:bg-slate-200 last:after:hidden">
                  <p className="font-medium text-sm text-slate-800">
                    {entry.fromStatus ? `${toDisplayText(entry.fromStatus)} -> ` : ""}
                    {toDisplayText(entry.toStatus)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                  {entry.note && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {entry.note}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No updates available yet.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
