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
    id: "services",
    label: "Services",
    description: "Website services, images, pricing mode, and add-ons",
    href: "/dashboard/services",
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

  if (pathname.startsWith("/dashboard/services")) {
    return "services";
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

export function getBookingStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "accepted":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "scheduled":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "in_progress":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-teal-100 text-teal-700 border-teal-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function getPaymentStatusColor(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cash_due":
      return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
    case "failed":
      return "bg-red-100 text-red-700 border-red-200";
    case "refunded":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
}
