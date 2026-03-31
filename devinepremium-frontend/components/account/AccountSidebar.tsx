"use client";

import {
  accountSectionLinks,
  type AccountOverviewStats,
  type AccountSectionId,
  shellCardClass,
} from "./account-shared";

export function AccountSidebar({
  activeSection,
  summary,
  onSelect,
}: {
  activeSection: AccountSectionId;
  summary: AccountOverviewStats;
  onSelect: (section: AccountSectionId) => void;
}) {
  return (
    <aside className={`${shellCardClass} h-fit p-4 lg:sticky lg:top-24`}>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Overview
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Total orders</span>
            <span className="font-semibold text-slate-900">{summary.total}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Active orders</span>
            <span className="font-semibold text-slate-900">
              {summary.active}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Saved addresses</span>
            <span className="font-semibold text-slate-900">
              {summary.savedAddresses}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>Pending requests</span>
            <span className="font-semibold text-slate-900">
              {summary.pendingRequests}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Account sections
        </p>
      </div>

      <nav className="mt-3 space-y-2">
        {accountSectionLinks.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`block w-full rounded-[24px] border px-4 py-4 text-left transition ${
              activeSection === item.id
                ? "border-cyan-100 bg-cyan-50/90 shadow-sm"
                : "border-transparent hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                  activeSection === item.id
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                0{index + 1}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    activeSection === item.id
                      ? "text-cyan-800"
                      : "text-slate-900"
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`mt-1 text-xs leading-5 ${
                    activeSection === item.id
                      ? "text-cyan-700/80"
                      : "text-slate-500"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}
