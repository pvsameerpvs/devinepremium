"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import type { AdminSession } from "@/lib/auth";
import {
  type AdminBooking,
  type AdminDashboardResponse,
  type DashboardSummary,
  type StaffMember,
  getAvailableStaffForDate,
} from "@/lib/dashboard";
import {
  type DashboardSidebarStats,
  type PageMessage,
} from "./dashboard-shared";
import type { StaffFormState } from "./StaffManagementPanel";

const EMPTY_BOOKINGS: AdminBooking[] = [];
const EMPTY_STAFF: StaffMember[] = [];
const SOFT_DELETED_STAFF_NOTE = "__staff_deleted__";
const EMPTY_SUMMARY: DashboardSummary = {
  totalBookings: 0,
  pendingBookings: 0,
  activeBookings: 0,
  completedBookings: 0,
  paidBookings: 0,
  cashDueBookings: 0,
  pendingCustomerRequests: 0,
  revenueCollected: 0,
};

interface AdminDashboardContextValue {
  session: AdminSession;
  summary: DashboardSummary;
  bookings: AdminBooking[];
  staffMembers: StaffMember[];
  activeAction: string;
  pageMessage: PageMessage | null;
  isLoading: boolean;
  error: Error | null;
  activeStaffCount: number;
  paymentFollowUpCount: number;
  coverageGapCount: number;
  sidebarStats: DashboardSidebarStats;
  clearPageMessage: () => void;
  updateBookingStatus: (bookingId: string, status: string) => Promise<void>;
  updatePaymentStatus: (paymentId: string, status: string) => Promise<void>;
  resolveCustomerRequest: (
    bookingId: string,
    decision: "approved" | "declined",
  ) => Promise<void>;
  assignStaff: (bookingId: string, staffId: string | null) => Promise<void>;
  createStaff: (input: StaffFormState) => Promise<boolean>;
  updateStaff: (staffId: string, input: Partial<StaffFormState>) => Promise<boolean>;
  toggleStaffActive: (staffId: string, currentStatus: boolean) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<boolean>;
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(
  null,
);

export function AdminDashboardProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: AdminSession;
}) {
  const [activeAction, setActiveAction] = useState("");
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/admin/dashboard", session.token],
    ([path, token]) =>
      apiRequest<AdminDashboardResponse>(path, {
        method: "GET",
        token,
      }),
    { refreshInterval: 15000 } // Auto-refresh every 15 seconds to catch new bookings
  );

  const clearPageMessage = useCallback(() => {
    setPageMessage(null);
  }, []);

  async function runDashboardAction(
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) {
    setActiveAction(actionKey);
    setPageMessage(null);

    try {
      await action();
      setPageMessage({
        tone: "success",
        text: successMessage,
      });
      await mutate();
      return true;
    } catch (actionError) {
      setPageMessage({
        tone: "error",
        text:
          actionError instanceof Error
            ? actionError.message
            : "Action failed. Please try again.",
      });
      return false;
    } finally {
      setActiveAction("");
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    await runDashboardAction(
      `booking:${bookingId}`,
      "Booking status updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/bookings/${bookingId}/status`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            status,
            note: "Updated from admin dashboard.",
          }),
        });
      },
    );
  }

  async function updatePaymentStatus(paymentId: string, status: string) {
    await runDashboardAction(
      `payment:${paymentId}`,
      "Payment status updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/payments/${paymentId}/status`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            status,
          }),
        });
      },
    );
  }

  async function resolveCustomerRequest(
    bookingId: string,
    decision: "approved" | "declined",
  ) {
    await runDashboardAction(
      `request:${bookingId}:${decision}`,
      "Customer request updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/bookings/${bookingId}/customer-request`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            decision,
          }),
        });
      },
    );
  }

  async function assignStaff(bookingId: string, staffId: string | null) {
    await runDashboardAction(
      `assign:${bookingId}`,
      staffId
        ? "Staff assigned successfully."
        : "Staff assignment cleared successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/bookings/${bookingId}/assign-staff`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            staffId,
          }),
        });
      },
    );
  }

  async function createStaff(input: StaffFormState) {
    return runDashboardAction(
      "create-staff",
      "Staff member created successfully.",
      async () => {
        await apiRequest("/api/v1/admin/staff", {
          method: "POST",
          token: session.token,
          body: JSON.stringify(input),
        });
      },
    );
  }

  async function updateStaff(staffId: string, input: Partial<StaffFormState>) {
    return runDashboardAction(
      `update-staff:${staffId}`,
      "Staff member updated successfully.",
      async () => {
        await apiRequest(`/api/v1/admin/staff/${staffId}`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify(input),
        });
      },
    );
  }

  async function toggleStaffActive(staffId: string, currentStatus: boolean) {
    await runDashboardAction(
      `toggle-staff:${staffId}`,
      `Staff member ${!currentStatus ? "enabled" : "disabled"} successfully.`,
      async () => {
        await apiRequest(`/api/v1/admin/staff/${staffId}`, {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        });
      },
    );
  }

  async function deleteStaff(staffId: string) {
    return runDashboardAction(
      `delete-staff:${staffId}`,
      "Staff member deleted successfully.",
      async () => {
        const isNotFoundError = (error: unknown) =>
          error instanceof Error &&
          error.message.toLowerCase().includes("404");

        try {
          await apiRequest(`/api/v1/admin/staff/${staffId}`, {
            method: "DELETE",
            token: session.token,
          });
          return;
        } catch (deleteError) {
          if (isNotFoundError(deleteError)) {
            try {
              await apiRequest(`/api/v1/admin/staff/${staffId}/delete`, {
                method: "POST",
                token: session.token,
              });
              return;
            } catch (postDeleteError) {
              if (!isNotFoundError(postDeleteError)) {
                throw postDeleteError;
              }
            }

            const softDeleteSlug = `deleted-${Date.now()}-${staffId.slice(0, 8)}`;
            await apiRequest(`/api/v1/admin/staff/${staffId}`, {
              method: "PATCH",
              token: session.token,
              body: JSON.stringify({
                isActive: false,
                notes: SOFT_DELETED_STAFF_NOTE,
                slug: softDeleteSlug,
              }),
            });
            return;
          }

          throw deleteError;
        }
      },
    );
  }

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const bookings = data?.bookings ?? EMPTY_BOOKINGS;
  const staffMembers = useMemo(
    () =>
      (data?.staffMembers ?? EMPTY_STAFF).filter(
        (staffMember) =>
          (staffMember.notes || "").trim() !== SOFT_DELETED_STAFF_NOTE,
      ),
    [data?.staffMembers],
  );

  const activeStaffCount = useMemo(
    () => staffMembers.filter((staffMember) => staffMember.isActive).length,
    [staffMembers],
  );

  const paymentFollowUpCount = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus !== "paid").length,
    [bookings],
  );

  const coverageGapCount = useMemo(
    () =>
      bookings.filter((booking) => {
        const availableStaff = getAvailableStaffForDate(
          staffMembers,
          booking.schedule.date,
        );

        return !booking.assignedStaff || availableStaff.length === 0;
      }).length,
    [bookings, staffMembers],
  );

  const sidebarStats = useMemo(
    () => ({
      totalBookings: summary.totalBookings,
      pendingRequests: summary.pendingCustomerRequests,
      activeStaff: activeStaffCount,
      paymentFollowUp: paymentFollowUpCount,
    }),
    [activeStaffCount, paymentFollowUpCount, summary],
  );

  const value: AdminDashboardContextValue = {
    session,
    summary,
    bookings,
    staffMembers,
    activeAction,
    pageMessage,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    activeStaffCount,
    paymentFollowUpCount,
    coverageGapCount,
    sidebarStats,
    clearPageMessage,
    updateBookingStatus,
    updatePaymentStatus,
    resolveCustomerRequest,
    assignStaff,
    createStaff,
    updateStaff,
    toggleStaffActive,
    deleteStaff,
  };

  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);

  if (!context) {
    throw new Error("useAdminDashboard must be used within AdminDashboardProvider.");
  }

  return context;
}
