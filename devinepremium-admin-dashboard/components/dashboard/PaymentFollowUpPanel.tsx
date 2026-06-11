"use client";

import { PAYMENT_STATUSES } from "@devinepremium/shared";
import { type AdminBooking, formatStatusLabel } from "@/lib/dashboard";
import { getPaymentStatusColor } from "./dashboard-shared";

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: "💵",
  online: "💳",
};

function toDisplayText(value: string) {
  return formatStatusLabel(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPaymentLabel(value: string) {
  switch (value) {
    case "cash_due": return "Cash Due";
    case "pending": return "Pending";
    case "paid": return "Paid";
    case "failed": return "Failed";
    case "refunded": return "Refunded";
    default: return toDisplayText(value);
  }
}

function formatPaidDate(paidAt: string | null | undefined) {
  if (!paidAt) return null;
  try {
    return new Date(paidAt).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return paidAt;
  }
}

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

  const cashDueCount = followUpBookings.filter((b) => b.paymentStatus === "cash_due").length;
  const pendingOnlineCount = followUpBookings.filter((b) => b.paymentStatus === "pending").length;

  function renderPricingLineItems(booking: AdminBooking) {
    if (!booking.pricing?.lineItems?.length) return null;
    return (
      <div className="mt-2 space-y-0.5">
        {booking.pricing.lineItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
            <span className="font-medium">{item.label}</span>
            <span className="text-slate-400">
              {item.amount.toFixed(2)} {booking.currency}
            </span>
          </div>
        ))}
      </div>
    );
  }

  function renderBookingCard(booking: AdminBooking, showStatusUpdate: boolean) {
    const paidPayment = booking.payments.find((p) => p.status === "paid");
    const paidDate = paidPayment ? formatPaidDate(paidPayment.paidAt) : null;

    return (
      <article
        key={booking.id}
        className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-[0.2em]">{booking.bookingReference}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{booking.schedule.date}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{booking.schedule.timeSlot}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {booking.contactName}
            </h3>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{booking.serviceTitle}</p>

            {renderPricingLineItems(booking)}

            {booking.address && (
              <p className="mt-1.5 text-xs text-slate-400">
                {[booking.address.building, booking.address.apartment, booking.address.location, booking.address.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-slate-900">
                {booking.totalAmount.toFixed(2)} {booking.currency}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{booking.contactEmail}</span>
              {paidDate && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-emerald-600 font-medium">
                    Paid {paidDate}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${getPaymentStatusColor(booking.paymentStatus)}`}>
                {getPaymentLabel(booking.paymentStatus)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200">
                {PAYMENT_METHOD_ICONS[booking.paymentMethod] || ""} {toDisplayText(booking.paymentMethod)}
              </span>
            </div>
            {paidPayment?.receiptUrl && (
              <a
                href={paidPayment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#A65A2A] hover:underline font-semibold"
              >
                View receipt ↗
              </a>
            )}
          </div>
        </div>

        {showStatusUpdate && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-slate-100">
            {booking.payments[0] ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">Update payment:</span>
                <select
                  value={booking.paymentStatus}
                  onChange={(event) =>
                    void onUpdatePaymentStatus(booking.payments[0].id, event.target.value)
                  }
                  disabled={activeAction === `payment:${booking.payments[0].id}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getPaymentLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No payment record yet.</p>
            )}
            {booking.assignedStaff && (
              <span className="text-xs text-slate-400">
                Staff: {booking.assignedStaff.fullName}
              </span>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <section className="space-y-8">
      {/* Follow-up Needed Section */}
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
              Track unpaid bookings and update payment status as cash or online payments arrive.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {cashDueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-700 border border-fuchsia-200">
                <span className="text-base">💵</span>
                {cashDueCount} cash due
              </span>
            )}
            {pendingOnlineCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200">
                <span className="text-base">⏳</span>
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
          {followUpBookings.length ? (
            followUpBookings.slice(0, 12).map((booking) => renderBookingCard(booking, true))
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-5 border border-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <p className="text-lg font-bold text-slate-900">
                No payment follow-up needed
              </p>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                All bookings are fully paid. When new unpaid bookings arrive, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History Section */}
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
                  {paidBookings.length} booking{paidBookings.length !== 1 ? "s" : ""} fully paid.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {paidBookings.slice(0, 20).map((booking) => renderBookingCard(booking, false))}
            {paidBookings.length > 20 && (
              <p className="text-center text-sm text-slate-400 py-4">
                Showing 20 of {paidBookings.length} paid bookings.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
