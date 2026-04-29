"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
  isUserSessionError,
  type UserSession,
} from "@/lib/auth";
import {
  type BookingHistoryResponse,
  type CustomerAccountResponse,
} from "@/lib/account";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { AccountHero } from "./AccountHero";
import { AccountSidebar } from "./AccountSidebar";
import { AccountStateCard } from "./AccountStateCard";
import { WhatsAppButton } from "../WhatsAppButton";
import type { AccountSectionId } from "./account-shared";

export function CustomerAccountWrapper({ 
  children, 
  activeSection,
}: { 
  children: (props: {
    session: UserSession;
    accountData?: CustomerAccountResponse;
    bookingData?: BookingHistoryResponse;
    mutateAccount: () => Promise<unknown>;
    mutateBookings: () => Promise<unknown>;
  }) => React.ReactNode;
  activeSection: AccountSectionId;
}) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getStoredUserSession());
    setIsReady(true);
  }, []);

  const {
    data: accountData,
    error: accountError,
    mutate: mutateAccount,
  } = useSWR(
    session?.token ? ["/api/v1/account", session.token] : null,
    ([path, token]) =>
      apiRequest<CustomerAccountResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const {
    data: bookingData,
    error: bookingError,
    mutate: mutateBookings,
  } = useSWR(
    session?.token ? ["/api/v1/bookings/me", session.token] : null,
    ([path, token]) =>
      apiRequest<BookingHistoryResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const summary = useMemo(() => {
    const bookings = bookingData?.bookings ?? [];

    return {
      total: bookings.length,
      active: bookings.filter((booking) =>
        ["pending", "accepted", "scheduled", "in_progress"].includes(
          booking.status,
        ),
      ).length,
      pendingRequests: bookings.filter(
        (booking) => booking.customerRequest?.status === "pending",
      ).length,
      savedAddresses: accountData?.savedAddresses.length ?? 0,
    };
  }, [accountData, bookingData]);

  useEffect(() => {
    const authError = [accountError, bookingError].find((error) =>
      isUserSessionError(error),
    );

    if (!session || !authError) {
      return;
    }

    clearUserSession();
    setSession(null);
  }, [accountError, bookingError, session]);

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    clearUserSession();
    setSession(null);
  }

  if (!isReady) {
    return (
      <section className="bg-slate-50 py-10 sm:py-12">
        <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8">
          <AccountStateCard
            title="Loading your account"
            description="Please wait while we prepare your profile, saved addresses, and order history."
          />
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="bg-slate-50 py-10 sm:py-12">
        <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8">
          <AccountStateCard
            title="Login required"
            description="Sign in with your email account to open your customer dashboard, follow booking history, and continue payments."
            action={
              <Link
                href="/login?redirect=%2Faccount"
                className="inline-flex rounded-full dp-btn-primary px-5 py-3 text-sm font-semibold"
              >
                Go to login
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] min-h-screen pb-16 pt-6 sm:pb-24 sm:pt-8">
      <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 px-1">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-colors">Home</Link>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <Link href="/account/profile" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-colors">Account</Link>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
        </div>

        <AccountHero session={session} onLogout={handleLogout} />

        {(accountError || bookingError) && (
          <div className="mb-6 mt-6 rounded-3xl border border-red-100 bg-red-50/50 px-6 py-4 text-sm text-red-600 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                <span className="text-xs font-black">!</span>
              </div>
              <p className="font-semibold">
                {(accountError instanceof Error && accountError.message) ||
                  (bookingError instanceof Error && bookingError.message) ||
                  "Synchronisation error. Please refresh your dashboard."}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col xl:flex-row gap-10">
          <div className="xl:w-[360px] flex-shrink-0">
            <div className="sticky top-8">
              <AccountSidebar
                activeSection={activeSection}
                summary={summary}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
              {children({
                session,
                accountData,
                bookingData,
                mutateAccount,
                mutateBookings,
              })}
            </div>
          </div>
        </div>
        <WhatsAppButton />
      </div>
    </section>
  );
}
