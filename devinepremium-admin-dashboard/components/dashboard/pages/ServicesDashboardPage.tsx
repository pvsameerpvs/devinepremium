"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { ServiceCatalogList } from "@/components/dashboard/services/ServiceCatalogList";
import { ServiceEditorForm } from "@/components/dashboard/services/ServiceEditorForm";
import {
  buildServicePayload,
  createEmptyServiceForm,
  serviceFormFromService,
  type ServiceFormState,
} from "@/components/dashboard/services/serviceForm";
import { apiRequest, getApiBaseUrl } from "@/lib/api";
import type {
  CategoriesResponse,
  ManagedService,
  ServiceCategory,
  ServicesResponse,
} from "@/lib/services";
import { useAdminDashboard } from "../AdminDashboardProvider";
import type { PageMessage } from "../dashboard-shared";

const EMPTY_SERVICES: ManagedService[] = [];
const EMPTY_CATEGORIES: ServiceCategory[] = [];

type UploadResponse = {
  message?: string;
  url?: string;
};

async function readUploadResponse(response: Response): Promise<UploadResponse> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as UploadResponse;
  } catch {
    throw new Error(
      `Upload failed with an invalid server response (status ${response.status}).`,
    );
  }
}

export function ServicesDashboardPage() {
  const { session } = useAdminDashboard();
  const [form, setForm] = useState<ServiceFormState>(createEmptyServiceForm);
  const [message, setMessage] = useState<PageMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    ["/api/v1/admin/services", session.token],
    ([path, token]) =>
      apiRequest<ServicesResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const { data: categoryData } = useSWR(
    ["/api/v1/admin/categories", session.token],
    ([path, token]) =>
      apiRequest<CategoriesResponse>(path, {
        method: "GET",
        token,
      }),
  );

  const categories = categoryData?.categories ?? EMPTY_CATEGORIES;
  const services = data?.services ?? EMPTY_SERVICES;
  const activeCount = useMemo(
    () => services.filter((service) => service.isActive).length,
    [services],
  );

  function updateForm<K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(createEmptyServiceForm());
    setMessage(null);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setMessage({ tone: "error", text: "Service title is required." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const path = form.id
        ? `/api/v1/admin/services/${form.id}`
        : "/api/v1/admin/services";

      await apiRequest(path, {
        method: form.id ? "PATCH" : "POST",
        token: session.token,
        body: JSON.stringify(buildServicePayload(form)),
      });

      await mutate();
      setMessage({
        tone: "success",
        text: form.id ? "Service updated successfully." : "Service created successfully.",
      });

      if (!form.id) {
        setForm(createEmptyServiceForm());
      }
    } catch (saveError) {
      setMessage({
        tone: "error",
        text: saveError instanceof Error ? saveError.message : "Service save failed.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage({ tone: "error", text: "Please upload an image file." });
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    setIsUploading(true);
    setMessage(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/admin/services/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: uploadForm,
      });
      const payload = await readUploadResponse(response);

      if (!response.ok) {
        throw new Error(payload.message || "Image upload failed.");
      }

      if (!payload.url) {
        throw new Error("Image upload did not return a URL.");
      }

      updateForm("imageUrl", payload.url);
      setMessage({ tone: "success", text: "Image uploaded successfully." });
    } catch (uploadError) {
      setMessage({
        tone: "error",
        text: uploadError instanceof Error ? uploadError.message : "Upload failed.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(`/api/v1/admin/services/${id}`, {
        method: "DELETE",
        token: session.token,
      });

      await mutate();
      if (form.id === id) {
        setForm(createEmptyServiceForm());
      }
      setMessage({ tone: "success", text: "Service deleted successfully." });
    } catch (deleteError) {
      setMessage({
        tone: "error",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Service deletion failed.",
      });
    }
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[420px_minmax(0,1fr)]">
      <ServiceCatalogList
        activeCount={activeCount}
        hasError={Boolean(error)}
        isLoading={isLoading}
        selectedServiceId={form.id}
        services={services}
        onCreateNew={resetForm}
        onDelete={handleDelete}
        onSelect={(service) => {
          setForm(serviceFormFromService(service));
          setMessage(null);
        }}
      />

      <ServiceEditorForm
        categories={categories}
        form={form}
        isSaving={isSaving}
        isUploading={isUploading}
        message={message}
        onChange={updateForm}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
