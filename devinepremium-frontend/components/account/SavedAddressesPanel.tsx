"use client";

import { MapPin, Plus, Edit2, Trash2, ShieldCheck, Globe, Building2, Home, Navigation } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { SavedAddressRecord } from "@/lib/account";
import {
  formatAddressLine,
  shellCardClass,
  type AddressFormState,
} from "./account-shared";

export function SavedAddressesPanel({
  addresses,
  form,
  editingAddressId,
  activeMutation,
  onChange,
  onCreate,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
}: {
  addresses: SavedAddressRecord[];
  form: AddressFormState;
  editingAddressId: string | null;
  activeMutation: string;
  onChange: (field: keyof AddressFormState, value: string | boolean) => void;
  onCreate: () => void;
  onEdit: (address: SavedAddressRecord) => void;
  onDelete: (addressId: string) => Promise<void>;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}) {
  const showAddressForm = editingAddressId !== null || !addresses.length;

  return (
    <section className={`${shellCardClass} overflow-hidden`}>
      {/* Header */}
      <div className="relative border-b border-slate-100 bg-slate-50/50 px-6 py-8 sm:px-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full bg-fuchsia-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-fuchsia-700 ring-1 ring-inset ring-fuchsia-700/10">
              Address Book
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Saved Locations
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
              Manage your service destinations for effortless bookings and precision dispatch.
            </p>
          </div>

          {!showAddressForm && (
            <button
              type="button"
              onClick={onCreate}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Add New Address
            </button>
          )}
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <MapPin className="h-32 w-32" />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {showAddressForm ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-5 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                {editingAddressId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  {editingAddressId ? "Modify Location" : "New Service Destination"}
                </h4>
                <p className="text-xs font-medium text-slate-400">Complete the details below for accurate service delivery.</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Address Label</span>
                <input
                  value={form.label}
                  onChange={(event) => onChange("label", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-50/50"
                  placeholder="e.g. Home, Marina Office, Penthouse..."
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">City</span>
                <input
                  value={form.city}
                  onChange={(event) => onChange("city", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-50/50"
                  placeholder="Dubai"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Area / Location</span>
                <input
                  value={form.location}
                  onChange={(event) => onChange("location", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-50/50"
                  placeholder="e.g. Palm Jumeirah"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Building / Villa</span>
                <input
                  value={form.building}
                  onChange={(event) => onChange("building", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-50/50"
                  placeholder="Building name"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Apartment / Unit</span>
                <input
                  value={form.apartment}
                  onChange={(event) => onChange("apartment", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-50/50"
                  placeholder="1001"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Map URL (Optional)</span>
                <input
                  value={form.mapLink}
                  onChange={(event) => onChange("mapLink", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-50/50"
                  placeholder="Google Maps link for easier navigation"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <Checkbox
                id="isDefault"
                checked={Boolean(form.isDefault)}
                onCheckedChange={(checked) =>
                  onChange("isDefault", checked === true)
                }
                className="data-[state=checked]:bg-fuchsia-600 data-[state=checked]:border-fuchsia-600"
              />
              <label htmlFor="isDefault" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">
                Set as my primary service address
              </label>
            </div>

            <div className="mt-10 flex flex-col gap-3 pt-6 border-t border-slate-50 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-full px-7 py-4 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={activeMutation === "save-address"}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl shadow-slate-900/10"
              >
                {activeMutation === "save-address" ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {editingAddressId ? "Update Location" : "Secure Address"}
                    <Navigation className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="group relative rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-fuchsia-50 group-hover:text-fuchsia-600 transition-colors">
                    {address.label.toLowerCase().includes('home') ? <Home className="h-6 w-6" /> : 
                     address.label.toLowerCase().includes('office') ? <Building2 className="h-6 w-6" /> :
                     <Globe className="h-6 w-6" />}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEdit(address)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(address.id)}
                      disabled={activeMutation === `delete-address:${address.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-700 ring-1 ring-inset ring-cyan-700/10">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                    {formatAddressLine(address)}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-50">
                  <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verified Destination</span>
                </div>
              </article>
            ))}

            {/* Empty State / Add Card */}
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={onCreate}
                className="flex flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition-all hover:border-fuchsia-300 hover:bg-fuchsia-50/30 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 group-hover:bg-white group-hover:text-fuchsia-600 shadow-sm transition-all group-hover:scale-110">
                  <Plus className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500 group-hover:text-fuchsia-700">Add another location</p>
              </button>
            )}
          </div>
        )}

        {!showAddressForm && addresses.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200 mb-6">
              <MapPin className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your address book is empty</h3>
            <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs mx-auto">
              Save your frequent service locations to speed up your future bookings.
            </p>
            <button
              type="button"
              onClick={onCreate}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-xl shadow-slate-900/10"
            >
              Add Your First Address
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
