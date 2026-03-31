"use client";

import { useMemo, useState } from "react";
import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import { BookingOperationsPanel } from "@/components/dashboard/BookingOperationsPanel";
import { BookingSearchPanel } from "@/components/dashboard/BookingSearchPanel";
import { matchesBookingSearch } from "@/lib/dashboard";

export function OperationsDashboardPage() {
  const {
    activeAction,
    assignStaff,
    bookings,
    resolveCustomerRequest,
    staffMembers,
    updateBookingStatus,
    updatePaymentStatus,
  } = useAdminDashboard();
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

      <BookingOperationsPanel
        bookings={filteredBookings}
        staffMembers={staffMembers}
        activeAction={activeAction}
        onResolveCustomerRequest={resolveCustomerRequest}
        onAssignStaff={assignStaff}
        onUpdateBookingStatus={updateBookingStatus}
        onUpdatePaymentStatus={updatePaymentStatus}
      />
    </div>
  );
}
