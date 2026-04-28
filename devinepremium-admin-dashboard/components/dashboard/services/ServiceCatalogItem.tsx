"use client";

import type { ManagedService } from "@/lib/services";

type ServiceCatalogItemProps = {
  isSelected: boolean;
  service: ManagedService;
  onDelete: (id: string, title: string) => void;
  onSelect: (service: ManagedService) => void;
};

export function ServiceCatalogItem({
  isSelected,
  service,
  onDelete,
  onSelect,
}: ServiceCatalogItemProps) {
  return (
    <div
      className={`group rounded-[24px] border p-4 text-left transition ${
        isSelected
          ? "border-[#A65A2A]/30 bg-amber-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => onSelect(service)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-bold text-slate-900">
            {service.title}
          </p>
          <p className="mt-1 text-xs capitalize text-slate-500">
            {service.pricingMode} pricing
          </p>
        </button>
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
            onClick={(event) => {
              event.stopPropagation();
              onDelete(service.id, service.title);
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-red-500 opacity-0 transition-opacity hover:text-red-700 group-hover:opacity-100 focus:opacity-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
