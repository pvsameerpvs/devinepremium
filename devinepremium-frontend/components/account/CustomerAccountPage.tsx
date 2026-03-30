"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
  type UserSession,
} from "@/lib/auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

interface BookingStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  method: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface BookingRecord {
  id: string;
  bookingReference: string;
  serviceTitle: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  schedule: {
    date: string;
    timeSlot: string;
  };
  address: {
    city: string;
    location: string;
    building?: string;
    apartment?: string;
  };
  contactName: string;
  createdAt: string;
  statusHistory: BookingStatusHistory[];
  payments: PaymentRecord[];
}

interface BookingHistoryResponse {
  user: UserSession["user"];
  bookings: BookingRecord[];
}

function AccountContent({ session }: { session: UserSession }) {
  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/bookings/me", session.token],
    ([path, token]) =>
      apiRequest<BookingHistoryResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const summary = useMemo(() => {
    const bookings = data?.bookings ?? [];
    return {
      total: bookings.length,
      active: bookings.filter((booking) =>
        ["pending", "accepted", "scheduled", "in_progress"].includes(
          booking.status,
        ),
      ).length,
      paid: bookings.filter((booking) => booking.paymentStatus === "paid")
        .length,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        Loading your order history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-red-700">
        {error instanceof Error ? error.message : "Could not load your order history."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-[#0D0D1A] p-6 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
            Total orders
          </p>
          <p className="mt-4 text-4xl font-black">{summary.total}</p>
        </div>
        <div className="rounded-[28px] border border-cyan-100 bg-cyan-50 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-700">
            Active status
          </p>
          <p className="mt-4 text-4xl font-black text-slate-900">
            {summary.active}
          </p>
        </div>
        <div className="rounded-[28px] border border-fuchsia-100 bg-fuchsia-50 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-fuchsia-700">
            Paid orders
          </p>
          <p className="mt-4 text-4xl font-black text-slate-900">
            {summary.paid}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data?.bookings.length ? (
          data.bookings.map((booking) => (
            <article
              key={booking.id}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {booking.bookingReference}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {booking.serviceTitle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {booking.schedule.date} at {booking.schedule.timeSlot}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    {booking.status}
                  </span>
                  <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Order details
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>Total: {booking.totalAmount.toFixed(2)} AED</p>
                      <p>Payment method: {booking.paymentMethod}</p>
                      <p>Address: {booking.address.location}, {booking.address.city}</p>
                      <p>Contact: {booking.contactName}</p>
                    </div>
                  </div>

                  {booking.paymentMethod === "online" &&
                    booking.paymentStatus !== "paid" && (
                      <Link
                        href={`/payment/checkout?paymentId=${booking.payments[0]?.id ?? ""}`}
                        className="inline-flex rounded-full bg-[#7B2D8B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#632271]"
                      >
                        Continue payment
                      </Link>
                    )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">
                        Order timeline
                      </p>
                      <button
                        type="button"
                        onClick={() => mutate()}
                        className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
                      >
                        Refresh
                      </button>
                    </div>
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
                          No updates available yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
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
      </div>
    </div>
  );
}

export function CustomerAccountPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getStoredUserSession());
    setIsReady(true);
  }, []);

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
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] bg-white px-6 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700">
              Customer account
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Welcome back, {session.user.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {session.user.email}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Order history, live status, and payment tracking in one place.
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

        <AccountContent session={session} />
      </div>
    </main>
  );
}
