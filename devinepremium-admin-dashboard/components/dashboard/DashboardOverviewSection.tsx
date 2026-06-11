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
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          }
        />
        <SummaryCard
          label="Pending requests"
          value={pendingRequests}
          accent="bg-[#A65A2A]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
        />
        <SummaryCard
          label="Active staff"
          value={activeStaffCount}
          accent="bg-[#37543B]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }
        />
        <SummaryCard
          label="Payment follow-up"
          value={paymentFollowUpCount}
          accent="bg-[#5A2E5D]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          }
        />
        <SummaryCard
          label="Coverage gaps"
          value={coverageGapCount}
          accent="bg-[#7A4B12]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Pending bookings
            </p>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {pendingBookings}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Bookings still waiting for a next operational step.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Completed bookings
            </p>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {completedBookings}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Completed services now recorded in customer history.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Revenue collected
            </p>
          </div>
          <p className="text-3xl font-black text-slate-900">
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
