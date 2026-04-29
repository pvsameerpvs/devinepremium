"use client";

import Link from "next/link";
import type { BookingRecord, PaymentRecord } from "@/lib/account";
import { formatStatusLabel, shellCardClass } from "./account-shared";

interface PaymentHistoryItem extends PaymentRecord {
  bookingReference: string;
  serviceTitle: string;
}

function toDisplayText(value?: string | null) {
  return value
    ? formatStatusLabel(value).replace(/\b\w/g, (char) => char.toUpperCase())
    : "Not available";
}

function getPaymentTone(status: string) {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "failed" || status === "refunded") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "cash_due") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-cyan-200 bg-cyan-50 text-cyan-700";
}

function collectPayments(bookings: BookingRecord[]) {
  return bookings
    .flatMap((booking) =>
      (booking.payments ?? []).map((payment) => ({
        ...payment,
        bookingReference: booking.bookingReference,
        serviceTitle: booking.serviceTitle,
      })),
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function PaymentHistoryPanel({
  bookings,
}: {
  bookings: BookingRecord[];
}) {
  const payments = collectPayments(bookings);
  const paidTotal = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amount, 0);
  const pendingCount = payments.filter(
    (payment) =>
      payment.method === "online" &&
      payment.status !== "paid" &&
      payment.status !== "refunded",
  ).length;

  return (
    <section className={`${shellCardClass} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Payment history
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
            Online and cash payment records
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review every booking payment, Stripe status, and receipt from your
            profile.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Paid value
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {paidTotal.toFixed(2)} AED
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Needs payment
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {payments.length ? (
          payments.map((payment: PaymentHistoryItem) => (
            <article
              key={payment.id}
              className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getPaymentTone(payment.status)}`}
                    >
                      {toDisplayText(payment.status)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {toDisplayText(payment.method)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    {payment.serviceTitle}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {payment.bookingReference}
                    {payment.checkoutReference
                      ? ` - ${payment.checkoutReference}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Created{" "}
                    {new Date(payment.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {payment.paidAt
                      ? ` - Paid ${new Date(payment.paidAt).toLocaleDateString()}`
                      : ""}
                  </p>
                  {payment.failureReason && (
                    <p className="mt-3 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-red-700">
                      {payment.failureReason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                  <p className="text-2xl font-black text-slate-900">
                    {payment.amount.toFixed(2)} {payment.currency || "AED"}
                  </p>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {payment.method === "online" &&
                      payment.status !== "paid" &&
                      payment.status !== "refunded" && (
                      <Link
                        href={`/payment/checkout?paymentId=${payment.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-[#7B2D8B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#632271]"
                      >
                        Continue payment
                      </Link>
                    )}
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        Receipt
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            No payment records yet. Your payment history will appear here after
            your first booking.
          </div>
        )}
      </div>
    </section>
  );
}
