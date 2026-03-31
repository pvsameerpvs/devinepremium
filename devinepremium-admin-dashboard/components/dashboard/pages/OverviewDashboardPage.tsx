"use client";

import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import { DashboardOverviewSection } from "@/components/dashboard/DashboardOverviewSection";

export function OverviewDashboardPage() {
  const {
    activeStaffCount,
    coverageGapCount,
    paymentFollowUpCount,
    summary,
  } = useAdminDashboard();

  return (
    <DashboardOverviewSection
      totalBookings={summary.totalBookings}
      pendingRequests={summary.pendingCustomerRequests}
      activeStaffCount={activeStaffCount}
      paymentFollowUpCount={paymentFollowUpCount}
      coverageGapCount={coverageGapCount}
      pendingBookings={summary.pendingBookings}
      completedBookings={summary.completedBookings}
      revenueCollected={summary.revenueCollected}
    />
  );
}
