"use client";

import { PAYMENT_STATUSES } from "@devinepremium/shared";
import type { AdminBooking } from "@/lib/dashboard";
import {
  PAYMENT_METHOD_ICONS,
  toDisplayText,
  getPaymentLabel,
  getPaymentStatusColor,
  formatPaidDate,
} from "./dashboard-shared";

function PricingLineItems({ booking }: { booking: AdminBooking }) {
  if (!booking.pricing?.lineItems?.length) return null;

  return (
    <div className="mt-2 space-y-0.5">
      {booking.pricing.lineItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
          <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
          <span className="font-medium">{item.label}</span>
          <span className="text-slate-400">
            {item.amount.toFixed(2)} {booking.currency}
          </span>
        </div>
      ))}
    </div>
  );
}

function AddressLine({ booking }: { booking: AdminBooking }) {
  if (!booking.address) return null;
  const parts = [
    booking.address.building,
    booking.address.apartment,
    booking.address.location,
    booking.address.city,
  ].filter(Boolean);

  if (!parts.length) return null;

  return <p className="mt-1.5 text-xs text-slate-400">{parts.join(", ")}</p>;
}

export function PaymentBookingCard({
  booking,
  showStatusUpdate,
  activeAction,
  onUpdatePaymentStatus,
}: {
  booking: AdminBooking;
  showStatusUpdate: boolean;
  activeAction: string;
  onUpdatePaymentStatus: (paymentId: string, status: string) => Promise<void>;
}) {
  const paidPayment = booking.payments.find((p) => p.status === "paid");
  const paidDate = paidPayment ? formatPaidDate(paidPayment.paidAt) : null;
  const firstPayment = booking.payments[0];

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-[0.2em]">
              {booking.bookingReference}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{booking.schedule.date}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{booking.schedule.timeSlot}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{booking.contactName}</h3>
          <p className="mt-0.5 text-sm font-semibold text-slate-700">{booking.serviceTitle}</p>

          <PricingLineItems booking={booking} />
          <AddressLine booking={booking} />

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-slate-900">
              {booking.totalAmount.toFixed(2)} {booking.currency}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500">{booking.contactEmail}</span>
            {paidDate && (
              <>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs font-medium text-emerald-600">
                  Paid {paidDate}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${getPaymentStatusColor(booking.paymentStatus)}`}
            >
              {getPaymentLabel(booking.paymentStatus)}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {PAYMENT_METHOD_ICONS[booking.paymentMethod] ?? ""}{" "}
              {toDisplayText(booking.paymentMethod)}
            </span>
          </div>
          {paidPayment?.receiptUrl && (
            <a
              href={paidPayment.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#A65A2A] hover:underline"
            >
              View receipt &rarr;
            </a>
          )}
        </div>
      </div>

      {showStatusUpdate && (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {firstPayment ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Update payment:
              </span>
              <select
                value={booking.paymentStatus}
                onChange={(event) =>
                  void onUpdatePaymentStatus(firstPayment.id, event.target.value)
                }
                disabled={activeAction === `payment:${firstPayment.id}`}
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
