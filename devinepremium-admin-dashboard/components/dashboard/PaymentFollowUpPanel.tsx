"use client";

import { type AdminBooking, formatStatusLabel } from "@/lib/dashboard";

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

  const dueAmount = followUpBookings.reduce(
    (total, booking) => total + booking.totalAmount,
    0,
  );

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Payment follow-up
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Pending and cash collection queue
          </h2>
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {followUpBookings.length} bookings • {dueAmount.toFixed(2)} AED due
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {followUpBookings.length ? (
          followUpBookings.slice(0, 6).map((booking) => {
            const firstPayment = booking.payments[0];

            return (
              <article
                key={booking.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {booking.bookingReference}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {booking.contactName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {booking.contactEmail}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                      {formatStatusLabel(booking.paymentStatus)}
                    </span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                      {booking.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="text-sm text-slate-700">
                    <p>{booking.serviceTitle}</p>
                    <p className="mt-1">
                      {booking.schedule.date} at {booking.schedule.timeSlot}
                    </p>
                    <p className="mt-1 font-semibold">
                      Due: {booking.totalAmount.toFixed(2)} AED
                    </p>
                  </div>

                  {firstPayment ? (
                    <select
                      value={booking.paymentStatus}
                      onChange={(event) =>
                        void onUpdatePaymentStatus(firstPayment.id, event.target.value)
                      }
                      disabled={activeAction === `payment:${firstPayment.id}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                    >
                      <option value="cash_due">cash_due</option>
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="failed">failed</option>
                      <option value="refunded">refunded</option>
                    </select>
                  ) : (
                    <p className="text-sm text-slate-500">No payment record yet.</p>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No payment follow-up needed
            </p>
            <p className="mt-3 text-sm text-slate-600">
              All visible bookings are fully paid.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
