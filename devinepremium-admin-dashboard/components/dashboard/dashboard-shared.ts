import type { AdminBooking, StaffMember } from "@/lib/dashboard";

export interface PageMessage {
  tone: "success" | "error";
  text: string;
}

export const dashboardSections = [
  {
    id: "overview",
    label: "Overview",
    description: "Summary, revenue, and quick admin health",
    href: "/dashboard",
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Daily schedule with staff coverage",
    href: "/dashboard/calendar",
  },
  {
    id: "staff",
    label: "Staff",
    description: "Availability, team setup, and coverage",
    href: "/dashboard/staff",
  },
  {
    id: "payments",
    label: "Payments",
    description: "Cash collection and online follow-up",
    href: "/dashboard/payments",
  },
  {
    id: "operations",
    label: "Operations",
    description: "Assign staff and manage booking status",
    href: "/dashboard/operations",
  },
] as const;

export type DashboardSectionId = (typeof dashboardSections)[number]["id"];

export interface DashboardSidebarStats {
  totalBookings: number;
  pendingRequests: number;
  activeStaff: number;
  paymentFollowUp: number;
}

export function getDashboardSectionHref(sectionId: DashboardSectionId) {
  return (
    dashboardSections.find((section) => section.id === sectionId)?.href ??
    "/dashboard"
  );
}

export function getDashboardSectionFromPathname(
  pathname: string,
): DashboardSectionId {
  if (pathname.startsWith("/dashboard/calendar")) {
    return "calendar";
  }

  if (pathname.startsWith("/dashboard/staff")) {
    return "staff";
  }

  if (pathname.startsWith("/dashboard/payments")) {
    return "payments";
  }

  if (pathname.startsWith("/dashboard/operations")) {
    return "operations";
  }

  return "overview";
}

export function getAssignableStaff(
  booking: AdminBooking,
  staffMembers: StaffMember[],
  getAvailableStaffForDate: (staffMembers: StaffMember[], date: string) => StaffMember[],
) {
  const availableStaff = getAvailableStaffForDate(
    staffMembers,
    booking.schedule.date,
  );

  if (
    booking.assignedStaff &&
    !availableStaff.some(
      (staffMember) => staffMember.id === booking.assignedStaff?.id,
    )
  ) {
    return [booking.assignedStaff, ...availableStaff];
  }

  return availableStaff;
}
