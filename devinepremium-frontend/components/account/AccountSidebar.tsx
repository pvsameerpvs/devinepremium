"use client";

import Link from "next/link";
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  BellRing
} from "lucide-react";
import {
  accountSectionLinks,
  type AccountOverviewStats,
  type AccountSectionId,
  shellCardClass,
} from "./account-shared";

const sectionIcons = {
  profile: User,
  addresses: MapPin,
  orders: ShoppingBag,
};

export function AccountSidebar({
  activeSection,
  summary,
}: {
  activeSection: AccountSectionId;
  summary: AccountOverviewStats;
}) {
  return (
    <div className="flex flex-col gap-6">
      <nav className={`${shellCardClass} overflow-hidden p-3`}>
        <div className="flex flex-col gap-1">
          {accountSectionLinks.map((link) => {
            const Icon = sectionIcons[link.id];
            const isActive = activeSection === link.id;

            return (
              <Link
                key={link.id}
                href={`/account/${link.id}`}
                className={`group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-white"
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold tracking-tight">{link.label}</p>
                  <p className={`truncate text-[11px] font-medium leading-tight opacity-70 ${
                    isActive ? "text-cyan-50" : "text-slate-400"
                  }`}>
                    {link.description}
                  </p>
                </div>

                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? "text-white/50 translate-x-1" : "text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1"
                }`} />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={`${shellCardClass} p-6`}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Activity Overview</h3>
        
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <BellRing className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Active Orders</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{summary.active}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Payments</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{summary.total}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 mt-4 border border-dashed border-slate-200">
            <ShieldCheck className="h-4 w-4 text-cyan-600" />
            <p className="text-[11px] leading-tight text-slate-500 font-medium">
              Your account is secured with end-to-end encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
