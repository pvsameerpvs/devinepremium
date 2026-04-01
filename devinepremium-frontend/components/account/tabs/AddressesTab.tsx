"use client";

import { useState } from "react";
import { type CustomerAccountResponse, type SavedAddressRecord } from "@/lib/account";
import { type UserSession } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { SavedAddressesPanel } from "../SavedAddressesPanel";
import { emptyAddressForm, type AddressFormState } from "../account-shared";

interface AddressesTabProps {
  session: UserSession;
  accountData?: CustomerAccountResponse;
  mutateAccount: () => Promise<unknown>;
}

export function AddressesTab({ session, accountData, mutateAccount }: AddressesTabProps) {
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [activeMutation, setActiveMutation] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  function startCreateAddress() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId("new");
    setPageMessage("");
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
    setPageMessage("");
  }

  function resetAddressForm() {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setPageMessage("");
  }

  async function handleSaveAddress() {
    if (!session?.token) return;

    setActiveMutation("save-address");
    setPageMessage("");

    try {
      const path =
        editingAddressId && editingAddressId !== "new"
          ? `/api/v1/account/addresses/${editingAddressId}`
          : "/api/v1/account/addresses";
      const method = editingAddressId && editingAddressId !== "new" ? "PATCH" : "POST";

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
    if (!session?.token) return;

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

  return (
    <div>
      {pageMessage && (
        <div className={`mb-6 rounded-[20px] border px-5 py-4 text-sm ${pageMessage.toLowerCase().includes("success") || pageMessage.toLowerCase().includes("deleted") ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {pageMessage}
        </div>
      )}
      <SavedAddressesPanel
        addresses={accountData?.savedAddresses ?? []}
        form={addressForm}
        editingAddressId={editingAddressId}
        activeMutation={activeMutation}
        onChange={(field, value) => setAddressForm((prev) => ({ ...prev, [field]: value }))}
        onCreate={startCreateAddress}
        onEdit={startEditAddress}
        onDelete={handleDeleteAddress}
        onSubmit={handleSaveAddress}
        onCancel={resetAddressForm}
      />
    </div>
  );
}
