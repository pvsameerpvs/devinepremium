"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminDashboard } from "@/components/dashboard/AdminDashboardProvider";
import type { StaffFormState } from "@/components/dashboard/StaffManagementPanel";
import {
  type StaffAvailabilityDay,
  STAFF_DAY_OPTIONS,
} from "@/lib/dashboard";

const MAX_DOCUMENT_IMAGE_COUNT = 8;
const MAX_UPLOAD_FILE_SIZE_BYTES = 5_000_000;

const emptyForm: StaffFormState = {
  fullName: "",
  email: "",
  phone: "",
  availabilityDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  notes: "",
  profilePhotoUrl: "",
  documentImageUrls: [],
  isActive: true,
  password: "",
};

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

export function StaffCreateDashboardPage() {
  const router = useRouter();
  const { activeAction, createStaff } = useAdminDashboard();

  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const isSaving = activeAction === "create-staff";
  const isBusy = isSaving || isUploadingImages;

  function toggleDay(day: StaffAvailabilityDay) {
    setForm((prev) => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day)
        ? prev.availabilityDays.filter((item) => item !== day)
        : [...prev.availabilityDays, day],
    }));
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
      setForm((prev) => ({
        ...prev,
        profilePhotoUrl: imageDataUrl,
      }));
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

    const remainingSlots = MAX_DOCUMENT_IMAGE_COUNT - form.documentImageUrls.length;
    const filesToRead = files.slice(0, Math.max(0, remainingSlots));

    if (!filesToRead.length) {
      return;
    }

    try {
      setIsUploadingImages(true);
      const images = await Promise.all(filesToRead.map((file) => readFileAsDataUrl(file)));
      setForm((prev) => ({
        ...prev,
        documentImageUrls: [...prev.documentImageUrls, ...images].slice(
          0,
          MAX_DOCUMENT_IMAGE_COUNT,
        ),
      }));
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

  async function submitForm() {
    if (!form.password || form.password.length < 8) {
      window.alert("Password must be at least 8 characters.");
      return;
    }

    const payload: StaffFormState & { password: string } = {
      ...form,
      profilePhotoUrl: form.profilePhotoUrl.trim(),
      documentImageUrls: form.documentImageUrls.filter(Boolean),
      password: form.password,
    };

    const didSave = await createStaff(payload);
    if (didSave) {
      router.push("/dashboard/staff");
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A65A2A]">
              Staff
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Create Staff
            </h2>
          </div>
          <Link
            href="/dashboard/staff"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to table
          </Link>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        {/* Basic Info Section */}
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <p className="text-sm font-bold text-slate-800">Basic Information</p>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fullName: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              placeholder="Staff member name"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                placeholder="staff@devinepremium.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Phone</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                placeholder="+971..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Password <span className="text-red-500">*</span>
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
                placeholder="Min 6 characters"
                minLength={6}
              />
              <p className="text-xs text-slate-500">
                Staff will use this password to log in to their mobile app.
              </p>
            </label>
          </div>

        {/* Contact & Login Section */}
        <div className="flex items-center gap-2 mt-8 mb-5 pb-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <p className="text-sm font-bold text-slate-800">Contact & Login</p>
        </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => void handleProfilePhotoSelect(event)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
            />
            {form.profilePhotoUrl ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Image
                  src={form.profilePhotoUrl}
                  alt="Profile preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, profilePhotoUrl: "" }))
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
            {form.documentImageUrls.length ? (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {form.documentImageUrls.map((imageUrl, index) => (
                  <div
                    key={`form-doc-${index}`}
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
                          ...prev,
                          documentImageUrls: prev.documentImageUrls.filter(
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

        {/* Availability & Notes Section */}
        <div className="flex items-center gap-2 mt-8 mb-5 pb-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <p className="text-sm font-bold text-slate-800">Availability & Notes</p>
        </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Available days</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STAFF_DAY_OPTIONS.map((day) => {
                const isSelected = form.availabilityDays.includes(day.key);

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
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              className="min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#A65A2A] focus:ring-4 focus:ring-amber-50"
              placeholder="Shift details, special skills, area coverage..."
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">
              Staff member is active and assignable
            </span>
          </label>

          <button
            type="button"
            onClick={() => void submitForm()}
            disabled={isBusy}
            className="inline-flex justify-center rounded-full bg-[#152344] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1b36] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploadingImages
              ? "Processing images..."
              : isSaving
                ? "Creating..."
                : "Create staff"}
          </button>
        </div>
      </div>
    </section>
  );
}
