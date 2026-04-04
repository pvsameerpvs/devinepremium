"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import type { StaffFormState } from "@/components/dashboard/StaffManagementPanel";
import {
  type StaffAvailabilityDay,
  STAFF_DAY_OPTIONS,
} from "@/lib/dashboard";

const MAX_DOCUMENT_IMAGE_COUNT = 8;
const MAX_UPLOAD_FILE_SIZE_BYTES = 5_000_000;

function formatAvailabilityLabel(day: StaffAvailabilityDay) {
  return STAFF_DAY_OPTIONS.find((option) => option.key === day)?.label ?? day;
}

function getStaffInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function readFileAsDataUrl(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error("Each image must be 5MB or smaller.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read the selected image."));
    };

    reader.onerror = () => {
      reject(new Error("Failed to process selected image."));
    };

    reader.readAsDataURL(file);
  });
}

function buildFormStateFromStaff(staff: {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  availabilityDays: StaffAvailabilityDay[];
  notes?: string | null;
  profilePhotoUrl?: string | null;
  documentImageUrls?: string[] | null;
  isActive: boolean;
}): StaffFormState {
  return {
    fullName: staff.fullName,
    email: staff.email || "",
    phone: staff.phone || "",
    availabilityDays: staff.availabilityDays,
    notes: staff.notes || "",
    profilePhotoUrl: staff.profilePhotoUrl || "",
    documentImageUrls: staff.documentImageUrls || [],
    isActive: staff.isActive,
  };
}

export function StaffProfileDashboardPage({
  staffSlug,
  staffId,
}: {
  staffSlug: string;
  staffId?: string;
}) {
  const router = useRouter();
  const { activeAction, deleteStaff, isLoading, staffMembers, updateStaff } =
    useAdminDashboard();
  const normalizedRequestedSlug = staffSlug.trim().toLowerCase();
  const staffMember = useMemo(
    () =>
      staffMembers.find((staff) => {
        const slugMatches =
          Boolean(normalizedRequestedSlug) &&
          (staff.slug || "").toLowerCase() === normalizedRequestedSlug;
        const idMatches = Boolean(staffId) && staff.id === staffId;
        return slugMatches || idMatches;
      }) || null,
    [staffMembers, normalizedRequestedSlug, staffId],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StaffFormState | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const isSaving =
    staffMember && activeAction === `update-staff:${staffMember.id}`;
  const isDeleting =
    staffMember && activeAction === `delete-staff:${staffMember.id}`;
  const isBusy = isSaving || isUploadingImages;

  function startEdit() {
    if (!staffMember) {
      return;
    }

    setForm(buildFormStateFromStaff(staffMember));
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setForm(null);
  }

  function toggleDay(day: StaffAvailabilityDay) {
    setForm((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        availabilityDays: prev.availabilityDays.includes(day)
          ? prev.availabilityDays.filter((item) => item !== day)
          : [...prev.availabilityDays, day],
      };
    });
  }

  async function handleProfilePhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setIsUploadingImages(true);
      const imageDataUrl = await readFileAsDataUrl(file);
      setForm((prev) =>
        prev
          ? {
              ...prev,
              profilePhotoUrl: imageDataUrl,
            }
          : prev,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to upload this image.",
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function handleDocumentImagesSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    const currentCount = form?.documentImageUrls.length || 0;
    const remainingSlots = MAX_DOCUMENT_IMAGE_COUNT - currentCount;
    const filesToRead = files.slice(0, Math.max(0, remainingSlots));

    if (!filesToRead.length) {
      return;
    }

    try {
      setIsUploadingImages(true);
      const images = await Promise.all(filesToRead.map((file) => readFileAsDataUrl(file)));
      setForm((prev) =>
        prev
          ? {
              ...prev,
              documentImageUrls: [...prev.documentImageUrls, ...images].slice(
                0,
                MAX_DOCUMENT_IMAGE_COUNT,
              ),
            }
          : prev,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to upload selected document images.",
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function submitEdit() {
    if (!staffMember || !form) {
      return;
    }

    const payload: StaffFormState = {
      ...form,
      profilePhotoUrl: form.profilePhotoUrl.trim(),
      documentImageUrls: form.documentImageUrls.filter(Boolean),
    };

    const didSave = await updateStaff(staffMember.id, payload);
    if (didSave) {
      setIsEditing(false);
      setForm(null);
    }
  }

  async function deleteCurrentStaff() {
    if (!staffMember) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete staff "${staffMember.fullName}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    const didDelete = await deleteStaff(staffMember.id);
    if (didDelete) {
      router.push("/dashboard/staff");
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Staff profile
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">
          Loading staff profile
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Please wait while we load this staff record.
        </p>
      </section>
    );
  }

  if (!staffMember) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Staff profile
        </p>
        <h2 className="mt-3 text-2xl font-black text-slate-900">
          Staff profile not found
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          This staff slug does not exist, or the profile was removed.
        </p>
        <Link
          href="/dashboard/staff"
          className="mt-5 inline-flex rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
        >
          Back to staff list
        </Link>
      </section>
    );
  }

  const effectiveForm = form || buildFormStateFromStaff(staffMember);

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="rounded-[30px] bg-[radial-gradient(circle_at_top_left,#d9f0ff_0%,#f4faff_38%,#fff8f2_100%)] p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              {staffMember.profilePhotoUrl ? (
                <Image
                  src={staffMember.profilePhotoUrl}
                  alt={`${staffMember.fullName} profile`}
                  width={82}
                  height={82}
                  unoptimized
                  className="h-[82px] w-[82px] rounded-3xl border border-slate-200 bg-white object-cover"
                />
              ) : (
                <div className="flex h-[82px] w-[82px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-xl font-black uppercase tracking-[0.18em] text-slate-600">
                  {getStaffInitials(staffMember.fullName) || "ST"}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A65A2A]">
                  Staff profile
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  {staffMember.fullName}
                </h2>
                {(staffMember.email || staffMember.phone) && (
                  <p className="mt-2 text-sm text-slate-600">
                    {[staffMember.email, staffMember.phone].filter(Boolean).join(" • ")}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      staffMember.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {staffMember.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    Slug: {staffMember.slug}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/staff"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Back to staff
              </Link>
              <button
                type="button"
                onClick={isEditing ? cancelEdit : startEdit}
                className="rounded-full bg-[#152344] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f1b36]"
              >
                {isEditing ? "Close edit" : "Edit profile"}
              </button>
              <button
                type="button"
                onClick={() => void deleteCurrentStaff()}
                disabled={Boolean(isDeleting)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete staff"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Availability
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {staffMember.availabilityDays.map((day) => (
                <span
                  key={`${staffMember.id}-${day}`}
                  className="rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700"
                >
                  {formatAvailabilityLabel(day)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Notes
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {staffMember.notes || "No notes added for this profile yet."}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Documents ({staffMember.documentImageUrls?.length || 0})
          </p>
          {(staffMember.documentImageUrls || []).length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(staffMember.documentImageUrls || []).map((imageUrl, index) => (
                <div
                  key={`doc-${staffMember.id}-${index}`}
                  className="relative h-24 overflow-hidden rounded-2xl border border-slate-200"
                >
                  <Image
                    src={imageUrl}
                    alt={`${staffMember.fullName} document ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              No document images uploaded yet.
            </p>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Edit staff profile
            </p>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <input
                value={effectiveForm.fullName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...(prev || buildFormStateFromStaff(staffMember)),
                    fullName: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  value={effectiveForm.email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...(prev || buildFormStateFromStaff(staffMember)),
                      email: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Phone</span>
                <input
                  value={effectiveForm.phone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...(prev || buildFormStateFromStaff(staffMember)),
                      phone: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Profile photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => void handleProfilePhotoSelect(event)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
              />
              {effectiveForm.profilePhotoUrl ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <Image
                    src={effectiveForm.profilePhotoUrl}
                    alt="Profile preview"
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...(prev || buildFormStateFromStaff(staffMember)),
                        profilePhotoUrl: "",
                      }))
                    }
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                  >
                    Remove photo
                  </button>
                </div>
              ) : null}
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Document images
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => void handleDocumentImagesSelect(event)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
              />
              <p className="text-xs text-slate-500">
                Up to {MAX_DOCUMENT_IMAGE_COUNT} images per staff profile.
              </p>
              {effectiveForm.documentImageUrls.length ? (
                <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {effectiveForm.documentImageUrls.map((imageUrl, index) => (
                    <div
                      key={`edit-doc-${index}`}
                      className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Document preview ${index + 1}`}
                        fill
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...(prev || buildFormStateFromStaff(staffMember)),
                            documentImageUrls: (prev?.documentImageUrls || []).filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          }))
                        }
                        className="absolute right-1 top-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Available days</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STAFF_DAY_OPTIONS.map((day) => {
                  const isSelected = effectiveForm.availabilityDays.includes(day.key);

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-[#A65A2A] bg-amber-50 text-[#A65A2A]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Notes</span>
              <textarea
                value={effectiveForm.notes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...(prev || buildFormStateFromStaff(staffMember)),
                    notes: event.target.value,
                  }))
                }
                className="min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={effectiveForm.isActive}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...(prev || buildFormStateFromStaff(staffMember)),
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Staff member is active and assignable
              </span>
            </label>

            <button
              type="button"
              onClick={() => void submitEdit()}
              disabled={isBusy}
              className="inline-flex justify-center rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploadingImages
                ? "Processing images..."
                : isSaving
                  ? "Saving..."
                  : "Update staff profile"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
