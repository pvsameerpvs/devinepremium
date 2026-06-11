"use client";

import type { AdminBooking } from "@/lib/dashboard";
import { PaymentBookingCard } from "./PaymentBookingCard";

export function PaymentFollowUpPanel({
  bookings,
  activeAction,
  onUpdatePaymentStatus,
}: {
  bookings: AdminBooking[];
  activeAction: string;
  onUpdatePaymentStatus: (paymentId: string, status: string) => Promise<void>;
}) {
  const followUpBookings = bookings
    .filter((booking) => booking.paymentStatus !== "paid")
    .sort((a, b) => a.schedule.date.localeCompare(b.schedule.date));

  const paidBookings = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .sort((a, b) => {
      const aPaid = a.payments.find((p) => p.status === "paid")?.paidAt;
      const bPaid = b.payments.find((p) => p.status === "paid")?.paidAt;
      if (!aPaid && !bPaid) return 0;
      if (!aPaid) return 1;
      if (!bPaid) return -1;
      return bPaid.localeCompare(aPaid);
    });

  const dueAmount = followUpBookings.reduce(
    (total, booking) => total + booking.totalAmount,
    0,
  );

  const cashDueCount = followUpBookings.filter(
    (b) => b.paymentStatus === "cash_due",
  ).length;

  const pendingOnlineCount = followUpBookings.filter(
    (b) => b.paymentStatus === "pending",
  ).length;

  return (
    <section className="space-y-8">
      {/* Follow-up Needed */}
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
              Payment follow-up
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              Pending and cash collection queue
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track unpaid bookings and update payment status as cash or online
              payments arrive.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {cashDueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200 bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-700">
                <span className="text-base">&#x1F4B5;</span>
                {cashDueCount} cash due
              </span>
            )}
            {pendingOnlineCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                <span className="text-base">&#x23F3;</span>
                {pendingOnlineCount} online pending
              </span>
            )}
            {dueAmount > 0 && (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                {dueAmount.toFixed(2)} AED total due
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {followUpBookings.length > 0 ? (
            followUpBookings.slice(0, 12).map((booking) => (
              <PaymentBookingCard
                key={booking.id}
                booking={booking}
                showStatusUpdate
                activeAction={activeAction}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
              />
            ))
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-lg font-bold text-slate-900">
                No payment follow-up needed
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                All bookings are fully paid. When new unpaid bookings arrive,
                they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      {paidBookings.length > 0 && (
        <div className="space-y-5">
          <div className="border-t border-slate-200 pt-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                  Completed
                </p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">
                  Payment history
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {paidBookings.length} booking
                  {paidBookings.length !== 1 ? "s" : ""} fully paid.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {paidBookings.slice(0, 20).map((booking) => (
              <PaymentBookingCard
                key={booking.id}
                booking={booking}
                showStatusUpdate={false}
                activeAction={activeAction}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
              />
            ))}
            {paidBookings.length > 20 && (
              <p className="py-4 text-center text-sm text-slate-400">
                Showing 20 of {paidBookings.length} paid bookings.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
