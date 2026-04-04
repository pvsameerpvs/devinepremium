"use client";

import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import { StaffManagementPanel } from "@/components/dashboard/StaffManagementPanel";

export function StaffDashboardPage() {
  const { staffMembers } = useAdminDashboard();

  return <StaffManagementPanel staffMembers={staffMembers} />;
}
