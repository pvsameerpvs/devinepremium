import type { ReactNode } from "react";
import { AdminDashboardShell } from "@/components/dashboard/AdminDashboardShell";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
