import { SummaryCard } from "./SummaryCard";

export function DashboardOverviewSection({
  totalBookings,
  pendingRequests,
  activeStaffCount,
  paymentFollowUpCount,
  coverageGapCount,
  pendingBookings,
  completedBookings,
  revenueCollected,
}: {
  totalBookings: number;
  pendingRequests: number;
  activeStaffCount: number;
  paymentFollowUpCount: number;
  coverageGapCount: number;
  pendingBookings: number;
  completedBookings: number;
  revenueCollected: number;
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
          Overview
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
          Daily operations summary
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Review booking load, staffing pressure, payment collection, and the
          customer request queue before moving into detailed operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total bookings"
          value={totalBookings}
          accent="bg-[#152344]"
        />
        <SummaryCard
          label="Pending requests"
          value={pendingRequests}
          accent="bg-[#A65A2A]"
        />
        <SummaryCard
          label="Active staff"
          value={activeStaffCount}
          accent="bg-[#37543B]"
        />
        <SummaryCard
          label="Payment follow-up"
          value={paymentFollowUpCount}
          accent="bg-[#5A2E5D]"
        />
        <SummaryCard
          label="Coverage gaps"
          value={coverageGapCount}
          accent="bg-[#7A4B12]"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pending bookings
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {pendingBookings}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Bookings still waiting for a next operational step.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Completed bookings
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {completedBookings}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Completed services now recorded in customer history.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Revenue collected
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {revenueCollected.toFixed(2)} AED
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Paid booking value collected through cash and online payments.
          </p>
        </div>
      </div>
    </section>
  );
}
