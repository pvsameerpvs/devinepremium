"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
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
    <section className="bg-[linear-gradient(180deg,#f6fbff_0%,#f8fafc_26%,#f8fafc_100%)] min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8">
        <AccountHero session={session} onLogout={handleLogout} />

        {(accountError || bookingError) && (
          <div className="mb-6 mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {(accountError instanceof Error && accountError.message) ||
              (bookingError instanceof Error && bookingError.message) ||
              "Could not load your account data."}
          </div>
        )}

        <div className="mt-6 flex flex-col xl:flex-row gap-6 xl:mt-8">
          <div className="xl:w-[320px] flex-shrink-0">
            <AccountSidebar
              activeSection={activeSection}
              summary={summary}
            />
          </div>

          <div className="flex-1 min-w-0">
            {children({
              session,
              accountData,
              bookingData,
              mutateAccount,
              mutateBookings,
            })}
          </div>
        </div>
        <WhatsAppButton />
      </div>
    </section>
  );
}
