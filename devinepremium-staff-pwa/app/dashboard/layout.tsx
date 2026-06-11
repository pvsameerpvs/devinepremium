import type { ReactNode } from "react";
import { StaffDashboardShell } from "@/components/StaffDashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <StaffDashboardShell>{children}</StaffDashboardShell>;
}
