"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
  saveUserSession,
  type UserSession,
} from "@/lib/auth";
import {
  type BookingHistoryResponse,
  type CustomerAccountResponse,
  type SavedAddressRecord,
} from "@/lib/account";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { AccountHero } from "./AccountHero";
import { AccountSidebar } from "./AccountSidebar";
import { AccountStateCard } from "./AccountStateCard";
import { OrdersPanel } from "./OrdersPanel";
import { ProfilePanel } from "./ProfilePanel";
import { SavedAddressesPanel } from "./SavedAddressesPanel";
import {
  emptyAddressForm,
  type AccountSectionId,
  type AddressFormState,
  type ProfileFormState,
} from "./account-shared";

export function CustomerAccountPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeSection, setActiveSection] =
    useState<AccountSectionId>("profile");
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: "",
    phone: "",
    defaultInstructions: "",
  });
  const [addressForm, setAddressForm] = useState<AddressFormState>(
    emptyAddressForm,
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [activeMutation, setActiveMutation] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  useEffect(() => {
    setSession(getStoredUserSession());
    setIsReady(true);
  }, []);

  const {
    data: accountData,
    error: accountError,
    isLoading: isAccountLoading,
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
    isLoading: isBookingsLoading,
    mutate: mutateBookings,
  } = useSWR(
    session?.token ? ["/api/v1/bookings/me", session.token] : null,
    ([path, token]) =>
      apiRequest<BookingHistoryResponse>(path, {
        method: "GET",
        token,
      }),
  );

  useEffect(() => {
    if (!accountData) {
      return;
    }

    setProfileForm({
      fullName: accountData.user.fullName || "",
      phone: accountData.user.phone || "",
      defaultInstructions: accountData.user.defaultInstructions || "",
    });
  }, [accountData]);

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

  async function handleProfileSave() {
    if (!session?.token) {
      return;
    }

    setActiveMutation("save-profile");
    setPageMessage("");

    try {
      const response = await apiRequest<{
        message: string;
        user: CustomerAccountResponse["user"];
      }>("/api/v1/account/profile", {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify(profileForm),
      });

      const updatedSession: UserSession = {
        ...session,
        user: {
          ...session.user,
          fullName: response.user.fullName,
          phone: response.user.phone,
        },
      };

      saveUserSession(updatedSession);
      setSession(updatedSession);
      setPageMessage(response.message);
      await mutateAccount();
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Could not update profile.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  function startCreateAddress() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId("new");
  }

  function startEditAddress(address: SavedAddressRecord) {
    setAddressForm({
      label: address.label,
      location: address.location,
      building: address.building || "",
      apartment: address.apartment || "",
      city: address.city,
      mapLink: address.mapLink || "",
      lat: address.lat || "",
      lng: address.lng || "",
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
  }

  function resetAddressForm() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
  }

  async function handleSaveAddress() {
    if (!session?.token) {
      return;
    }

    setActiveMutation("save-address");
    setPageMessage("");

    try {
      const path =
        editingAddressId && editingAddressId !== "new"
          ? `/api/v1/account/addresses/${editingAddressId}`
          : "/api/v1/account/addresses";
      const method =
        editingAddressId && editingAddressId !== "new" ? "PATCH" : "POST";

      const response = await apiRequest<{ message: string }>(path, {
        method,
        token: session.token,
        body: JSON.stringify(addressForm),
      });

      setPageMessage(response.message);
      resetAddressForm();
      await mutateAccount();
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Could not save address.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  async function handleDeleteAddress(addressId: string) {
    if (!session?.token) {
      return;
    }

    setActiveMutation(`delete-address:${addressId}`);
    setPageMessage("");

    try {
      const response = await apiRequest<{ message: string }>(
        `/api/v1/account/addresses/${addressId}`,
        {
          method: "DELETE",
          token: session.token,
        },
      );

      setPageMessage(response.message);
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      await mutateAccount();
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Could not delete address.",
      );
    } finally {
      setActiveMutation("");
    }
  }

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    clearUserSession();
    setSession(null);
  }

  const ordersContent =
    isAccountLoading || isBookingsLoading ? (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        Loading your account details...
      </div>
    ) : (
      <OrdersPanel
        bookings={bookingData?.bookings ?? []}
        mutateBookings={mutateBookings}
        session={session as UserSession}
      />
    );

  if (!isReady) {
    return (
      <section className="bg-slate-50 px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl">
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
      <section className="bg-slate-50 px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl">
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
    <section className="bg-[linear-gradient(180deg,#f6fbff_0%,#f8fafc_26%,#f8fafc_100%)] px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <AccountHero session={session} onLogout={handleLogout} />

        {pageMessage && (
          <div className="mb-6 mt-6 rounded-[20px] border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm text-cyan-800">
            {pageMessage}
          </div>
        )}

        {(accountError || bookingError) && (
          <div className="mb-6 mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {(accountError instanceof Error && accountError.message) ||
              (bookingError instanceof Error && bookingError.message) ||
              "Could not load your account data."}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <AccountSidebar
            activeSection={activeSection}
            summary={summary}
            onSelect={setActiveSection}
          />

          <div className="space-y-6">
            {activeSection === "profile" ? (
              <ProfilePanel
                form={profileForm}
                onChange={(field, value) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    [field]: value,
                  }))
                }
                onSave={handleProfileSave}
                isSaving={activeMutation === "save-profile"}
              />
            ) : null}

            {activeSection === "addresses" ? (
              <SavedAddressesPanel
                addresses={accountData?.savedAddresses ?? []}
                form={addressForm}
                editingAddressId={editingAddressId}
                activeMutation={activeMutation}
                onChange={(field, value) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    [field]: value,
                  }))
                }
                onCreate={startCreateAddress}
                onEdit={startEditAddress}
                onDelete={handleDeleteAddress}
                onSubmit={handleSaveAddress}
                onCancel={resetAddressForm}
              />
            ) : null}

            {activeSection === "orders" ? ordersContent : null}
          </div>
        </div>
      </div>
    </section>
  );
}
