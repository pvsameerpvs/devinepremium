"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  clearAdminSession,
  getStoredAdminSession,
  type AdminSession,
} from "@/lib/auth";
import { AdminDashboardProvider, useAdminDashboard } from "./AdminDashboardProvider";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStateCard } from "./DashboardStateCard";
import {
  getDashboardSectionFromPathname,
  getDashboardSectionHref,
} from "./dashboard-shared";

function AdminDashboardShellContent({
  children,
  onLogout,
  session,
}: {
  children: ReactNode;
  onLogout: () => void;
  session: AdminSession;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    clearPageMessage,
    error,
    isLoading,
    pageMessage,
    sidebarStats,
  } = useAdminDashboard();

  const activeSection = getDashboardSectionFromPathname(pathname);

  useEffect(() => {
    clearPageMessage();
  }, [clearPageMessage, pathname]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdf9f1_0%,#f7f2ea_35%,#eef3f9_100%)] px-3 py-8 sm:px-4 sm:py-12 xl:px-5">
      <div className="mx-auto w-full max-w-[1500px] space-y-8">
        <DashboardNavbar
          activeSection={activeSection}
          session={session}
          onLogout={onLogout}
        />

        <DashboardHeader activeSection={activeSection} session={session} />

        <div className="grid gap-5 xl:grid-cols-[272px_minmax(0,1fr)]">
          <DashboardSidebar
            activeSection={activeSection}
            stats={sidebarStats}
            onSelect={(section) => router.push(getDashboardSectionHref(section))}
          />

          <div className="min-w-0 space-y-6">
            {pageMessage && (
              <div
                className={`rounded-[24px] border px-5 py-4 text-sm ${
                  pageMessage.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {pageMessage.text}
              </div>
            )}

            {isLoading ? (
              <DashboardStateCard
                title="Loading dashboard"
                description="Please wait while we load bookings, staff, and payment follow-up."
              />
            ) : error ? (
              <DashboardStateCard
                title="Dashboard failed to load"
                description={error.message || "Please try again shortly."}
                tone="error"
              />
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export function AdminDashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getStoredAdminSession());
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <DashboardStateCard
          title="Loading admin session"
          description="Please wait while we verify your admin access."
        />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <DashboardStateCard
          title="Admin login required"
          description="Sign in with an admin account to manage booking approval, payment collection, staffing, and customer history."
          action={
            <Link
              href="/login"
              className="inline-flex rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
            >
              Go to admin login
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <AdminDashboardProvider session={session}>
      <AdminDashboardShellContent
        session={session}
        onLogout={() => {
          clearAdminSession();
          setSession(null);
        }}
      >
        {children}
      </AdminDashboardShellContent>
    </AdminDashboardProvider>
  );
}
