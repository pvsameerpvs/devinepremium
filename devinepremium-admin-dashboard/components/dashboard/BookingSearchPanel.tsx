"use client";

export function BookingSearchPanel({
  query,
  filteredCount,
  totalCount,
  onChange,
  onClear,
}: {
  query: string;
  filteredCount: number;
  totalCount: number;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Search bookings
          </p>
          <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
            Find by customer, email, booking ID, or reference
          </h2>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
          <input
            value={query}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search customer name, email, booking ID, or DP reference"
            className="h-12 flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
          />
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Clear
          </button>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Showing {filteredCount} of {totalCount} bookings
      </p>
    </section>
  );
}
