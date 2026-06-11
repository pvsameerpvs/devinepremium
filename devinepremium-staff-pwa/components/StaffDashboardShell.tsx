"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface StaffDashboardShellProps {
  children: ReactNode;
}

export function StaffDashboardShell({ children }: StaffDashboardShellProps) {
  const { isAuthenticated, isLoading, logout, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#152344] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A65A2A]">
              Staff
            </p>
            <h1 className="text-base font-bold text-slate-900">
              {session?.user?.fullName || "Dashboard"}
            </h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        {children}
      </main>
    </div>
  );
}
