"use client";

import type { AdminSession } from "@/lib/auth";
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="rounded-full bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
            {session.user.email}
          </div>
          <div className="rounded-full bg-amber-50 px-4 py-3 text-sm font-semibold text-[#8A4A20]">
            Admin operations center
          </div>
        </div>
      </div>
    </section>
  );
}
