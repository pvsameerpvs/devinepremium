"use client";

import { useMemo, useState } from "react";
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
  isActive: boolean;
}

const emptyForm: StaffFormState = {
  fullName: "",
  email: "",
  phone: "",
  availabilityDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  notes: "",
  isActive: true,
};

function formatAvailabilityLabel(day: StaffAvailabilityDay) {
  return STAFF_DAY_OPTIONS.find((option) => option.key === day)?.label ?? day;
}

export function StaffManagementPanel({
  staffMembers,
  activeAction,
  onCreateStaff,
  onUpdateStaff,
}: {
  staffMembers: StaffMember[];
  activeAction: string;
  onCreateStaff: (input: StaffFormState) => Promise<boolean>;
  onUpdateStaff: (staffId: string, input: StaffFormState) => Promise<boolean>;
}) {
  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const activeStaffCount = useMemo(
    () => staffMembers.filter((staffMember) => staffMember.isActive).length,
    [staffMembers],
  );

  function resetForm() {
    setForm(emptyForm);
    setEditingStaffId(null);
  }

  function openEdit(staffMember: StaffMember) {
    setEditingStaffId(staffMember.id);
    setForm({
      fullName: staffMember.fullName,
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      availabilityDays: staffMember.availabilityDays,
      notes: staffMember.notes || "",
      isActive: staffMember.isActive,
    });
  }

  function toggleDay(day: StaffAvailabilityDay) {
    setForm((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((item) => item !== day)
        : [...prev.availabilityDays, day],
    }));
  }

  async function submitForm() {
    const didSave = editingStaffId
      ? await onUpdateStaff(editingStaffId, form)
      : await onCreateStaff(form);

    if (didSave) {
      resetForm();
    }
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Staff assignment
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Team availability and booking coverage
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Add your team once, set working days, and assign only available staff
            to each booking.
          </p>
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {activeStaffCount} active staff members
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {staffMembers.length ? (
            staffMembers.map((staffMember) => (
              <article
                key={staffMember.id}
                className={`rounded-[24px] border p-5 ${
                  staffMember.isActive
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-slate-100 opacity-75"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {staffMember.fullName}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          staffMember.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {staffMember.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {(staffMember.email || staffMember.phone) && (
                      <p className="mt-2 text-sm text-slate-600">
                        {[staffMember.email, staffMember.phone]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                    {staffMember.notes && (
                      <p className="mt-2 text-sm text-slate-500">
                        {staffMember.notes}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(staffMember)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {staffMember.availabilityDays.map((day) => (
                    <span
                      key={day}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700"
                    >
                      {formatAvailabilityLabel(day)}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-lg font-semibold text-slate-900">
                No staff added yet
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Add your team here so bookings can be assigned by available day.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {editingStaffId ? "Edit staff member" : "Add staff member"}
            </p>
            {editingStaffId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <input
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                placeholder="Staff member name"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                  placeholder="staff@devinepremium.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                  placeholder="+971..."
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Available days</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STAFF_DAY_OPTIONS.map((day) => {
                  const isSelected = form.availabilityDays.includes(day.key);

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-[#A65A2A] bg-amber-50 text-[#A65A2A]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                placeholder="Shift details, special skills, area coverage..."
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Staff member is active and assignable
              </span>
            </label>

            <button
              type="button"
              onClick={() => void submitForm()}
              disabled={activeAction === "create-staff" || activeAction === `update-staff:${editingStaffId}`}
              className="inline-flex justify-center rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {activeAction === "create-staff" || activeAction === `update-staff:${editingStaffId}`
                ? "Saving..."
                : editingStaffId
                  ? "Update staff member"
                  : "Add staff member"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
