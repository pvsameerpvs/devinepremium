"use client";

import type { PageMessage } from "@/components/dashboard/dashboard-shared";
import type { ServiceCategory } from "@/lib/services";
import { ServiceImageField } from "./ServiceImageField";
import {
  ServicePricingFields,
  serviceFieldClassName,
  serviceTextareaClassName,
} from "./ServicePricingFields";
import type { ServiceFormState } from "./serviceForm";
import { slugifyService } from "./serviceForm";

type ServiceEditorFormProps = {
  categories: ServiceCategory[];
  form: ServiceFormState;
  isSaving: boolean;
  isUploading: boolean;
  message: PageMessage | null;
  onChange: <K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) => void;
  onImageUpload: (file: File) => void;
  onSubmit: () => void;
};

export function ServiceEditorForm({
  categories,
  form,
  isSaving,
  isUploading,
  message,
  onChange,
  onImageUpload,
  onSubmit,
}: ServiceEditorFormProps) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A65A2A]">
              {form.id ? "Edit service" : "Create service"}
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              Simple service setup
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Pick one pricing mode, then enable recurring or add-ons only when needed.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save service"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-3xl border px-5 py-4 text-sm ${
              message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-6 grid gap-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              Service title
              <input
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  onChange("title", title);
                  if (!form.id) {
                    onChange("slug", slugifyService(title));
                  }
                }}
                className={serviceFieldClassName}
                placeholder="House Cleaning Services"
              />
              <p className="px-1 text-[10px] font-medium text-slate-400">
                URL Slug:{" "}
                <span className="text-slate-500">
                  {form.slug || "auto-generated"}
                </span>
              </p>
            </div>

            <ServiceImageField
              imageUrl={form.imageUrl}
              isUploading={isUploading}
              onChange={(imageUrl) => onChange("imageUrl", imageUrl)}
              onUpload={onImageUpload}
            />

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Sort order
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) => onChange("sortOrder", Number(event.target.value))}
                className={serviceFieldClassName}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Category
              <select
                value={form.categoryId}
                onChange={(event) => onChange("categoryId", event.target.value)}
                className={serviceFieldClassName}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              className={serviceTextareaClassName}
              placeholder="Short service description shown on booking pages."
            />
          </label>

          <ServicePricingFields form={form} onChange={onChange} />

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            What customer can expect, one per line
            <textarea
              value={form.expectationsText}
              onChange={(event) => onChange("expectationsText", event.target.value)}
              className={serviceTextareaClassName}
              placeholder={"Dusting and wiping surfaces\nFloor mopping and vacuuming"}
            />
          </label>
        </div>
      </form>
    </section>
  );
}
