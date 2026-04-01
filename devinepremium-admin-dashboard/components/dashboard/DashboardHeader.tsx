"use client";

import Link from "next/link";

import type { AdminSession } from "@/lib/auth";
import { useAdminDashboard } from "./AdminDashboardProvider";
import {
  dashboardSections,
  type DashboardSectionId,
} from "./dashboard-shared";

export function DashboardHeader({
  activeSection,
  session,
}: {
  activeSection: DashboardSectionId;
  session: AdminSession;
}) {
  const { summary } = useAdminDashboard();
  const pendingCount = summary.pendingBookings;

  const sectionMeta =
    dashboardSections.find((section) => section.id === activeSection) ??
    dashboardSections[0];

  return (
    <section className="rounded-[34px] border border-slate-200 bg-white px-5 py-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A65A2A]">
            {sectionMeta.label}
          </p>
          <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            Welcome back, {session.user.fullName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {sectionMeta.description}. Use the sidebar and top navigation to move
            through bookings, payments, staffing, and daily operations.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/dashboard/operations" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm transition hover:bg-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
            {pendingCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white">
                {pendingCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Link>
          
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {session.user.email}
          </div>
          <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-[#8A4A20]">
            Admin operations center
          </div>
        </div>
      </div>
    </section>
  );
}
