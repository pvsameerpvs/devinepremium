"use client";

import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { StaffBooking } from "@/lib/types";
import { format, isToday, isTomorrow } from "date-fns";

function toDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`);
}

function formatDateLabel(dateStr: string) {
  const date = toDate(dateStr);

  if (isToday(date)) {
    return `Today, ${format(date, "EEE d MMM")}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "EEE d MMM")}`;
  }
  return format(date, "EEE d MMM yyyy");
}

function getBookingCountByStatus(
  bookings: StaffBooking[],
  status: string,
): number {
  return bookings.filter((b) => b.status === status).length;
}

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function StaffDashboardHome() {
  const { session } = useAuth();
  const router = useRouter();
  const [now, setNow] = useState(getTodayStr());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getTodayStr());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/staff/bookings", session?.token],
    ([path, token]) =>
      apiRequest<{ bookings: StaffBooking[] }>(path, {
        method: "GET",
        token,
      }),
    { refreshInterval: 30000, revalidateOnFocus: true },
  );

  const datesWithBookings = useMemo(() => {
    const raw = data?.bookings;
    if (!Array.isArray(raw)) return [];

    const grouped: Record<string, StaffBooking[]> = {};

    for (const booking of raw) {
      const date = booking.schedule.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    }

    return Object.entries(grouped)
      .map(([date, bookings]) => ({
        date,
        bookings,
        totalCount: bookings.length,
        inProgressCount: getBookingCountByStatus(bookings, "in_progress"),
        completedCount: getBookingCountByStatus(bookings, "completed"),
      }))
      .sort((a, b) => {
        if (a.date === now) return -1;
        if (b.date === now) return 1;
        return a.date.localeCompare(b.date);
      });
  }, [data, now]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#152344] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
        Failed to load bookings.{" "}
        <button
          type="button"
          onClick={() => mutate()}
          className="font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!datesWithBookings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <span className="text-3xl text-slate-400">~</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">No bookings yet</h2>
        <p className="mt-1 text-sm text-slate-500">
          You have no assigned bookings. Check back later.
        </p>
        <button
          type="button"
          onClick={() => mutate()}
          className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {datesWithBookings.map((group) => {
        const isTodayDate = group.date === now;

        return (
          <button
            key={group.date}
            type="button"
            onClick={() => router.push(`/dashboard/${group.date}`)}
            className={`w-full rounded-2xl border p-4 text-left shadow-sm transition hover:shadow-md active:scale-[0.98] ${
              isTodayDate
                ? "border-[#A65A2A] bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-bold ${
                    isTodayDate ? "text-[#A65A2A]" : "text-slate-900"
                  }`}
                >
                  {formatDateLabel(group.date)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {group.totalCount} booking{group.totalCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {group.inProgressCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700">
                    {group.inProgressCount} active
                  </span>
                )}
                <span className="text-slate-300">&rarr;</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
