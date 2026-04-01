"use client";

import Link from "next/link";
import {
  accountSectionLinks,
  type AccountOverviewStats,
  type AccountSectionId,
  shellCardClass,
} from "./account-shared";

export function AccountSidebar({
  activeSection,
  summary,
}: {
  activeSection: AccountSectionId;
  summary: AccountOverviewStats;
}) {
  return (
    <aside className={`${shellCardClass} h-fit p-4 xl:sticky xl:top-24`}>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Overview
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-1 xl:gap-3">
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Total orders</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {summary.total}
            </span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Active orders</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {summary.active}
            </span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Saved addresses</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
              {summary.savedAddresses}
            </span>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-700 xl:flex xl:items-center xl:justify-between xl:bg-transparent xl:px-0 xl:py-0">
            <span>Pending requests</span>
            <span className="mt-1 block font-semibold text-slate-900 xl:mt-0">
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

      <nav className="mt-3 grid gap-2 md:grid-cols-2 xl:block xl:space-y-2">
        {accountSectionLinks.map((item, index) => (
          <Link
            key={item.id}
            href={`/account/${item.id}`}
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
          </Link>
        ))}
      </nav>
    </aside>
  );
}
