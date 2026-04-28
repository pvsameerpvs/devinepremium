"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { apiRequest, getApiBaseUrl } from "@/lib/api";
import type {
  ManagedService,
  ServiceCategory,
  CategoriesResponse,
  ServiceOption,
  ServiceOptionChoice,
  ServicePricingMode,
  ServicesResponse,
} from "@/lib/services";
import { useAdminDashboard } from "../AdminDashboardProvider";

type ServiceFormState = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  pricingMode: ServicePricingMode;
  basePrice: number;
  priceUnit: string;
  expectationsText: string;
  hourlyRate: number;
  defaultHours: number;
  minHours: number;
  defaultStaffCount: number;
  recurringEnabled: boolean;
  packagesText: string;
  quantityText: string;
  areaRate: number;
  defaultArea: number;
  quoteStartingFrom: number;
  addOnsText: string;
  categoryId: string;
};

const pricingModes: Array<{ value: ServicePricingMode; label: string; help: string }> = [
  { value: "hourly", label: "Hourly", help: "Cleaning style: staff x hours" },
  { value: "package", label: "Package", help: "Painting, AC, deep cleaning" },
  { value: "quantity", label: "Quantity", help: "Sofa, carpet, mattress items" },
  { value: "area", label: "Area/SQM", help: "Commercial or texture work" },
  { value: "quote", label: "Quote", help: "Manual estimate or project work" },
];

const defaultRecurringOptions = [
  { value: "one-time", label: "One Time", visitsPerMonth: 1, discountPercent: 0 },
  { value: "weekly", label: "Once a Week", visitsPerMonth: 4, discountPercent: 5 },
  { value: "2-times-weekly", label: "Twice a Week", visitsPerMonth: 8, discountPercent: 10 },
  { value: "3-times-weekly", label: "3 Times a Week", visitsPerMonth: 12, discountPercent: 15 },
];

const EMPTY_SERVICES: ManagedService[] = [];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
}

function parsePriceLines(value: string): ServiceOptionChoice[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawLabel, rawPrice] = line.includes("=")
        ? line.split("=")
        : line.split(",");
      const label = rawLabel?.trim() || "Item";
      const price = Number(rawPrice);

      return {
        label: Number.isFinite(price) ? `${label} (${price} AED)` : label,
        value: slugify(label),
        price: Number.isFinite(price) ? price : 0,
      };
    });
}

function formatChoices(choices?: ServiceOptionChoice[]) {
  return (choices ?? [])
    .map((choice) => `${choice.label.replace(/\s*\([0-9.]+\s*AED\)$/i, "")}=${choice.price ?? 0}`)
    .join("\n");
}

function formatQuantityOptions(options: ServiceOption[]) {
  return options
    .filter((option) => option.type === "quantity" && option.price)
    .map((option) => `${option.label.replace(/\s*[-(].*$/i, "")}=${option.price ?? 0}`)
    .join("\n");
}

function createEmptyForm(): ServiceFormState {
  return {
    id: "",
    title: "",
    slug: "",
    description: "",
    imageUrl: "/hero-cleaning.jpg",
    isActive: true,
    sortOrder: 0,
    pricingMode: "package",
    basePrice: 0,
    priceUnit: "starting from",
    expectationsText: "",
    hourlyRate: 35,
    defaultHours: 4,
    minHours: 2,
    defaultStaffCount: 1,
    recurringEnabled: false,
    packagesText: "Standard Service=199",
    quantityText: "",
    areaRate: 10,
    defaultArea: 50,
    quoteStartingFrom: 1000,
    addOnsText: "",
    categoryId: "",
  };
}

function formFromService(service: ManagedService): ServiceFormState {
  const packageOption = service.options.find(
    (option) =>
      (option.type === "select" || option.type === "radio") &&
      option.id !== service.pricingConfig.recurring?.frequencyOptionId &&
      option.options?.some((choice) => choice.price),
  );
  const addOnOption = service.options.find((option) => option.type === "checkbox");
  const hourly = service.pricingConfig.hourly;
  const hoursOption = service.options.find((option) => option.id === hourly?.hoursOptionId);
  const staffOption = service.options.find((option) => option.id === hourly?.staffCountOptionId);
  const areaOption = service.pricingMode === "area"
    ? service.options.find((option) => option.type === "quantity")
    : undefined;

  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description || "",
    imageUrl: service.imageUrl || "/hero-cleaning.jpg",
    isActive: service.isActive,
    sortOrder: service.sortOrder,
    pricingMode: service.pricingMode,
    basePrice: service.basePrice,
    priceUnit: service.priceUnit || "",
    expectationsText: service.expectations.join("\n"),
    hourlyRate: hourly?.rate ?? service.basePrice ?? 35,
    defaultHours: Number(hoursOption?.defaultValue ?? 4),
    minHours: hoursOption?.min ?? 2,
    defaultStaffCount: Number(staffOption?.defaultValue ?? 1),
    recurringEnabled: Boolean(service.pricingConfig.recurring?.enabled),
    packagesText: formatChoices(packageOption?.options),
    quantityText: formatQuantityOptions(
      service.options.filter(
        (option) => option.id !== hourly?.hoursOptionId && option.id !== hourly?.staffCountOptionId,
      ),
    ),
    areaRate: areaOption?.price ?? 10,
    defaultArea: Number(areaOption?.defaultValue ?? 50),
    quoteStartingFrom: service.pricingConfig.quote?.startingFrom ?? service.basePrice ?? 1000,
    addOnsText: formatChoices(addOnOption?.options),
    categoryId: service.categoryId || "",
  };
}

function buildOptions(form: ServiceFormState): ServiceOption[] {
  const options: ServiceOption[] = [];
  const addOns = parsePriceLines(form.addOnsText);
  const packages = parsePriceLines(form.packagesText);
  const quantityItems = parsePriceLines(form.quantityText);

  if (form.recurringEnabled) {
    options.push({
      id: "frequency",
      label: "Select your booking frequency",
      type: "select",
      options: defaultRecurringOptions.map(({ label, value }) => ({ label, value })),
      defaultValue: "one-time",
    });
  }

  if (form.pricingMode === "hourly") {
    options.push(
      {
        id: "crew",
        label: `Number of staff (${form.hourlyRate} AED/hr each)`,
        type: "quantity",
        defaultValue: form.defaultStaffCount,
        min: 1,
      },
      {
        id: "hours",
        label: "Hours",
        type: "quantity",
        defaultValue: form.defaultHours,
        min: form.minHours,
      },
    );
  }

  if (form.pricingMode === "package" && packages.length) {
    options.push({
      id: "service-type",
      label: "Service Type",
      type: "select",
      options: packages,
      defaultValue: packages[0]?.value,
    });
  }

  if (form.pricingMode === "quantity" || form.pricingMode === "package") {
    quantityItems.forEach((item) => {
      options.push({
        id: item.value,
        label: item.label,
        type: "quantity",
        price: item.price,
        defaultValue: 0,
        min: 0,
      });
    });
  }

  if (form.pricingMode === "area") {
    options.push({
      id: "area-size",
      label: `Area Size (SQM) - ${form.areaRate} AED/SQM`,
      type: "quantity",
      price: form.areaRate,
      defaultValue: form.defaultArea,
      min: 1,
    });
  }

  if (addOns.length) {
    options.push({
      id: "extras",
      label: "Add-ons",
      type: "checkbox",
      options: addOns,
      defaultValue: [],
    });
  }

  return options;
}

function buildPayload(form: ServiceFormState) {
  const options = buildOptions(form);
  const basePrice =
    form.pricingMode === "hourly"
      ? form.hourlyRate
      : form.pricingMode === "area"
        ? form.areaRate
        : form.pricingMode === "quote"
          ? form.quoteStartingFrom
          : form.basePrice;

  return {
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description || null,
    imageUrl: form.imageUrl || null,
    isActive: form.isActive,
    sortOrder: form.sortOrder,
    basePrice,
    priceUnit: form.priceUnit || null,
    pricingMode: form.pricingMode,
    pricingConfig: {
      vatRate: 0.05,
      hourly:
        form.pricingMode === "hourly"
          ? {
              rate: form.hourlyRate,
              hoursOptionId: "hours",
              staffCountOptionId: "crew",
            }
          : undefined,
      recurring: form.recurringEnabled
        ? {
            enabled: true,
            frequencyOptionId: "frequency",
            options: defaultRecurringOptions,
          }
        : undefined,
      quote:
        form.pricingMode === "quote"
          ? {
              startingFrom: form.quoteStartingFrom,
            }
          : undefined,
    },
    options,
    categoryId: form.categoryId || null,
    expectations: form.expectationsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function fieldClassName() {
  return "h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-100";
}

function textareaClassName() {
  return "min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-100";
}

export function ServicesDashboardPage() {
  const { session } = useAdminDashboard();
  const [form, setForm] = useState<ServiceFormState>(createEmptyForm);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/admin/services", session.token],
    ([path, token]) =>
      apiRequest<ServicesResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const { data: catData } = useSWR(
    ["/api/v1/admin/categories", session.token],
    ([path, token]) =>
      apiRequest<CategoriesResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const categories = catData?.categories ?? [];

  const services = data?.services ?? EMPTY_SERVICES;
  const activeCount = useMemo(
    () => services.filter((service) => service.isActive).length,
    [services],
  );

  function updateForm<K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setMessage({ tone: "error", text: "Service title is required." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const payload = buildPayload(form);
      const path = form.id
        ? `/api/v1/admin/services/${form.id}`
        : "/api/v1/admin/services";

      await apiRequest(path, {
        method: form.id ? "PATCH" : "POST",
        token: session.token,
        body: JSON.stringify(payload),
      });

      await mutate();
      setMessage({
        tone: "success",
        text: form.id ? "Service updated successfully." : "Service created successfully.",
      });
      if (!form.id) {
        setForm(createEmptyForm());
      }
    } catch (saveError) {
      setMessage({
        tone: "error",
        text: saveError instanceof Error ? saveError.message : "Service save failed.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage({ tone: "error", text: "Please upload an image file." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const baseUrl = getApiBaseUrl();
      const uploadUrl = `${baseUrl}/api/v1/admin/services/upload`;
      console.log("Attempting image upload to:", uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });

      const result = await response.text();
      let payload;
      try {
        payload = JSON.parse(result);
      } catch (e) {
        console.error("Server returned non-JSON response:", result);
        throw new Error(`Server returned invalid response (Status ${response.status}). Check backend logs.`);
      }

      if (!response.ok) {
        throw new Error(payload.message || "Upload failed");
      }

      updateForm("imageUrl", payload.url);
      setMessage({ tone: "success", text: "Image uploaded successfully." });
    } catch (uploadError) {
      setMessage({
        tone: "error",
        text: uploadError instanceof Error ? uploadError.message : "Upload failed.",
      });
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(`/api/v1/admin/services/${id}`, {
        method: "DELETE",
        token: session.token,
      });

      await mutate();
      if (form.id === id) {
        setForm(createEmptyForm());
      }
      setMessage({ tone: "success", text: "Service deleted successfully." });
    } catch (deleteError) {
      setMessage({
        tone: "error",
        text: deleteError instanceof Error ? deleteError.message : "Service deletion failed.",
      });
    }
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A65A2A]">
              Service catalog
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              {activeCount} active services
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              One service list controls the website, booking page, and backend pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(createEmptyForm());
              setMessage(null);
            }}
            className="rounded-full bg-[#152344] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
          >
            New
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {isLoading && (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading services...
            </div>
          )}
          {error && (
            <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">
              Could not load services.
            </div>
          )}
          {services.map((service) => {
            const isSelected = form.id === service.id;

            return (
              <div
                key={service.id}
                onClick={() => {
                  setForm(formFromService(service));
                  setMessage(null);
                }}
                className={`group cursor-pointer rounded-[24px] border p-4 text-left transition ${
                  isSelected
                    ? "border-[#A65A2A]/30 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {service.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {service.pricingMode} pricing
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        service.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {service.isActive ? "Active" : "Hidden"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(service.id, service.title);
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-6">
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
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
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
                  updateForm("title", event.target.value);
                  if (!form.id) {
                    updateForm("slug", slugify(event.target.value));
                  }
                }}
                className={fieldClassName()}
                placeholder="House Cleaning Services"
              />
              <p className="px-1 text-[10px] font-medium text-slate-400">
                URL Slug: <span className="text-slate-500">{form.slug || "auto-generated"}</span>
              </p>
            </div>
            
            <div className="grid gap-2 text-sm font-semibold text-slate-700">
              Service Image
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">
                      No Image
                    </div>
                  )}
                </div>
                
                <label className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-slate-100 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-200">
                  {form.imageUrl ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
                
                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() => updateForm("imageUrl", "")}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Sort order
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) => updateForm("sortOrder", Number(event.target.value))}
                className={fieldClassName()}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Category
              <select
                value={form.categoryId || ""}
                onChange={(event) => updateForm("categoryId", event.target.value)}
                className={fieldClassName()}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              className={textareaClassName()}
              placeholder="Short service description shown on booking pages."
            />
          </label>

          <div className="grid gap-3">
            <p className="text-sm font-semibold text-slate-700">Pricing mode</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {pricingModes.map((mode) => {
                const isActive = form.pricingMode === mode.value;

                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => updateForm("pricingMode", mode.value)}
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
                  onChange={(event) => updateForm("basePrice", Number(event.target.value))}
                  className={fieldClassName()}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Price label
                <input
                  value={form.priceUnit}
                  onChange={(event) => updateForm("priceUnit", event.target.value)}
                  className={fieldClassName()}
                  placeholder="starting from"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateForm("isActive", event.target.checked)}
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
                    onChange={(event) => updateForm("hourlyRate", Number(event.target.value))}
                    className={fieldClassName()}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Default hours
                  <input
                    type="number"
                    value={form.defaultHours}
                    onChange={(event) => updateForm("defaultHours", Number(event.target.value))}
                    className={fieldClassName()}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Minimum hours
                  <input
                    type="number"
                    value={form.minHours}
                    onChange={(event) => updateForm("minHours", Number(event.target.value))}
                    className={fieldClassName()}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Default staff
                  <input
                    type="number"
                    value={form.defaultStaffCount}
                    onChange={(event) => updateForm("defaultStaffCount", Number(event.target.value))}
                    className={fieldClassName()}
                  />
                </label>
              </div>
            )}

            {form.pricingMode === "package" && (
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Packages, one per line
                <textarea
                  value={form.packagesText}
                  onChange={(event) => updateForm("packagesText", event.target.value)}
                  className={textareaClassName()}
                  placeholder={"Studio Apartment=699\n1 BHK Apartment=899"}
                />
              </label>
            )}

            {(form.pricingMode === "quantity" || form.pricingMode === "package") && (
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Quantity items, one per line
                <textarea
                  value={form.quantityText}
                  onChange={(event) => updateForm("quantityText", event.target.value)}
                  className={textareaClassName()}
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
                    onChange={(event) => updateForm("areaRate", Number(event.target.value))}
                    className={fieldClassName()}
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Default SQM
                  <input
                    type="number"
                    value={form.defaultArea}
                    onChange={(event) => updateForm("defaultArea", Number(event.target.value))}
                    className={fieldClassName()}
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
                  onChange={(event) => updateForm("quoteStartingFrom", Number(event.target.value))}
                  className={fieldClassName()}
                />
              </label>
            )}

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.recurringEnabled}
                  onChange={(event) => updateForm("recurringEnabled", event.target.checked)}
                  className="h-4 w-4 accent-[#A65A2A]"
                />
                Enable weekly/monthly
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Add-ons, one per line
                <textarea
                  value={form.addOnsText}
                  onChange={(event) => updateForm("addOnsText", event.target.value)}
                  className={textareaClassName()}
                  placeholder={"Cleaning supplies=10\nDoor painting=500"}
                />
              </label>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            What customer can expect, one per line
            <textarea
              value={form.expectationsText}
              onChange={(event) => updateForm("expectationsText", event.target.value)}
              className={textareaClassName()}
              placeholder={"Dusting and wiping surfaces\nFloor mopping and vacuuming"}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
