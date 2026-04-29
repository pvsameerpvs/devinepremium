"use client";

import { User, Phone, Mail, FileText, Save } from "lucide-react";
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
    <section className={`${shellCardClass} overflow-hidden`}>
      <div className="relative border-b border-slate-100 bg-slate-50/50 px-6 py-8 sm:px-8">
        <div className="relative z-10">
          <span className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-700 ring-1 ring-inset ring-cyan-700/10">
            Account Management
          </span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Personal Profile
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Customize your identity and booking preferences for a tailored service experience.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <User className="h-32 w-32" />
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Basic Info Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</span>
            </div>
            <input
              value={form.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50/50 shadow-sm"
              placeholder="e.g. Sameer PV"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
            </div>
            <input
              value={form.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50/50 shadow-sm"
              placeholder="+971 50 123 4567"
            />
          </div>
        </div>

        {/* Note Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Default Booking Note</span>
          </div>
          <textarea
            value={form.defaultInstructions}
            onChange={(event) =>
              onChange("defaultInstructions", event.target.value)
            }
            className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50/50 shadow-sm"
            placeholder="Gate codes, parking instructions, or specific preferences for our technicians..."
          />
          <p className="text-[11px] text-slate-400 italic">This note will be automatically added to all your new bookings.</p>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col gap-6 pt-6 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 border border-slate-100">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">Registered Email</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Changes managed via account settings</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={isSaving}
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-slate-900/10"
          >
            {isSaving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Save Changes
                <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
