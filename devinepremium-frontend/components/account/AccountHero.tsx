"use client";

import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import type { UserSession } from "@/lib/auth";
import { shellCardClass } from "./account-shared";

export function AccountHero({
  session,
  onLogout,
}: {
  session: UserSession;
  onLogout: () => Promise<void>;
}) {
  return (
    <section
      className={`${shellCardClass} relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8`}
    >
      <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.14),transparent_62%)] lg:block" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">
            Customer account
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-[2.6rem]">
            Welcome back, {session.user.fullName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Manage your saved details, reuse addresses quickly, and follow every
            booking status from one clean account space.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {session.user.email}
            </span>
            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
              Bookings and payment updates
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href="/#services"
            className="inline-flex items-center justify-center gap-2 rounded-full dp-btn-primary px-5 py-3 text-sm font-semibold shadow-[0_18px_40px_rgba(0,180,216,0.18)]"
          >
            Book another service
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Logout
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
