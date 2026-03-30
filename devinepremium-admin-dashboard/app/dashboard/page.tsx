"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@devinepremium/shared";
import useSWR from "swr";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";
import { PaymentFollowUpPanel } from "@/components/dashboard/PaymentFollowUpPanel";
import {
  StaffManagementPanel,
  type StaffFormState,
} from "@/components/dashboard/StaffManagementPanel";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { apiRequest } from "@/lib/api";
import {
  clearAdminSession,
  getStoredAdminSession,
  type AdminSession,
} from "@/lib/auth";
import {
  type AdminBooking,
  type AdminDashboardResponse,
  type StaffMember,
  formatAddressLine,
  formatStatusLabel,
  getAvailableStaffForDate,
  matchesBookingSearch,
} from "@/lib/dashboard";

interface PageMessage {
  tone: "success" | "error";
  text: string;
}

const EMPTY_BOOKINGS: AdminBooking[] = [];
const EMPTY_STAFF: StaffMember[] = [];

function getAssignableStaff(
  booking: AdminBooking,
  staffMembers: StaffMember[],
) {
  const availableStaff = getAvailableStaffForDate(
    staffMembers,
    booking.schedule.date,
  );

  if (
    booking.assignedStaff &&
    !availableStaff.some((staffMember) => staffMember.id === booking.assignedStaff?.id)
  ) {
    return [booking.assignedStaff, ...availableStaff];
  }

  return availableStaff;
}

function DashboardContent({
  session,
}: {
  session: AdminSession;
}) {
  const [activeAction, setActiveAction] = useState("");
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/admin/dashboard", session.token],
    ([path, token]) =>
      apiRequest<AdminDashboardResponse>(path, {
        method: "GET",
        token,
      }),
  );

  async function runDashboardAction(
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) {
    setActiveAction(actionKey);
    setPageMessage(null);

    try {
      await action();
      setPageMessage({
        tone: "success",
        text: successMessage,
      });
      await mutate();
      return true;
    } catch (actionError) {
      setPageMessage({
        tone: "error",
        text:
          actionError instanceof Error
            ? actionError.message
            : "Action failed. Please try again.",
      });
      return false;
    } finally {
      setActiveAction("");
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    await runDashboardAction(
      `booking:${bookingId}`,
      "Booking status updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/bookings/${bookingId}/status`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            status,
            note: "Updated from admin dashboard.",
          }),
        });
      },
    );
  }

  async function updatePaymentStatus(paymentId: string, status: string) {
    await runDashboardAction(
      `payment:${paymentId}`,
      "Payment status updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/payments/${paymentId}/status`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            status,
          }),
        });
      },
    );
  }

  async function resolveCustomerRequest(
    bookingId: string,
    decision: "approved" | "declined",
  ) {
    await runDashboardAction(
      `request:${bookingId}:${decision}`,
      "Customer request updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/bookings/${bookingId}/customer-request`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            decision,
          }),
        });
      },
    );
  }

  async function assignStaff(bookingId: string, staffId: string | null) {
    await runDashboardAction(
      `assign:${bookingId}`,
      staffId ? "Staff assigned successfully." : "Staff assignment cleared successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/bookings/${bookingId}/assign-staff`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            staffId,
          }),
        });
      },
    );
  }

  async function createStaff(input: StaffFormState) {
    return runDashboardAction(
      "create-staff",
      "Staff member created successfully.",
      async () => {
        await apiRequest("/api/v1/admin/staff", {
          method: "POST",
          token: session.token,
          body: JSON.stringify(input),
        });
      },
    );
  }

  async function updateStaff(staffId: string, input: StaffFormState) {
    return runDashboardAction(
      `update-staff:${staffId}`,
      "Staff member updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/staff/${staffId}`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify(input),
        });
      },
    );
  }

  const bookings = data?.bookings ?? EMPTY_BOOKINGS;
  const staffMembers = data?.staffMembers ?? EMPTY_STAFF;

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => matchesBookingSearch(booking, searchQuery)),
    [bookings, searchQuery],
  );

  const activeStaffCount = useMemo(
    () => staffMembers.filter((staffMember) => staffMember.isActive).length,
    [staffMembers],
  );

  const paymentFollowUpCount = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus !== "paid").length,
    [bookings],
  );

  const coverageGapCount = useMemo(
    () =>
      bookings.filter((booking) => {
        const availableStaff = getAvailableStaffForDate(
          staffMembers,
          booking.schedule.date,
        );

        return !booking.assignedStaff || availableStaff.length === 0;
      }).length,
    [bookings, staffMembers],
  );

  if (isLoading) {
    return (
      <div className="rounded-[30px] border border-slate-200 bg-white p-10 shadow-sm">
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[30px] border border-red-200 bg-red-50 p-10 text-red-700">
        {error instanceof Error ? error.message : "Dashboard failed to load."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {pageMessage && (
        <div
          className={`rounded-[24px] px-5 py-4 text-sm ${
            pageMessage.tone === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {pageMessage.text}
        </div>
      )}

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
              Search bookings
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              Find by customer, email, booking ID, or reference
            </h2>
          </div>
          <div className="flex w-full max-w-xl items-center gap-3">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customer name, email, booking ID, or DP reference"
              className="h-12 flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
            />
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total bookings"
          value={data?.summary.totalBookings ?? 0}
          accent="bg-[#152344]"
        />
        <SummaryCard
          label="Pending requests"
          value={data?.summary.pendingCustomerRequests ?? 0}
          accent="bg-[#A65A2A]"
        />
        <SummaryCard
          label="Active staff"
          value={activeStaffCount}
          accent="bg-[#37543B]"
        />
        <SummaryCard
          label="Payment follow-up"
          value={paymentFollowUpCount}
          accent="bg-[#5A2E5D]"
        />
        <SummaryCard
          label="Coverage gaps"
          value={coverageGapCount}
          accent="bg-[#7A4B12]"
        />
      </div>

      <BookingCalendar bookings={bookings} staffMembers={staffMembers} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StaffManagementPanel
          staffMembers={staffMembers}
          activeAction={activeAction}
          onCreateStaff={createStaff}
          onUpdateStaff={updateStaff}
        />
        <PaymentFollowUpPanel
          bookings={filteredBookings}
          activeAction={activeAction}
          onUpdatePaymentStatus={updatePaymentStatus}
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
              Booking operations
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Assign staff, manage status, and track customer requests
            </h2>
          </div>
        </div>

        {filteredBookings.length ? (
          filteredBookings.map((booking) => {
            const firstPayment = booking.payments[0];
            const request = booking.customerRequest;
            const requestStatus = request?.status;
            const assignableStaff = getAssignableStaff(booking, staffMembers);
            const noAvailableStaff = assignableStaff.length === 0;

            return (
              <article
                key={booking.id}
                className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {booking.bookingReference}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      {booking.serviceTitle}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {booking.contactName} • {booking.contactEmail}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Booking ID: {booking.id}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      {formatStatusLabel(booking.status)}
                    </span>
                    <span className="rounded-full bg-fuchsia-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                      {formatStatusLabel(booking.paymentStatus)}
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
                  </div>
                </div>

                <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_0.95fr]">
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
                              <p>Type: {formatStatusLabel(request.type)}</p>
                              <p>Status: {formatStatusLabel(request.status)}</p>
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
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void resolveCustomerRequest(booking.id, "approved")
                                }
                                disabled={
                                  activeAction === `request:${booking.id}:approved`
                                }
                                className="rounded-full bg-[#37543B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4631] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void resolveCustomerRequest(booking.id, "declined")
                                }
                                disabled={
                                  activeAction === `request:${booking.id}:declined`
                                }
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
                          <p>Method: {booking.paymentMethod}</p>
                          <p>Status: {booking.paymentStatus}</p>
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
                          void assignStaff(booking.id, event.target.value || null)
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
                            void updateBookingStatus(booking.id, event.target.value)
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
                            void updatePaymentStatus(firstPayment.id, event.target.value)
                          }
                          disabled={
                            !firstPayment ||
                            activeAction === `payment:${firstPayment?.id}`
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
                    <p className="text-sm font-semibold text-slate-900">
                      Status history
                    </p>
                    <div className="mt-4 space-y-3">
                      {booking.statusHistory.length ? (
                        booking.statusHistory.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                          >
                            <p className="font-medium">
                              {entry.fromStatus ? `${entry.fromStatus} -> ` : ""}
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
                          No status history yet.
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
              No bookings match this search
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Try customer name, email, booking reference, or booking ID.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getStoredAdminSession());
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          Loading admin session...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">
            Admin login required
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Sign in with an admin account to manage booking approval, payment
            collection, staffing, and customer history.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
          >
            Go to admin login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdf9f1_0%,#f7f2ea_35%,#eef3f9_100%)] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[34px] bg-white px-6 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.28em] text-[#A65A2A]">
            Devine Premium admin
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            Welcome, {session.user.fullName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{session.user.email}</p>
        </div>

        <DashboardContent session={session} />

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => {
              clearAdminSession();
              setSession(null);
            }}
            className="rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
