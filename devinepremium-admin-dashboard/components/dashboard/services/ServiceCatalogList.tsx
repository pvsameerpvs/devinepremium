"use client";

import type { ManagedService } from "@/lib/services";
import { ServiceCatalogItem } from "./ServiceCatalogItem";

type ServiceCatalogListProps = {
  activeCount: number;
  hasError: boolean;
  isLoading: boolean;
  selectedServiceId: string;
  services: ManagedService[];
  onCreateNew: () => void;
  onDelete: (id: string, title: string) => void;
  onSelect: (service: ManagedService) => void;
};

export function ServiceCatalogList({
  activeCount,
  hasError,
  isLoading,
  selectedServiceId,
  services,
  onCreateNew,
  onDelete,
  onSelect,
}: ServiceCatalogListProps) {
  return (
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
          onClick={onCreateNew}
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
        {hasError && (
          <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">
            Could not load services.
          </div>
        )}
        {!isLoading && !hasError && services.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
            No services added yet.
          </div>
        )}
        {services.map((service) => (
          <ServiceCatalogItem
            key={service.id}
            isSelected={selectedServiceId === service.id}
            service={service}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
