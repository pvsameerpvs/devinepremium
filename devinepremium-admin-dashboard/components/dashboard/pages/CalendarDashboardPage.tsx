"use client";

import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";

export function CalendarDashboardPage() {
  const { bookings, staffMembers } = useAdminDashboard();

  return <BookingCalendar bookings={bookings} staffMembers={staffMembers} />;
}
