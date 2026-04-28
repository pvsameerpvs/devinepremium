
import { apiRequest } from "./api";

export interface ServiceOption {
  id: string;
  label: string;
  price?: number;
  min?: number;
  type: "checkbox" | "radio" | "quantity" | "select";
  options?: { label: string; value: string; price?: number }[];
  defaultValue?: any;
}

export type ServicePricingMode = "hourly" | "package" | "quantity" | "area" | "quote";

export interface ServicePricingConfig {
  vatRate?: number;
  recurring?: {
    enabled: boolean;
    frequencyOptionId?: string;
    options: Array<{
      value: string;
      label: string;
      visitsPerMonth: number;
      discountPercent: number;
    }>;
  };
  hourly?: {
    rate: number;
    hoursOptionId: string;
    staffCountOptionId?: string;
  };
  quote?: {
    startingFrom?: number;
  };
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description?: string;
  basePrice: number;
  priceUnit?: string; // e.g. "per hour", "starting from"
  image?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  pricingMode?: ServicePricingMode;
  pricingConfig?: ServicePricingConfig;
  options: ServiceOption[];
  minHours?: number;
  expectations?: string[];
}

export interface ServiceQuote {
  serviceId: string;
  serviceSlug: string;
  pricing: {
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
    lineItems: { label: string; amount: number }[];
  };
}

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

function normalizeApiService(service: Service): Service {
  return {
    ...service,
    image: service.image || service.imageUrl || "/hero-cleaning.jpg",
    expectations: service.expectations ?? [],
    options: service.options ?? [],
  };
}

export async function fetchActiveServices(categoryId?: string): Promise<Service[]> {
  try {
    const url = categoryId ? `/api/v1/services?categoryId=${categoryId}` : "/api/v1/services";
    const response = await apiRequest<{ services: Service[] }>(url, {
      method: "GET",
    });
    return (response.services || []).map(normalizeApiService);
  } catch (error) {
    console.error("Failed to fetch active services:", error);
    return [];
  }
}

export async function fetchCategories(): Promise<ServiceCategory[]> {
  try {
    const response = await apiRequest<{ categories: ServiceCategory[] }>(
      "/api/v1/services/categories",
      { method: "GET" },
    );
    return response.categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function fetchServiceBySlug(slug: string): Promise<Service | undefined> {
  try {
    const response = await apiRequest<{ service: Service }>(
      `/api/v1/services/${slug}`,
      { method: "GET" },
    );
    return normalizeApiService(response.service);
  } catch (error) {
    console.error(`Failed to fetch service with slug ${slug}:`, error);
    return undefined;
  }
}

export async function fetchServiceQuote(
  slug: string,
  serviceOptions: Record<string, unknown>,
) {
  return apiRequest<ServiceQuote>(`/api/v1/services/${slug}/quote`, {
    method: "POST",
    body: JSON.stringify({ serviceOptions }),
  });
}
