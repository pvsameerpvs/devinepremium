"use client";

import { useEffect, useState } from "react";
import {
  type BookingHistoryResponse,
  type CustomerAccountResponse,
} from "@/lib/account";
import { type UserSession, saveUserSession } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { ProfilePanel } from "../ProfilePanel";
import { PaymentHistoryPanel } from "../PaymentHistoryPanel";
import { type ProfileFormState } from "../account-shared";

interface ProfileTabProps {
  session: UserSession;
  accountData?: CustomerAccountResponse;
  bookingData?: BookingHistoryResponse;
  mutateAccount: () => Promise<unknown>;
}

export function ProfileTab({
  session,
  accountData,
  bookingData,
  mutateAccount,
}: ProfileTabProps) {
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: "",
    phone: "",
    defaultInstructions: "",
  });
  const [activeMutation, setActiveMutation] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  useEffect(() => {
    if (!accountData) return;
    setProfileForm({
      fullName: accountData.user.fullName || "",
      phone: accountData.user.phone || "",
      defaultInstructions: accountData.user.defaultInstructions || "",
    });
  }, [accountData]);

  async function handleProfileSave() {
    if (!session?.token) return;

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

  return (
    <div className="space-y-6">
      {pageMessage && (
        <div className={`mb-6 rounded-[20px] border px-5 py-4 text-sm ${pageMessage.toLowerCase().includes("success") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {pageMessage}
        </div>
      )}
      <ProfilePanel
        form={profileForm}
        onChange={(field, value) => setProfileForm((prev) => ({ ...prev, [field]: value }))}
        onSave={handleProfileSave}
        isSaving={activeMutation === "save-profile"}
      />
      <PaymentHistoryPanel bookings={bookingData?.bookings ?? []} />
    </div>
  );
}
