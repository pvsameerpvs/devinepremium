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
      className={`${shellCardClass} relative overflow-hidden px-5 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12`}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,180,216,0.08),transparent_50%)]" />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl min-w-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-700 ring-1 ring-inset ring-cyan-700/10">
              Verified Client
            </span>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-xs font-medium text-slate-500">
              {session.user.email}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Welcome back, <span className="text-cyan-600">{session.user.fullName.split(' ')[0]}</span>
          </h1>
          
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Your personal dashboard for managing luxury services, tracking bookings, 
            and managing your saved preferences.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-4 py-2 border border-slate-100 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Account Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
          <Link
            href="/#services"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 sm:w-auto"
          >
            New Booking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] sm:w-auto"
          >
            Sign Out
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
