"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import type { BookingRecord } from "@/lib/account";
import type { UserSession } from "@/lib/auth";
import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";
import {
  canManageBooking,
  formatAddressLine,
  formatStatusLabel,
  hasCustomerAction,
} from "./account-shared";

function badgeClass(tone: "cyan" | "fuchsia" | "amber") {
  if (tone === "cyan") {
    return "bg-cyan-100 text-cyan-700";
  }

  if (tone === "fuchsia") {
    return "bg-fuchsia-100 text-fuchsia-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function OrdersPanel({
  bookings,
  mutateBookings,
  session,
}: {
  bookings: BookingRecord[];
  mutateBookings: () => Promise<unknown>;
  session: UserSession;
}) {
  const [ordersTab, setOrdersTab] = useState<"history" | "actions">("history");
  const [activePanel, setActivePanel] = useState<{
    bookingId: string;
    type: "cancel" | "reschedule";
  } | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTimeSlot, setRequestedTimeSlot] = useState<string>(
    CUSTOMER_TIME_SLOTS[0],
  );
  const [activeMutation, setActiveMutation] = useState("");
  const [inlineMessage, setInlineMessage] = useState("");

  const filteredBookings =
    ordersTab === "history"
      ? bookings
      : bookings.filter((booking) => hasCustomerAction(booking));
  const actionCount = bookings.filter((booking) =>
    hasCustomerAction(booking),
  ).length;

  function openCancelPanel(booking: BookingRecord) {
    setInlineMessage("");
    setRequestNote("");
    setActivePanel({
      bookingId: booking.id,
      type: "cancel",
    });
  }

  function openReschedulePanel(booking: BookingRecord) {
    setInlineMessage("");
    setRequestNote("");
    setRequestedDate(booking.schedule.date);
    setRequestedTimeSlot(booking.schedule.timeSlot);
    setActivePanel({
      bookingId: booking.id,
      type: "reschedule",
    });
  }

  async function submitCancelRequest(bookingId: string) {
    setActiveMutation(`cancel:${bookingId}`);
    setInlineMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/bookings/${bookingId}/cancel-request`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify({
            note: requestNote,
          }),
        },
      );

      setInlineMessage(response.message);
      setActivePanel(null);
      await mutateBookings();
    } catch (error) {
      setInlineMessage(
        error instanceof Error ? error.message : "Could not send request.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  async function submitRescheduleRequest(bookingId: string) {
    if (!requestedDate || !requestedTimeSlot) {
      setInlineMessage("Please choose a new date and time.");
      return;
    }

    setActiveMutation(`reschedule:${bookingId}`);
    setInlineMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/bookings/${bookingId}/reschedule-request`,
        {
          method: "POST",
          token: session.token,
          body: JSON.stringify({
            schedule: {
              date: requestedDate,
              timeSlot: requestedTimeSlot,
            },
            note: requestNote,
          }),
        },
      );

      setInlineMessage(response.message);
      setActivePanel(null);
      await mutateBookings();
    } catch (error) {
      setInlineMessage(
        error instanceof Error ? error.message : "Could not send request.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">
            Orders
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">
            Booking history and order actions
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Follow progress, continue payment, or send a request when a booking
            needs attention.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void mutateBookings()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Refresh orders
        </button>
      </div>

      <div className="inline-flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setOrdersTab("history")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            ordersTab === "history"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Booking history ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setOrdersTab("actions")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            ordersTab === "actions"
              ? "bg-[#00B4D8] text-white"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Order actions ({actionCount})
        </button>
      </div>

      {filteredBookings.length ? (
        filteredBookings.map((booking) => {
          const firstPayment = booking.payments[0];
          const requestStatus = booking.customerRequest?.status;
          const hasPendingRequest = requestStatus === "pending";
          const isActionOpen = activePanel?.bookingId === booking.id;

          return (
            <article
              key={booking.id}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_14px_42px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-col gap-4 px-6 pb-4 pt-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {booking.bookingReference}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {booking.serviceTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.schedule.date} at {booking.schedule.timeSlot}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass("cyan")}`}
                  >
                    {formatStatusLabel(booking.status)}
                  </span>
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass("fuchsia")}`}
                  >
                    {formatStatusLabel(booking.paymentStatus)}
                  </span>
                  {booking.customerRequest && (
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass("amber")}`}
                    >
                      {booking.customerRequest.type} request{" "}
                      {booking.customerRequest.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-6 border-t border-slate-100 px-6 py-6 xl:grid-cols-[1.04fr_0.96fr]">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Order details
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>Total: {booking.totalAmount.toFixed(2)} AED</p>
                        <p>Payment method: {booking.paymentMethod}</p>
                        <p>Address: {formatAddressLine(booking.address)}</p>
                        <p>Contact: {booking.contactName}</p>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Current status
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>Booking: {formatStatusLabel(booking.status)}</p>
                        <p>Payment: {formatStatusLabel(booking.paymentStatus)}</p>
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
                        <p>
                          Type: {formatStatusLabel(booking.customerRequest.type)}
                        </p>
                        <p>
                          Status:{" "}
                          {formatStatusLabel(booking.customerRequest.status)}
                        </p>
                        {booking.customerRequest.requestedSchedule && (
                          <p>
                            Requested schedule:{" "}
                            {booking.customerRequest.requestedSchedule.date} at{" "}
                            {booking.customerRequest.requestedSchedule.timeSlot}
                          </p>
                        )}
                        {booking.customerRequest.note && (
                          <p>Note: {booking.customerRequest.note}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {booking.paymentMethod === "online" &&
                      booking.paymentStatus !== "paid" &&
                      firstPayment && (
                        <Link
                          href={`/payment/checkout?paymentId=${firstPayment.id}`}
                          className="inline-flex rounded-full bg-[#7B2D8B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#632271]"
                        >
                          Continue payment
                        </Link>
                      )}

                    {canManageBooking(booking) && !hasPendingRequest && (
                      <>
                        <button
                          type="button"
                          onClick={() => openReschedulePanel(booking)}
                          className="rounded-full border border-cyan-200 px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:text-cyan-800"
                        >
                          Request reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => openCancelPanel(booking)}
                          className="rounded-full border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:text-red-700"
                        >
                          Request cancel
                        </button>
                      </>
                    )}
                  </div>

                  {isActionOpen && (
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">
                        {activePanel?.type === "cancel"
                          ? "Send cancellation request"
                          : "Send reschedule request"}
                      </p>

                      <div className="mt-4 grid gap-4">
                        {activePanel?.type === "reschedule" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                New date
                              </span>
                              <input
                                type="date"
                                value={requestedDate}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(event) =>
                                  setRequestedDate(event.target.value)
                                }
                                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                              />
                            </label>
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                New time
                              </span>
                              <select
                                value={requestedTimeSlot}
                                onChange={(event) =>
                                  setRequestedTimeSlot(event.target.value)
                                }
                                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                              >
                                {CUSTOMER_TIME_SLOTS.map((timeSlot) => (
                                  <option key={timeSlot} value={timeSlot}>
                                    {timeSlot}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )}

                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-slate-700">
                            Note to admin
                          </span>
                          <textarea
                            value={requestNote}
                            onChange={(event) =>
                              setRequestNote(event.target.value)
                            }
                            className="min-h-[100px] rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                            placeholder={
                              activePanel?.type === "cancel"
                                ? "Tell us why you want to cancel..."
                                : "Tell us which time works better..."
                            }
                          />
                        </label>
                      </div>

                      {inlineMessage && (
                        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {inlineMessage}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            activePanel?.type === "cancel"
                              ? void submitCancelRequest(booking.id)
                              : void submitRescheduleRequest(booking.id)
                          }
                          disabled={Boolean(activeMutation)}
                          className="rounded-full bg-[#00B4D8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {activeMutation ? "Sending request..." : "Send request"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePanel(null);
                            setInlineMessage("");
                          }}
                          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Order timeline
                  </p>

                  <div className="mt-4 space-y-3">
                    {booking.statusHistory.length ? (
                      booking.statusHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700"
                        >
                          <p className="font-medium">
                            {entry.fromStatus
                              ? `${entry.fromStatus} -> `
                              : ""}
                            {entry.toStatus}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(entry.createdAt).toLocaleString()}
                          </p>
                          {entry.note && (
                            <p className="mt-2 text-xs text-slate-600">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No updates available yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })
      ) : (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          {ordersTab === "history" ? (
            <>
              <p className="text-lg font-semibold text-slate-900">
                No orders linked to this account yet.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Sign in before placing an order, then come back here to track
                status, payments, and service history.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-slate-900">
                No customer action is needed right now.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                When a booking needs payment, reschedule, or cancel action, it
                will appear in this tab.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
