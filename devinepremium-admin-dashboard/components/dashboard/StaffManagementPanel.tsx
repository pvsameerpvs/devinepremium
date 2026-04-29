"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminDashboard } from "./AdminDashboardProvider";
import {
  type StaffAvailabilityDay,
  type StaffMember,
  STAFF_DAY_OPTIONS,
} from "@/lib/dashboard";

export interface StaffFormState {
  fullName: string;
  email: string;
  phone: string;
  availabilityDays: StaffAvailabilityDay[];
  notes: string;
  profilePhotoUrl: string;
  documentImageUrls: string[];
  isActive: boolean;
}

function formatAvailabilityLabel(day: StaffAvailabilityDay) {
  return STAFF_DAY_OPTIONS.find((option) => option.key === day)?.label ?? day;
}

function getStaffInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatAvailabilityDays(days: StaffAvailabilityDay[]) {
  return days.map((day) => formatAvailabilityLabel(day)).join(", ");
}

export function StaffManagementPanel({
  staffMembers,
}: {
  staffMembers: StaffMember[];
}) {
  const router = useRouter();
  const { toggleStaffActive, activeAction } = useAdminDashboard();

  const activeStaffCount = useMemo(
    () => staffMembers.filter((staffMember) => staffMember.isActive).length,
    [staffMembers],
  );

  function openProfile(staffMember: StaffMember) {
    router.push(
      `/dashboard/staff/profile?slug=${encodeURIComponent(staffMember.slug)}&id=${encodeURIComponent(staffMember.id)}`,
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A65A2A]">
              Staff
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Staff Directory
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              {activeStaffCount} active / {staffMembers.length} total
            </p>
            <Link
              href="/dashboard/staff/create"
              className="rounded-full bg-[#152344] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
            >
              Create staff
            </Link>
          </div>
        </div>
      </div>

      {staffMembers.length ? (
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Staff
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Available Days
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Documents
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffMembers.map((staffMember) => (
                  <tr
                    key={staffMember.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProfile(staffMember)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openProfile(staffMember);
                      }
                    }}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {staffMember.profilePhotoUrl ? (
                          <Image
                            src={staffMember.profilePhotoUrl}
                            alt={`${staffMember.fullName} profile`}
                            width={46}
                            height={46}
                            unoptimized
                            className="h-[46px] w-[46px] rounded-xl border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                            {getStaffInitials(staffMember.fullName) || "ST"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {staffMember.fullName}
                          </p>
                          <p className="text-xs text-slate-500">{staffMember.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {[staffMember.email, staffMember.phone].filter(Boolean).join(" • ") ||
                        "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStaffActive(staffMember.id, staffMember.isActive);
                          }}
                          disabled={activeAction === `toggle-staff:${staffMember.id}`}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#152344] focus:ring-offset-2 ${
                            staffMember.isActive ? "bg-emerald-500" : "bg-slate-300"
                          } ${
                            activeAction === `toggle-staff:${staffMember.id}`
                              ? "opacity-50 cursor-wait"
                              : ""
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              staffMember.isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
                            staffMember.isActive ? "text-emerald-600" : "text-slate-500"
                          }`}
                        >
                          {staffMember.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatAvailabilityDays(staffMember.availabilityDays)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {staffMember.documentImageUrls?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">No staff added yet</p>
          <p className="mt-2 text-sm text-slate-600">
            Staff rows will appear here when team members are added.
          </p>
        </div>
      )}
    </section>
  );
}
