"use client";

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
    <section className={`${shellCardClass} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-fuchsia-700">
            Saved addresses
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Faster repeat booking
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Save home or office locations so future bookings are quicker.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
        >
          Add address
        </button>
      </div>

      {showAddressForm ? (
        <div className="mt-6 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {editingAddressId ? "Edit address" : "New address"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep one clean address saved so checkout is faster next time.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Label</span>
              <input
                value={form.label}
                onChange={(event) => onChange("label", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Home, Office, Villa..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">City</span>
              <input
                value={form.city}
                onChange={(event) => onChange("city", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Dubai"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Area / location
              </span>
              <input
                value={form.location}
                onChange={(event) => onChange("location", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Dubai Marina"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Building / villa
              </span>
              <input
                value={form.building}
                onChange={(event) => onChange("building", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="Tower name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Apartment / unit
              </span>
              <input
                value={form.apartment}
                onChange={(event) => onChange("apartment", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="1204"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-semibold text-slate-700">
                Map link
              </span>
              <input
                value={form.mapLink}
                onChange={(event) => onChange("mapLink", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-50"
                placeholder="https://www.google.com/maps?q=..."
              />
            </label>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Checkbox
              checked={Boolean(form.isDefault)}
              onCheckedChange={(checked) =>
                onChange("isDefault", checked === true)
              }
            />
            <span className="pt-0.5 text-sm font-medium leading-6 text-slate-700">
              Make this my default address
            </span>
          </label>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={activeMutation === "save-address"}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#7B2D8B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#632271] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {activeMutation === "save-address"
                ? "Saving address..."
                : editingAddressId
                  ? "Update address"
                  : "Save address"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {addresses.length ? (
        <div className="mt-6 space-y-4">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-slate-900">
                      {address.label}
                    </p>
                    {address.isDefault && (
                      <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {formatAddressLine(address)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onEdit(address)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(address.id)}
                    disabled={activeMutation === `delete-address:${address.id}`}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {activeMutation === `delete-address:${address.id}`
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!showAddressForm && addresses.length ? (
        <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Address book looks good.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Select any saved address to edit it, or add a new location when you
            need one.
          </p>
        </div>
      ) : null}

    </section>
  );
}
