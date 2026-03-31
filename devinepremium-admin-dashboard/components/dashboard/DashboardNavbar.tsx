"use client";

import Link from "next/link";
import type { AdminSession } from "@/lib/auth";
import {
  dashboardSections,
  type DashboardSectionId,
} from "./dashboard-shared";

export function DashboardNavbar({
  activeSection,
  onLogout,
  session,
}: {
  activeSection: DashboardSectionId;
  onLogout: () => void;
  session: AdminSession;
}) {
  return (
    <nav className="sticky top-4 z-20 rounded-[30px] border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[220px_minmax(0,1fr)_280px] xl:items-center xl:gap-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#152344] text-sm font-black tracking-[0.2em] text-white">
            DP
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A65A2A]">
              Devine Premium
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              Admin dashboard
            </p>
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-wrap xl:justify-start xl:overflow-visible xl:px-0 xl:pb-0">
          {dashboardSections.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <Link
                key={section.id}
                href={section.href}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-[#A65A2A]/20 bg-amber-50 text-[#8A4A20]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
          <div className="min-w-0 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
            <p className="truncate font-medium">{session.user.fullName}</p>
            <p className="truncate text-xs text-slate-500">{session.user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
