"use client";

import { useState, useCallback, useRef } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { StaffBooking } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { BottomSheet } from "@/components/BottomSheet";
import { format, isToday, isTomorrow } from "date-fns";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  cash_due: "Cash Due",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const PAYMENT_STATUS_ACTIONS: Record<string, { label: string; nextStatus: string; color: string }[]> = {
  cash_due: [{ label: "Mark as Paid", nextStatus: "paid", color: "bg-emerald-600 hover:bg-emerald-700" }],
  pending: [{ label: "Mark as Paid", nextStatus: "paid", color: "bg-emerald-600 hover:bg-emerald-700" }],
};

function formatDateLabel(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  if (isToday(date)) return `Today, ${format(date, "d MMM")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "d MMM")}`;
  return format(date, "d MMM yyyy");
}

export default function BookingDetailPage() {
  const params = useParams();
  const date = params.date as string;
  const bookingId = params.bookingId as string;
  const { session } = useAuth();
  const router = useRouter();
  const returnLinkRef = useRef<HTMLAnchorElement>(null);

  const { data, error, isLoading, mutate } = useSWR(
    session ? ["/api/v1/staff/bookings", session.token, bookingId] : null,
    async ([path, token]) => {
      const result = await apiRequest<{ bookings: StaffBooking[] }>(path, {
        method: "GET",
        token,
      });
      return (
        Array.isArray(result.bookings)
          ? result.bookings.find((b) => b.id === bookingId)
          : null
      ) || null;
    },
    { revalidateOnFocus: true, errorRetryCount: 2 },
  );

  const [confirmAction, setConfirmAction] = useState<{
    type: "status" | "payment";
    status: string;
    label: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  const updateStatus = useCallback(
    async (status: string) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setIsUpdating(true);
      setStatusError("");

      try {
        await apiRequest(`/api/v1/staff/bookings/${bookingId}/status`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({ status }),
        });

        setConfirmAction(null);
        await mutate();
        router.replace(`/dashboard/${date}`);
      } catch (err) {
        setStatusError(
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to update status.",
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [bookingId, date, session, mutate, router],
  );

  const updatePayment = useCallback(
    async (status: string) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setIsUpdating(true);
      setStatusError("");

      try {
        await apiRequest(`/api/v1/staff/bookings/${bookingId}/payment-status`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({ status }),
        });

        setConfirmAction(null);
        await mutate();
      } catch (err) {
        setStatusError(
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to update payment status.",
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [bookingId, session, mutate],
  );

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#152344] border-t-transparent" />
      </div>
    );
  }

  if (!validDate) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#A65A2A]">
          &larr; Back to dashboard
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          Invalid date.
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          ref={returnLinkRef}
          href={`/dashboard/${date}`}
          className="inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#A65A2A]"
        >
          &larr; Back
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error instanceof Error ? error.message : "Booking not found."}
        </div>
      </div>
    );
  }

  const booking = data;
  const addressLine = [
    booking.address.building,
    booking.address.apartment,
    booking.address.location,
    booking.address.city,
  ]
    .filter(Boolean)
    .join(", ");

  const canStartJob = booking.status === "scheduled";
  const canCompleteJob = booking.status === "in_progress";
  const paymentActions = PAYMENT_STATUS_ACTIONS[booking.paymentStatus] || [];

  return (
    <div className="space-y-4 pb-8">
      <Link
        href={`/dashboard/${date}`}
        className="inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#A65A2A]"
      >
        &larr; Back to {formatDateLabel(date)}
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {booking.serviceTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Ref: {booking.bookingReference}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Date</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{booking.schedule.date}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Time</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">{booking.schedule.timeSlot}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Customer</h3>
        <p className="mt-2 text-sm font-bold text-slate-900">{booking.contactName}</p>
        {booking.contactPhone && (
          <a
            href={`tel:${booking.contactPhone}`}
            className="mt-1 inline-flex text-sm font-medium text-[#A65A2A] hover:underline"
          >
            {booking.contactPhone}
          </a>
        )}
        <p className="mt-0.5 text-sm text-slate-600">{booking.contactEmail}</p>

        <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Address</h3>
        <p className="mt-2 text-sm text-slate-900">{addressLine}</p>
      </div>

      {booking.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Customer Notes</h3>
          <p className="mt-2 text-sm text-slate-700">{booking.notes}</p>
        </div>
      )}

      {statusError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{statusError}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Payment</h3>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {booking.totalAmount.toFixed(2)} {booking.currency}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{booking.paymentMethod === "cash" ? "Cash" : "Online"}</p>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] mt-1 ${
              booking.paymentStatus === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : booking.paymentStatus === "cash_due"
                  ? "bg-amber-100 text-amber-700"
                  : booking.paymentStatus === "pending"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
            }`}>
              {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {canStartJob && (
          <button
            type="button"
            onClick={() => setConfirmAction({ type: "status", status: "in_progress", label: "Start Job" })}
            className="w-full rounded-2xl bg-amber-500 px-4 py-4 text-base font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.98]"
          >
            Start Job
          </button>
        )}
        {canCompleteJob && (
          <button
            type="button"
            onClick={() => setConfirmAction({ type: "status", status: "completed", label: "Complete Job" })}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-4 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Complete Job
          </button>
        )}
        {paymentActions.map((action) => (
          <button
            key={action.nextStatus}
            type="button"
            onClick={() => setConfirmAction({ type: "payment", status: action.nextStatus, label: action.label })}
            className={`w-full rounded-2xl px-4 py-4 text-base font-bold text-white shadow-sm transition active:scale-[0.98] ${action.color}`}
          >
            {action.label}
          </button>
        ))}
        {!canStartJob && !canCompleteJob && paymentActions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
            No actions available for this booking.
          </div>
        )}
      </div>

      {booking.statusHistory && booking.statusHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Timeline</h3>
          <div className="mt-3 space-y-2">
            {[...booking.statusHistory].reverse().map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 border-l-2 border-slate-200 pl-3">
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    {entry.toStatus === "in_progress" ? "Started" : entry.toStatus === "completed" ? "Completed" : entry.toStatus.replace(/_/g, " ")}
                  </p>
                  {entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}
                  <p className="text-[10px] text-slate-400">
                    {new Date(entry.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomSheet
        open={confirmAction !== null}
        title={confirmAction?.label || ""}
        message={
          confirmAction?.type === "payment"
            ? `Mark payment as "${confirmAction.label}" for this booking?`
            : `Are you sure you want to mark this booking as "${confirmAction?.label}"?`
        }
        confirmLabel={`Yes, ${confirmAction?.label || ""}`}
        onConfirm={() => {
          if (confirmAction) {
            setConfirmAction(null);
            if (confirmAction.type === "payment") {
              updatePayment(confirmAction.status);
            } else {
              updateStatus(confirmAction.status);
            }
          }
        }}
        onCancel={() => setConfirmAction(null)}
        loading={isUpdating}
        variant="default"
      />
    </div>
  );
}
