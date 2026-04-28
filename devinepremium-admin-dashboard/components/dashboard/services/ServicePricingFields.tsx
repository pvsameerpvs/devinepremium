"use client";

import type { ServiceFormState } from "./serviceForm";
import { servicePricingModes } from "./serviceForm";

export const serviceFieldClassName =
  "h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-100";

export const serviceTextareaClassName =
  "min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-100";

type ServicePricingFieldsProps = {
  form: ServiceFormState;
  onChange: <K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) => void;
};

export function ServicePricingFields({
  form,
  onChange,
}: ServicePricingFieldsProps) {
  return (
    <>
      <div className="grid gap-3">
        <p className="text-sm font-semibold text-slate-700">Pricing mode</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {servicePricingModes.map((mode) => {
            const isActive = form.pricingMode === mode.value;

            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => onChange("pricingMode", mode.value)}
                className={`rounded-[22px] border p-4 text-left transition ${
                  isActive
                    ? "border-[#A65A2A]/30 bg-amber-50 text-[#8A4A20]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-bold">{mode.label}</p>
                <p className="mt-2 text-xs leading-5">{mode.help}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Display base price
            <input
              type="number"
              value={form.basePrice}
              onChange={(event) => onChange("basePrice", Number(event.target.value))}
              className={serviceFieldClassName}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Price label
            <input
              value={form.priceUnit}
              onChange={(event) => onChange("priceUnit", event.target.value)}
              className={serviceFieldClassName}
              placeholder="starting from"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => onChange("isActive", event.target.checked)}
              className="h-4 w-4 accent-[#A65A2A]"
            />
            Show on website
          </label>
        </div>

        {form.pricingMode === "hourly" && (
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Hourly rate
              <input
                type="number"
                value={form.hourlyRate}
                onChange={(event) => onChange("hourlyRate", Number(event.target.value))}
                className={serviceFieldClassName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Default hours
              <input
                type="number"
                value={form.defaultHours}
                onChange={(event) => onChange("defaultHours", Number(event.target.value))}
                className={serviceFieldClassName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Minimum hours
              <input
                type="number"
                value={form.minHours}
                onChange={(event) => onChange("minHours", Number(event.target.value))}
                className={serviceFieldClassName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Default staff
              <input
                type="number"
                value={form.defaultStaffCount}
                onChange={(event) =>
                  onChange("defaultStaffCount", Number(event.target.value))
                }
                className={serviceFieldClassName}
              />
            </label>
          </div>
        )}

        {form.pricingMode === "package" && (
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Packages, one per line
            <textarea
              value={form.packagesText}
              onChange={(event) => onChange("packagesText", event.target.value)}
              className={serviceTextareaClassName}
              placeholder={"Studio Apartment=699\n1 BHK Apartment=899"}
            />
          </label>
        )}

        {(form.pricingMode === "quantity" || form.pricingMode === "package") && (
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Quantity items, one per line
            <textarea
              value={form.quantityText}
              onChange={(event) => onChange("quantityText", event.target.value)}
              className={serviceTextareaClassName}
              placeholder={"Single Seater=50\n2 Seater=100"}
            />
          </label>
        )}

        {form.pricingMode === "area" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Rate per SQM
              <input
                type="number"
                value={form.areaRate}
                onChange={(event) => onChange("areaRate", Number(event.target.value))}
                className={serviceFieldClassName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Default SQM
              <input
                type="number"
                value={form.defaultArea}
                onChange={(event) => onChange("defaultArea", Number(event.target.value))}
                className={serviceFieldClassName}
              />
            </label>
          </div>
        )}

        {form.pricingMode === "quote" && (
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Starting estimate
            <input
              type="number"
              value={form.quoteStartingFrom}
              onChange={(event) =>
                onChange("quoteStartingFrom", Number(event.target.value))
              }
              className={serviceFieldClassName}
            />
          </label>
        )}

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.recurringEnabled}
              onChange={(event) => onChange("recurringEnabled", event.target.checked)}
              className="h-4 w-4 accent-[#A65A2A]"
            />
            Enable weekly/monthly
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Add-ons, one per line
            <textarea
              value={form.addOnsText}
              onChange={(event) => onChange("addOnsText", event.target.value)}
              className={serviceTextareaClassName}
              placeholder={"Cleaning supplies=10\nDoor painting=500"}
            />
          </label>
        </div>
      </div>
    </>
  );
}
