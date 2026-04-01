import type { BookingRecord } from "@/lib/account";

export function OrdersSummary({ bookings }: { bookings: BookingRecord[] }) {
  const liveCount = bookings.filter((booking) =>
    ["pending", "accepted", "scheduled", "in_progress"].includes(booking.status),
  ).length;

  const paidCount = bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 transition hover:shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Total bookings
        </p>
        <p className="mt-2 text-2xl font-black text-slate-900">
          {bookings.length}
        </p>
      </div>
      <div className="rounded-[24px] border border-cyan-100 bg-cyan-50 px-5 py-4 transition hover:shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Active bookings
        </p>
        <p className="mt-2 text-2xl font-black text-cyan-900">{liveCount}</p>
      </div>
      <div className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50 px-5 py-4 transition hover:shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
          Fully paid
        </p>
        <p className="mt-2 text-2xl font-black text-fuchsia-900">{paidCount}</p>
      </div>
    </div>
  );
}
