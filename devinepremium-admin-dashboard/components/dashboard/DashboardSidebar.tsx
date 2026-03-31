"use client";

import {
  dashboardSections,
  type DashboardSectionId,
  type DashboardSidebarStats,
} from "./dashboard-shared";

export function DashboardSidebar({
  activeSection,
  stats,
  onSelect,
}: {
  activeSection: DashboardSectionId;
  stats: DashboardSidebarStats;
  onSelect: (section: DashboardSectionId) => void;
}) {
  return (
    <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] xl:sticky xl:top-8">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Admin overview
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-1">
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Total bookings</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {stats.totalBookings}
            </span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Pending requests</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {stats.pendingRequests}
            </span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Active staff</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {stats.activeStaff}
            </span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Payment follow-up</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {stats.paymentFollowUp}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Dashboard pages
        </p>
      </div>

      <nav className="mt-3 grid gap-2 md:grid-cols-2 xl:block xl:space-y-2">
        {dashboardSections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`w-full rounded-[24px] border px-4 py-3.5 text-left transition ${
              activeSection === section.id
                ? "border-[#A65A2A]/20 bg-amber-50 shadow-sm"
                : "border-transparent hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                  activeSection === section.id
                    ? "bg-[#A65A2A] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                0{index + 1}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    activeSection === section.id
                      ? "text-[#8A4A20]"
                      : "text-slate-900"
                  }`}
                >
                  {section.label}
                </p>
                <p
                  className={`mt-1 text-xs leading-5 ${
                    activeSection === section.id
                      ? "text-[#8A4A20]/80"
                      : "text-slate-500"
                  }`}
                >
                  {section.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
