"use client";

import { shellCardClass, type ProfileFormState } from "./account-shared";

export function ProfilePanel({
  form,
  onChange,
  onSave,
  isSaving,
}: {
  form: ProfileFormState;
  onChange: (field: keyof ProfileFormState, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}) {
  return (
    <section className={`${shellCardClass} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            My profile
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            Personal details
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep your customer details ready for faster booking.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:max-w-[260px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Booking account
          </p>
          <p className="mt-1 text-sm text-slate-700">
            These details appear during checkout.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            value={form.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            placeholder="Your full name"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
            placeholder="+971..."
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Email
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Your email is linked to your login account.
        </p>
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-medium text-slate-700">
          Default booking note
        </span>
        <textarea
          value={form.defaultInstructions}
          onChange={(event) =>
            onChange("defaultInstructions", event.target.value)
          }
          className="min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
          placeholder="Gate code, parking note, access details..."
        />
      </label>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          These details will be used for faster repeat booking.
        </p>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#00B4D8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0097b7] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </section>
  );
}
