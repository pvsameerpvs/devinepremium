"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
  saveUserSession,
  type UserSession,
} from "@/lib/auth";
import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";
import {
  type BookingHistoryResponse,
  type BookingRecord,
  type CustomerAccountResponse,
  type SavedAddressPayload,
  type SavedAddressRecord,
} from "@/lib/account";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";

interface ProfileFormState {
  fullName: string;
  phone: string;
  defaultInstructions: string;
}

interface AddressFormState extends SavedAddressPayload {}

const emptyAddressForm: AddressFormState = {
  label: "",
  location: "",
  building: "",
  apartment: "",
  city: "",
  mapLink: "",
  lat: "",
  lng: "",
  isDefault: false,
};

function canManageBooking(booking: BookingRecord) {
  return !["completed", "cancelled", "rejected"].includes(booking.status);
}

function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ");
}

function formatAddressLine(address: BookingRecord["address"] | SavedAddressRecord) {
  return [
    address.building,
    address.apartment,
    address.location,
    address.city,
  ]
    .filter(Boolean)
    .join(", ");
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className={`rounded-[28px] p-6 text-white shadow-xl ${accent}`}>
      <p className="text-sm uppercase tracking-[0.22em] text-white/75">{label}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}

function ProfilePanel({
  form,
  onChange,
  onSave,
  isSaving,
}: {
  form: ProfileFormState;
  onChange: (field: keyof ProfileFormState, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">
            My profile
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Saved customer details
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Keep your account details ready so bookings fill faster next time.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <input
            value={form.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            placeholder="Your full name"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Phone</span>
          <input
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            placeholder="+971..."
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Default booking notes
          </span>
          <textarea
            value={form.defaultInstructions}
            onChange={(event) =>
              onChange("defaultInstructions", event.target.value)
            }
            className="min-h-[110px] rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            placeholder="Gate code, parking note, access details..."
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void onSave()}
        disabled={isSaving}
        className="mt-6 inline-flex rounded-full bg-[#00B4D8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving profile..." : "Save profile"}
      </button>
    </section>
  );
}

function SavedAddressesPanel({
  addresses,
  form,
  editingAddressId,
  activeMutation,
  onChange,
  onCreate,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
}: {
  addresses: SavedAddressRecord[];
  form: AddressFormState;
  editingAddressId: string | null;
  activeMutation: string;
  onChange: (field: keyof AddressFormState, value: string | boolean) => void;
  onCreate: () => void;
  onEdit: (address: SavedAddressRecord) => void;
  onDelete: (addressId: string) => Promise<void>;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-fuchsia-700">
            Saved addresses
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Faster repeat booking
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Save home or office locations so future bookings are quicker.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Add address
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {addresses.length ? (
          addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-slate-900">
                      {address.label}
                    </p>
                    {address.isDefault && (
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {formatAddressLine(address)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(address)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(address.id)}
                    disabled={activeMutation === `delete-address:${address.id}`}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {activeMutation === `delete-address:${address.id}`
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No saved addresses yet.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Add your usual address once and reuse it when booking again.
            </p>
          </div>
        )}
      </div>

      {(editingAddressId !== null || !addresses.length) && (
        <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {editingAddressId ? "Edit address" : "New address"}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Label</span>
              <input
                value={form.label}
                onChange={(event) => onChange("label", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Home, Office, Villa..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">City</span>
              <input
                value={form.city}
                onChange={(event) => onChange("city", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Dubai"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Area / location
              </span>
              <input
                value={form.location}
                onChange={(event) => onChange("location", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Dubai Marina"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Building / villa
              </span>
              <input
                value={form.building}
                onChange={(event) => onChange("building", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Tower name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Apartment / unit
              </span>
              <input
                value={form.apartment}
                onChange={(event) => onChange("apartment", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="1204"
              />
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Map link
              </span>
              <input
                value={form.mapLink}
                onChange={(event) => onChange("mapLink", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="https://www.google.com/maps?q=..."
              />
            </label>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Checkbox
              checked={Boolean(form.isDefault)}
              onCheckedChange={(checked) =>
                onChange("isDefault", checked === true)
              }
            />
            <span className="text-sm font-medium text-slate-700">
              Make this my default address
            </span>
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={activeMutation === "save-address"}
              className="rounded-full bg-[#7B2D8B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#632271] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {activeMutation === "save-address"
                ? "Saving address..."
                : editingAddressId
                  ? "Update address"
                  : "Save address"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function OrdersPanel({
  bookings,
  mutateBookings,
  session,
}: {
  bookings: BookingRecord[];
  mutateBookings: () => Promise<unknown>;
  session: UserSession;
}) {
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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">
            Orders
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">
            Booking history and order actions
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void mutateBookings()}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Refresh orders
        </button>
      </div>

      {bookings.length ? (
        bookings.map((booking) => {
          const firstPayment = booking.payments[0];
          const requestStatus = booking.customerRequest?.status;
          const hasPendingRequest = requestStatus === "pending";
          const isActionOpen = activePanel?.bookingId === booking.id;

          return (
            <article
              key={booking.id}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
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
                  <span className="rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    {formatStatusLabel(booking.status)}
                  </span>
                  <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                    {formatStatusLabel(booking.paymentStatus)}
                  </span>
                  {booking.customerRequest && (
                    <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      {booking.customerRequest.type} request {booking.customerRequest.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-5">
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
                            onChange={(event) => setRequestNote(event.target.value)}
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
                          {activeMutation
                            ? "Sending request..."
                            : "Send request"}
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

                <div className="rounded-[24px] border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Order timeline
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {booking.statusHistory.length ? (
                      booking.statusHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
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
          <p className="text-lg font-semibold text-slate-900">
            No orders linked to this account yet.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Sign in before placing an order, then come back here to track
            status, payments, and service history.
          </p>
        </div>
      )}
    </section>
  );
}

export function CustomerAccountPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: "",
    phone: "",
    defaultInstructions: "",
  });
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [activeMutation, setActiveMutation] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  useEffect(() => {
    setSession(getStoredUserSession());
    setIsReady(true);
  }, []);

  const { data: accountData, error: accountError, isLoading: isAccountLoading, mutate: mutateAccount } = useSWR(
    session?.token ? ["/api/v1/account", session.token] : null,
    ([path, token]) =>
      apiRequest<CustomerAccountResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const {
    data: bookingData,
    error: bookingError,
    isLoading: isBookingsLoading,
    mutate: mutateBookings,
  } = useSWR(
    session?.token ? ["/api/v1/bookings/me", session.token] : null,
    ([path, token]) =>
      apiRequest<BookingHistoryResponse>(path, {
        method: "GET",
        token,
      }),
  );

  useEffect(() => {
    if (!accountData) {
      return;
    }

    setProfileForm({
      fullName: accountData.user.fullName || "",
      phone: accountData.user.phone || "",
      defaultInstructions: accountData.user.defaultInstructions || "",
    });
  }, [accountData]);

  const summary = useMemo(() => {
    const bookings = bookingData?.bookings ?? [];
    return {
      total: bookings.length,
      active: bookings.filter((booking) =>
        ["pending", "accepted", "scheduled", "in_progress"].includes(
          booking.status,
        ),
      ).length,
      pendingRequests: bookings.filter(
        (booking) => booking.customerRequest?.status === "pending",
      ).length,
      savedAddresses: accountData?.savedAddresses.length ?? 0,
    };
  }, [accountData, bookingData]);

  async function handleProfileSave() {
    if (!session?.token) {
      return;
    }

    setActiveMutation("save-profile");
    setPageMessage("");

    try {
      const response = await apiRequest<{
        message: string;
        user: CustomerAccountResponse["user"];
      }>("/api/v1/account/profile", {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify(profileForm),
      });

      const updatedSession: UserSession = {
        ...session,
        user: {
          ...session.user,
          fullName: response.user.fullName,
          phone: response.user.phone,
        },
      };

      saveUserSession(updatedSession);
      setSession(updatedSession);
      setPageMessage(response.message);
      await mutateAccount();
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Could not update profile.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  function startCreateAddress() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId("new");
  }

  function startEditAddress(address: SavedAddressRecord) {
    setAddressForm({
      label: address.label,
      location: address.location,
      building: address.building || "",
      apartment: address.apartment || "",
      city: address.city,
      mapLink: address.mapLink || "",
      lat: address.lat || "",
      lng: address.lng || "",
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
  }

  function resetAddressForm() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
  }

  async function handleSaveAddress() {
    if (!session?.token) {
      return;
    }

    setActiveMutation("save-address");
    setPageMessage("");

    try {
      const path =
        editingAddressId && editingAddressId !== "new"
          ? `/api/v1/account/addresses/${editingAddressId}`
          : "/api/v1/account/addresses";
      const method =
        editingAddressId && editingAddressId !== "new" ? "PATCH" : "POST";

      const response = await apiRequest<{ message: string }>(path, {
        method,
        token: session.token,
        body: JSON.stringify(addressForm),
      });

      setPageMessage(response.message);
      resetAddressForm();
      await mutateAccount();
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Could not save address.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  async function handleDeleteAddress(addressId: string) {
    if (!session?.token) {
      return;
    }

    setActiveMutation(`delete-address:${addressId}`);
    setPageMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/account/addresses/${addressId}`,
        {
          method: "DELETE",
          token: session.token,
        },
      );

      setPageMessage(response.message);
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      await mutateAccount();
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Could not delete address.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  if (!isReady) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          Loading your account...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">
            Login required
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Sign in with your email account to view order history and payment
            status.
          </p>
          <Link
            href="/login?redirect=%2Faccount"
            className="mt-8 inline-flex rounded-full bg-[#00B4D8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7]"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fcfd_0%,#eef7fb_45%,#f8f5fb_100%)] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] bg-white px-6 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700">
              Customer account
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Welcome back, {session.user.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{session.user.email}</p>
            <p className="mt-2 text-sm text-slate-500">
              Profile, saved addresses, order history, and customer requests in
              one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Back to website
            </Link>
            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured()) {
                  const supabase = getSupabaseBrowserClient();
                  await supabase.auth.signOut();
                }

                clearUserSession();
                setSession(null);
              }}
              className="rounded-full bg-[#7B2D8B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#632271]"
            >
              Logout
            </button>
          </div>
        </div>

        {pageMessage && (
          <div className="mb-6 rounded-[24px] border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm text-cyan-800">
            {pageMessage}
          </div>
        )}

        {(accountError || bookingError) && (
          <div className="mb-6 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {(accountError instanceof Error && accountError.message) ||
              (bookingError instanceof Error && bookingError.message) ||
              "Could not load your account data."}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total orders"
            value={summary.total}
            accent="bg-[#0D0D1A]"
          />
          <SummaryCard
            label="Active orders"
            value={summary.active}
            accent="bg-[#00B4D8]"
          />
          <SummaryCard
            label="Saved addresses"
            value={summary.savedAddresses}
            accent="bg-[#7B2D8B]"
          />
          <SummaryCard
            label="Pending requests"
            value={summary.pendingRequests}
            accent="bg-[#0E7A64]"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <ProfilePanel
            form={profileForm}
            onChange={(field, value) =>
              setProfileForm((prev) => ({
                ...prev,
                [field]: value,
              }))
            }
            onSave={handleProfileSave}
            isSaving={activeMutation === "save-profile"}
          />

          <SavedAddressesPanel
            addresses={accountData?.savedAddresses ?? []}
            form={addressForm}
            editingAddressId={editingAddressId}
            activeMutation={activeMutation}
            onChange={(field, value) =>
              setAddressForm((prev) => ({
                ...prev,
                [field]: value,
              }))
            }
            onCreate={startCreateAddress}
            onEdit={startEditAddress}
            onDelete={handleDeleteAddress}
            onSubmit={handleSaveAddress}
            onCancel={resetAddressForm}
          />
        </div>

        <div className="mt-8">
          {isAccountLoading || isBookingsLoading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              Loading your account details...
            </div>
          ) : (
            <OrdersPanel
              bookings={bookingData?.bookings ?? []}
              mutateBookings={mutateBookings}
              session={session}
            />
          )}
        </div>
      </div>
    </main>
  );
}
