import type { StaffBooking } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

interface StaffBookingCardProps {
  booking: StaffBooking;
  onClick: () => void;
}

const PAYMENT_COLORS: Record<string, string> = {
  cash_due: "bg-amber-100 text-amber-700",
  pending: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-600",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_due: "Cash",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export function StaffBookingCard({ booking, onClick }: StaffBookingCardProps) {
  const addressLine = [
    booking.address.building,
    booking.address.apartment,
    booking.address.location,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            {booking.serviceTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {booking.contactName}
          </p>
          {addressLine && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {addressLine}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={booking.status} />
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${PAYMENT_COLORS[booking.paymentStatus] || "bg-slate-100 text-slate-600"}`}>
            {PAYMENT_LABELS[booking.paymentStatus] || booking.paymentStatus}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">
          {booking.schedule.timeSlot}
        </span>
        <span>{booking.totalAmount.toFixed(2)} {booking.currency}</span>
        <span className="ml-auto">Ref: {booking.bookingReference}</span>
      </div>
    </button>
  );
}
