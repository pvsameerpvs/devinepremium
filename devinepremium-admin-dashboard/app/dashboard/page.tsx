"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@devinepremium/shared";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  clearAdminSession,
  getStoredAdminSession,
  type AdminSession,
} from "@/lib/auth";

interface DashboardSummary {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  paidBookings: number;
  cashDueBookings: number;
  pendingCustomerRequests: number;
  revenueCollected: number;
}

interface BookingChangeRequest {
  type: "cancel" | "reschedule";
  status: "pending" | "approved" | "declined";
  note?: string | null;
  requestedSchedule?: {
    date: string;
    timeSlot: string;
  } | null;
  createdAt: string;
  respondedAt?: string | null;
  adminNote?: string | null;
}

interface AdminBooking {
  id: string;
  bookingReference: string;
  serviceTitle: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  contactName: string;
  contactEmail: string;
  address: {
    city: string;
    location: string;
    building?: string;
    apartment?: string;
  };
  schedule: {
    date: string;
    timeSlot: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  payments: Array<{
    id: string;
    status: string;
    method: string;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    createdAt: string;
    note: string | null;
  }>;
  customerRequest?: BookingChangeRequest | null;
}

interface AdminDashboardResponse {
  summary: DashboardSummary;
  bookings: AdminBooking[];
}

function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ");
}

function formatAddressLine(booking: AdminBooking) {
  return [
    booking.address.building,
    booking.address.apartment,
    booking.address.location,
    booking.address.city,
  ]
    .filter(Boolean)
    .join(", ");
}

function parseBookingDate(date: string) {
  return new Date(`${date}T12:00:00`);
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
      <p className="text-sm uppercase tracking-[0.22em] text-white/70">{label}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}

function BookingCalendar({
  bookings,
}: {
  bookings: AdminBooking[];
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const firstBooking = bookings[0]?.schedule.date;
    return firstBooking ? parseBookingDate(firstBooking) : new Date();
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const firstBooking = bookings[0]?.schedule.date;
    return firstBooking ?? new Date().toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (!bookings.length) {
      return;
    }

    const hasSelectedDate = bookings.some(
      (booking) => booking.schedule.date === selectedDateKey,
    );

    if (!hasSelectedDate) {
      setSelectedDateKey(bookings[0].schedule.date);
    }
  }, [bookings, selectedDateKey]);

  const monthBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = parseBookingDate(booking.schedule.date);
      return (
        bookingDate.getFullYear() === currentMonth.getFullYear() &&
        bookingDate.getMonth() === currentMonth.getMonth()
      );
    });
  }, [bookings, currentMonth]);

  const bookingsByDate = useMemo(() => {
    return monthBookings.reduce<Record<string, AdminBooking[]>>((acc, booking) => {
      acc[booking.schedule.date] = [...(acc[booking.schedule.date] ?? []), booking]
        .sort((a, b) => a.schedule.timeSlot.localeCompare(b.schedule.timeSlot));
      return acc;
    }, {});
  }, [monthBookings]);

  const selectedDayBookings = useMemo(() => {
    return [...(bookingsByDate[selectedDateKey] ?? [])].sort((a, b) =>
      a.schedule.timeSlot.localeCompare(b.schedule.timeSlot),
    );
  }, [bookingsByDate, selectedDateKey]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const leadingEmptyDays = Array.from({ length: firstWeekday });
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const dayBookings = bookingsByDate[dateKey] ?? [];
    const isSelected = selectedDateKey === dateKey;
    const isToday = dateKey === new Date().toISOString().slice(0, 10);

    return (
      <button
        key={dateKey}
        type="button"
        onClick={() => setSelectedDateKey(dateKey)}
        className={`flex min-h-[120px] flex-col rounded-[22px] border p-3 text-left transition ${
          isSelected
            ? "border-[#A65A2A] bg-amber-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-semibold ${
              isToday ? "text-[#A65A2A]" : "text-slate-700"
            }`}
          >
            {dayNumber}
          </span>
          {dayBookings.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {dayBookings.length}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {dayBookings.slice(0, 2).map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700"
            >
              <p className="font-semibold">{booking.schedule.timeSlot}</p>
              <p className="mt-1 line-clamp-2">{booking.serviceTitle}</p>
            </div>
          ))}
          {dayBookings.length > 2 && (
            <p className="text-[11px] font-medium text-slate-500">
              +{dayBookings.length - 2} more bookings
            </p>
          )}
        </div>
      </button>
    );
  });

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Calendar view
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">
            All bookings by date and time
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (value) => new Date(value.getFullYear(), value.getMonth() - 1, 1),
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Prev
          </button>
          <p className="min-w-[180px] text-center text-sm font-semibold text-slate-900">
            {currentMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (value) => new Date(value.getFullYear(), value.getMonth() + 1, 1),
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div>
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {leadingEmptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] rounded-[22px] bg-transparent" />
            ))}
            {calendarDays}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Selected day
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-900">
            {parseBookingDate(selectedDateKey).toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>

          <div className="mt-5 space-y-3">
            {selectedDayBookings.length ? (
              selectedDayBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.schedule.timeSlot}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {booking.contactName} • {booking.contactEmail}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      {formatStatusLabel(booking.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {formatAddressLine(booking)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  No bookings on this date
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Choose another day in the calendar to review the schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardContent({
  session,
  onLogout,
}: {
  session: AdminSession;
  onLogout: () => void;
}) {
  const [activeAction, setActiveAction] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/admin/dashboard", session.token],
    ([path, token]) =>
      apiRequest<AdminDashboardResponse>(path, {
        method: "GET",
        token,
      }),
  );

  async function updateBookingStatus(bookingId: string, status: string) {
    setActiveAction(`booking:${bookingId}`);
    setPageMessage("");

    try {
      await apiRequest(`/api/v1/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({
          status,
          note: "Updated from admin dashboard.",
        }),
      });
      setPageMessage("Booking status updated successfully.");
      await mutate();
    } finally {
      setActiveAction("");
    }
  }

  async function updatePaymentStatus(paymentId: string, status: string) {
    setActiveAction(`payment:${paymentId}`);
    setPageMessage("");

    try {
      await apiRequest(`/api/v1/admin/payments/${paymentId}/status`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({
          status,
        }),
      });
      setPageMessage("Payment status updated successfully.");
      await mutate();
    } finally {
      setActiveAction("");
    }
  }

  async function resolveCustomerRequest(
    bookingId: string,
    decision: "approved" | "declined",
  ) {
    setActiveAction(`request:${bookingId}:${decision}`);
    setPageMessage("");

    try {
      await apiRequest(`/api/v1/admin/bookings/${bookingId}/customer-request`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({
          decision,
        }),
      });
      setPageMessage("Customer request updated successfully.");
      await mutate();
    } finally {
      setActiveAction("");
    }
  }

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
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {pageMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total bookings"
          value={data?.summary.totalBookings ?? 0}
          accent="bg-[#152344]"
        />
        <SummaryCard
          label="Pending"
          value={data?.summary.pendingBookings ?? 0}
          accent="bg-[#A65A2A]"
        />
        <SummaryCard
          label="Pending requests"
          value={data?.summary.pendingCustomerRequests ?? 0}
          accent="bg-[#5A2E5D]"
        />
        <SummaryCard
          label="Collected revenue"
          value={`${(data?.summary.revenueCollected ?? 0).toFixed(2)} AED`}
          accent="bg-[#37543B]"
        />
        <SummaryCard
          label="Cash due"
          value={data?.summary.cashDueBookings ?? 0}
          accent="bg-[#7A4B12]"
        />
      </div>

      <BookingCalendar bookings={data?.bookings ?? []} />

      <div className="space-y-4">
        {data?.bookings.map((booking) => {
          const firstPayment = booking.payments[0];
          const request = booking.customerRequest;
          const requestStatus = request?.status;

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
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => mutate()}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-full bg-[#152344] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
                  >
                    Logout
                  </button>
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
                            <p>
                              Type: {formatStatusLabel(request.type)}
                            </p>
                            <p>
                              Status: {formatStatusLabel(request.status)}
                            </p>
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
                        <p>{booking.schedule.date} at {booking.schedule.timeSlot}</p>
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
        })}
      </div>
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
            collection, and user history.
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdf9f1_0%,#f7f2ea_40%,#eef3f9_100%)] px-4 py-12">
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

        <DashboardContent
          session={session}
          onLogout={() => {
            clearAdminSession();
            setSession(null);
          }}
        />
      </div>
    </main>
  );
}
