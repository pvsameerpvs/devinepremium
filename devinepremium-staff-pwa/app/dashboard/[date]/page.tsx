"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";

function toDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`);
}
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { StaffBooking } from "@/lib/types";
import { StaffBookingCard } from "@/components/StaffBookingCard";

function formatDateLabel(dateStr: string) {
  const date = toDate(dateStr);
  if (isToday(date)) return `Today, ${format(date, "EEEE d MMMM yyyy")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "EEEE d MMMM yyyy")}`;
  return format(date, "EEEE d MMMM yyyy");
}

export default function DailyBookingsPage() {
  const params = useParams();
  const date = params.date as string;
  const { session } = useAuth();
  const router = useRouter();

  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/staff/bookings", session?.token, date],
    ([path, token]) =>
      apiRequest<{ bookings: StaffBooking[] }>(`${path}?date=${date}`, {
        method: "GET",
        token,
      }),
    { refreshInterval: 30000 },
  );

  const sortedBookings = useMemo(() => {
    if (!data?.bookings) return [];
    return [...data.bookings].sort((a, b) => {
      return a.schedule.timeSlot.localeCompare(b.schedule.timeSlot);
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#152344] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="mb-1 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#A65A2A]"
        >
          &larr; Back
        </Link>
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-1 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[#A65A2A]"
          >
            &larr; Back
          </Link>
          <h2 className="text-lg font-bold text-slate-900">
            {formatDateLabel(date)}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {sortedBookings.length} job{sortedBookings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-slate-500">No bookings for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBookings.map((booking) => (
            <StaffBookingCard
              key={booking.id}
              booking={booking}
              onClick={() =>
                router.push(`/dashboard/${date}/${booking.id}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
