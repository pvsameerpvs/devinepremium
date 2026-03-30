"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type AdminBooking,
  type StaffMember,
  formatAddressLine,
  formatStatusLabel,
  getAvailableStaffForDate,
  parseBookingDate,
} from "@/lib/dashboard";

export function BookingCalendar({
  bookings,
  staffMembers,
}: {
  bookings: AdminBooking[];
  staffMembers: StaffMember[];
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const firstBooking = bookings[0]?.schedule.date;
    return firstBooking ? parseBookingDate(firstBooking) : new Date();
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    const firstBooking = bookings[0]?.schedule.date;
    return firstBooking ?? new Date().toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (!bookings.length) {
      return;
    }

    const visibleDate = bookings.some(
      (booking) => booking.schedule.date === selectedDateKey,
    );

    if (!visibleDate) {
      setSelectedDateKey(bookings[0].schedule.date);
    }
  }, [bookings, selectedDateKey]);

  const monthBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = parseBookingDate(booking.schedule.date);
      return (
        bookingDate.getFullYear() === currentMonth.getFullYear() &&
        bookingDate.getMonth() === currentMonth.getMonth()
      );
    });
  }, [bookings, currentMonth]);

  const bookingsByDate = useMemo(() => {
    return monthBookings.reduce<Record<string, AdminBooking[]>>((acc, booking) => {
      acc[booking.schedule.date] = [...(acc[booking.schedule.date] ?? []), booking]
        .sort((a, b) => a.schedule.timeSlot.localeCompare(b.schedule.timeSlot));
      return acc;
    }, {});
  }, [monthBookings]);

  const selectedDayBookings = useMemo(() => {
    return [...(bookingsByDate[selectedDateKey] ?? [])].sort((a, b) =>
      a.schedule.timeSlot.localeCompare(b.schedule.timeSlot),
    );
  }, [bookingsByDate, selectedDateKey]);

  const selectedDayAvailableStaff = useMemo(() => {
    return getAvailableStaffForDate(staffMembers, selectedDateKey);
  }, [selectedDateKey, staffMembers]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const leadingEmptyDays = Array.from({ length: firstWeekday });

  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const dayBookings = bookingsByDate[dateKey] ?? [];
    const availableStaff = getAvailableStaffForDate(staffMembers, dateKey);
    const coverageCount = availableStaff.length;
    const isSelected = selectedDateKey === dateKey;
    const isToday = dateKey === new Date().toISOString().slice(0, 10);
    const hasCoverageGap = dayBookings.length > 0 && coverageCount === 0;
    const canOpen = coverageCount > 0 || dayBookings.length > 0;

    return (
      <button
        key={dateKey}
        type="button"
        onClick={() => canOpen && setSelectedDateKey(dateKey)}
        disabled={!canOpen}
        className={`flex min-h-[132px] flex-col rounded-[22px] border p-3 text-left transition ${
          isSelected
            ? "border-[#A65A2A] bg-amber-50 shadow-sm"
            : coverageCount > 0
              ? "border-emerald-200 bg-white hover:border-emerald-300"
              : dayBookings.length > 0
                ? "border-red-200 bg-red-50 hover:border-red-300"
                : "cursor-not-allowed border-slate-200 border-dashed bg-slate-100 text-slate-400"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-semibold ${
              isToday ? "text-[#A65A2A]" : "text-slate-700"
            }`}
          >
            {dayNumber}
          </span>
          {dayBookings.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {dayBookings.length}
            </span>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <div
            className={`rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              coverageCount > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {coverageCount > 0 ? `${coverageCount} staff ready` : "No staff"}
          </div>

          {hasCoverageGap && (
            <p className="text-[11px] font-medium text-red-600">
              Coverage needed
            </p>
          )}

          {dayBookings.slice(0, 2).map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700"
            >
              <p className="font-semibold">{booking.schedule.timeSlot}</p>
              <p className="mt-1 line-clamp-2">{booking.serviceTitle}</p>
            </div>
          ))}
          {dayBookings.length > 2 && (
            <p className="text-[11px] font-medium text-slate-500">
              +{dayBookings.length - 2} more bookings
            </p>
          )}
        </div>
      </button>
    );
  });

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A65A2A]">
            Booking calendar
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-900">
            Staff-aware daily schedule
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (value) => new Date(value.getFullYear(), value.getMonth() - 1, 1),
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Prev
          </button>
          <p className="min-w-[180px] text-center text-sm font-semibold text-slate-900">
            {currentMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                (value) => new Date(value.getFullYear(), value.getMonth() + 1, 1),
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div>
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {leadingEmptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[132px] rounded-[22px] bg-transparent" />
            ))}
            {calendarDays}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Selected day
          </p>
          <h3 className="mt-3 text-2xl font-black text-slate-900">
            {parseBookingDate(selectedDateKey).toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>

          <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Available staff</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDayAvailableStaff.length ? (
                selectedDayAvailableStaff.map((staffMember) => (
                  <span
                    key={staffMember.id}
                    className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
                  >
                    {staffMember.fullName}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No active staff available on this day.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {selectedDayBookings.length ? (
              selectedDayBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.schedule.timeSlot}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {booking.serviceTitle}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {booking.contactName} • {booking.contactEmail}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      {formatStatusLabel(booking.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {formatAddressLine(booking)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.assignedStaff ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {booking.assignedStaff.fullName}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Unassigned
                      </span>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  No bookings on this date
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Choose another active day in the calendar to review the schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
