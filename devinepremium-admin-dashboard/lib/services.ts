export type ServicePricingMode = "hourly" | "package" | "quantity" | "area" | "quote";

export interface ServiceOptionChoice {
  label: string;
  value: string;
  price?: number;
}

export interface ServiceOption {
  id: string;
  label: string;
  price?: number;
  min?: number;
  type: "checkbox" | "radio" | "quantity" | "select";
  options?: ServiceOptionChoice[];
  defaultValue?: unknown;
}

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

export interface ManagedService {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  basePrice: number;
  priceUnit?: string | null;
  pricingMode: ServicePricingMode;
  categoryId?: string | null;
  pricingConfig: ServicePricingConfig;
  options: ServiceOption[];
  expectations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoriesResponse {
  categories: ServiceCategory[];
}

export interface ServicesResponse {
  services: ManagedService[];
}
