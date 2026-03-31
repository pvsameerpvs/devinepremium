"use client";

import { useMemo, useState } from "react";
import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import { BookingSearchPanel } from "@/components/dashboard/BookingSearchPanel";
import { PaymentFollowUpPanel } from "@/components/dashboard/PaymentFollowUpPanel";
import { matchesBookingSearch } from "@/lib/dashboard";

export function PaymentsDashboardPage() {
  const { activeAction, bookings, updatePaymentStatus } = useAdminDashboard();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => matchesBookingSearch(booking, searchQuery)),
    [bookings, searchQuery],
  );

  return (
    <div className="space-y-6">
      <BookingSearchPanel
        query={searchQuery}
        filteredCount={filteredBookings.length}
        totalCount={bookings.length}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      <PaymentFollowUpPanel
        bookings={filteredBookings}
        activeAction={activeAction}
        onUpdatePaymentStatus={updatePaymentStatus}
      />
    </div>
  );
}
