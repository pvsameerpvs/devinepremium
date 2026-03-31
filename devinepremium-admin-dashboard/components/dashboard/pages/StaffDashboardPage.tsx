"use client";

import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import { StaffManagementPanel } from "@/components/dashboard/StaffManagementPanel";

export function StaffDashboardPage() {
  const { activeAction, createStaff, staffMembers, updateStaff } =
    useAdminDashboard();

  return (
    <StaffManagementPanel
      staffMembers={staffMembers}
      activeAction={activeAction}
      onCreateStaff={createStaff}
      onUpdateStaff={updateStaff}
    />
  );
}
