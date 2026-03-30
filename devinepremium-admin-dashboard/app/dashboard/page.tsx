"use client";

import { useEffect, useState } from "react";
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
  revenueCollected: number;
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
}

interface AdminDashboardResponse {
  summary: DashboardSummary;
  bookings: AdminBooking[];
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

function DashboardContent({
  session,
  onLogout,
}: {
  session: AdminSession;
  onLogout: () => void;
}) {
  const [activeAction, setActiveAction] = useState("");
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

    try {
      await apiRequest(`/api/v1/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({
          status,
          note: "Updated from admin dashboard.",
        }),
      });
      await mutate();
    } finally {
      setActiveAction("");
    }
  }

  async function updatePaymentStatus(paymentId: string, status: string) {
    setActiveAction(`payment:${paymentId}`);

    try {
      await apiRequest(`/api/v1/admin/payments/${paymentId}/status`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({
          status,
        }),
      });
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          label="Collected revenue"
          value={`${(data?.summary.revenueCollected ?? 0).toFixed(2)} AED`}
          accent="bg-[#37543B]"
        />
        <SummaryCard
          label="Cash due"
          value={data?.summary.cashDueBookings ?? 0}
          accent="bg-[#5A2E5D]"
        />
      </div>

      <div className="space-y-4">
        {data?.bookings.map((booking) => {
          const firstPayment = booking.payments[0];

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
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Booking info
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>{booking.schedule.date} at {booking.schedule.timeSlot}</p>
                        <p>
                          {booking.address.location}, {booking.address.city}
                        </p>
                        <p>Total: {booking.totalAmount.toFixed(2)} AED</p>
                        <p>Customer account: {booking.user?.email || "Guest linked by email"}</p>
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
                        defaultValue={booking.status}
                        onChange={(event) =>
                          updateBookingStatus(booking.id, event.target.value)
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
                        defaultValue={booking.paymentStatus}
                        onChange={(event) =>
                          firstPayment &&
                          updatePaymentStatus(firstPayment.id, event.target.value)
                        }
                        disabled={!firstPayment || activeAction === `payment:${firstPayment?.id}`}
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
          <a
            href="/login"
            className="mt-8 inline-flex rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
          >
            Go to admin login
          </a>
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
