import { AppDataSource } from "../config/data-source";
import { ServiceCatalog } from "../entities/ServiceCatalog";
import { ServiceCategory } from "../entities/ServiceCategory";
import {
  BookingPricing,
  ServiceOption,
  ServicePricingConfig,
  ServicePricingMode,
  ServiceSnapshot,
} from "../types/domain";
import { HttpError } from "../utils/http";
import { DEFAULT_CATEGORIES } from "./defaultCategories";
import { DEFAULT_SERVICES } from "./defaultServices";

const serviceRepository = () => AppDataSource.getRepository(ServiceCatalog);
const categoryRepository = () => AppDataSource.getRepository(ServiceCategory);

export interface ServiceCatalogInput {
  title: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  basePrice?: number;
  priceUnit?: string | null;
  pricingMode: ServicePricingMode;
  pricingConfig?: ServicePricingConfig;
  options?: ServiceOption[];
  expectations?: string[];
  categoryId?: string | null;
}

const VAT_RATE_FALLBACK = 0.05;

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function optionChoiceLabel(option: ServiceOption, value: string) {
  return option.options?.find((choice) => choice.value === value)?.label ?? value;
}

function normalizeOptions(options?: ServiceOption[]) {
  return Array.isArray(options) ? options : [];
}

function normalizeExpectations(expectations?: string[]) {
  return Array.isArray(expectations)
    ? expectations.map((item) => item.trim()).filter(Boolean)
    : [];
}

function createServiceSnapshot(service: ServiceCatalog): ServiceSnapshot {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description,
    imageUrl: service.imageUrl,
    basePrice: service.basePrice,
    priceUnit: service.priceUnit,
    pricingMode: service.pricingMode,
    pricingConfig: service.pricingConfig,
    options: service.options,
    expectations: service.expectations,
  };
}

function calculateHourlyService(
  service: ServiceCatalog,
  selectedOptions: Record<string, unknown>,
) {
  const items: { label: string; amount: number }[] = [];
  const config = service.pricingConfig;
  const hourly = config.hourly;

  if (!hourly) {
    throw new HttpError(400, "Hourly service pricing is not configured.");
  }

  const hours = toNumber(selectedOptions[hourly.hoursOptionId]);
  const staffCount = hourly.staffCountOptionId
    ? toNumber(selectedOptions[hourly.staffCountOptionId], 1)
    : 1;
  const frequencyValue = config.recurring?.frequencyOptionId
    ? String(selectedOptions[config.recurring.frequencyOptionId] || "one-time")
    : "one-time";
  const recurringOption = config.recurring?.options.find(
    (item) => item.value === frequencyValue,
  );
  const visitsPerMonth = recurringOption?.visitsPerMonth ?? 1;
  const discountPercent = recurringOption?.discountPercent ?? 0;
  const visitsLabel = Number.isInteger(visitsPerMonth)
    ? String(visitsPerMonth)
    : visitsPerMonth.toFixed(1);
  const recurringSuffix =
    visitsPerMonth === 1 ? "" : ` x ${visitsLabel} visit(s)/month`;

  let subtotal = 0;
  let discount = 0;

  if (hours > 0 && staffCount > 0) {
    const laborTotal = hours * staffCount * hourly.rate * visitsPerMonth;
    subtotal += laborTotal;
    items.push({
      label: `${staffCount} Staff x ${hours} Hour(s) @ ${hourly.rate} AED/hr${recurringSuffix}`,
      amount: laborTotal,
    });
  }

  for (const option of service.options) {
    if (option.id === hourly.hoursOptionId || option.id === hourly.staffCountOptionId) {
      continue;
    }

    if (option.id === config.recurring?.frequencyOptionId) {
      continue;
    }

    const value = selectedOptions[option.id];
    if (option.type !== "checkbox" || !Array.isArray(value)) {
      continue;
    }

    for (const selected of value) {
      const choice = option.options?.find((item) => item.value === selected);
      const price = choice?.price ?? 0;
      if (price > 0) {
        const addOnTotal = price * visitsPerMonth;
        subtotal += addOnTotal;
        items.push({
          label: `${choice?.label ?? selected}${recurringSuffix}`,
          amount: addOnTotal,
        });
      }
    }
  }

  if (discountPercent > 0 && subtotal > 0) {
    discount = subtotal * (discountPercent / 100);
  }

  return { subtotal, discount, discountLabel: `Offer (${discountPercent}%)`, items };
}

function calculateGenericService(
  service: ServiceCatalog,
  selectedOptions: Record<string, unknown>,
) {
  let subtotal = 0;
  const items: { label: string; amount: number }[] = [];

  if (service.pricingMode === "quote") {
    const startingFrom = service.pricingConfig.quote?.startingFrom ?? service.basePrice;
    if (startingFrom > 0) {
      subtotal += startingFrom;
      items.push({ label: "Starting estimate", amount: startingFrom });
    }
  }

  for (const option of service.options) {
    const value = selectedOptions[option.id];

    if (option.type === "quantity") {
      const quantity = toNumber(value ?? option.defaultValue);
      const price = option.price ?? 0;
      if (quantity > 0 && price > 0) {
        const lineTotal = quantity * price;
        subtotal += lineTotal;
        items.push({ label: `${option.label} (x${quantity})`, amount: lineTotal });
      }
      continue;
    }

    if (option.type === "checkbox" && Array.isArray(value)) {
      for (const selected of value) {
        const choice = option.options?.find((item) => item.value === selected);
        const price = choice?.price ?? 0;
        if (price > 0) {
          subtotal += price;
          items.push({ label: choice?.label ?? String(selected), amount: price });
        }
      }
      continue;
    }

    if ((option.type === "select" || option.type === "radio") && value) {
      const selectedValue = String(value);
      const choice = option.options?.find((item) => item.value === selectedValue);
      const price = choice?.price ?? 0;
      if (price > 0) {
        subtotal += price;
        items.push({ label: choice?.label ?? optionChoiceLabel(option, selectedValue), amount: price });
      }
    }
  }

  return { subtotal, discount: 0, discountLabel: null, items };
}

function applyServiceDefaults(
  service: Pick<ServiceCatalog, "options">,
  selectedOptions: Record<string, unknown>,
) {
  return service.options.reduce<Record<string, unknown>>((acc, option) => {
    if (option.defaultValue !== undefined && acc[option.id] === undefined) {
      acc[option.id] = option.defaultValue;
    }
    return acc;
  }, { ...selectedOptions });
}

function applyInput(service: ServiceCatalog, input: ServiceCatalogInput) {
  service.title = input.title.trim();
  service.slug = slugify(input.slug || input.title);
  service.description = input.description?.trim() || null;
  service.imageUrl = input.imageUrl?.trim() || null;
  service.isActive = input.isActive ?? true;
  service.sortOrder = input.sortOrder ?? 0;
  service.basePrice = input.basePrice ?? 0;
  service.priceUnit = input.priceUnit?.trim() || null;
  service.pricingMode = input.pricingMode;
  service.pricingConfig = input.pricingConfig ?? { vatRate: VAT_RATE_FALLBACK };
  service.options = normalizeOptions(input.options);
  service.expectations = normalizeExpectations(input.expectations);
  service.categoryId = input.categoryId || null;
}

export const serviceCatalogService = {
  async ensureSeedCategories() {
    const count = await categoryRepository().count();
    if (count > 0) return;

    const categories = DEFAULT_CATEGORIES.map((input) => {
      const category = categoryRepository().create();
      category.title = input.title;
      category.slug = input.slug;
      category.description = input.description || null;
      category.sortOrder = input.sortOrder;
      category.isActive = true;
      return category;
    });

    await categoryRepository().save(categories);
  },

  async ensureSeedServices() {
    await this.ensureSeedCategories();
    const categories = await categoryRepository().find();

    const count = await serviceRepository().count();
    if (count === 0) {
      const services = DEFAULT_SERVICES.map((input) => {
        const service = serviceRepository().create();
        applyInput(service, input);

        if (input.categorySlug) {
          const category = categories.find((c) => c.slug === input.categorySlug);
          if (category) {
            service.categoryId = category.id;
          }
        }

        return service;
      });

      await serviceRepository().save(services);
    } else {
      // Retro-fix: Update existing services with categories if missing
      const existingServices = await serviceRepository().find({ where: { categoryId: undefined } });
      if (existingServices.length > 0) {
        for (const service of existingServices) {
          const defaultInput = DEFAULT_SERVICES.find((s) => s.slug === service.slug);
          if (defaultInput?.categorySlug) {
            const category = categories.find((c) => c.slug === defaultInput.categorySlug);
            if (category) {
              service.categoryId = category.id;
            }
          }
        }
        await serviceRepository().save(existingServices);
      }
    }
  },

  async listCategories(options: { activeOnly?: boolean } = {}) {
    return categoryRepository().find({
      where: options.activeOnly ? { isActive: true } : {},
      order: { sortOrder: "ASC", title: "ASC" },
    });
  },

  async listServices(options: { activeOnly?: boolean; categoryId?: string } = {}) {
    const qb = serviceRepository()
      .createQueryBuilder("service")
      .leftJoinAndSelect("service.category", "category")
      .orderBy("service.sortOrder", "ASC")
      .addOrderBy("service.title", "ASC");

    if (options.activeOnly) {
      qb.andWhere("service.isActive = :isActive", { isActive: true });
    }

    if (options.categoryId) {
      qb.andWhere("service.categoryId = :categoryId", { categoryId: options.categoryId });
    }

    return qb.getMany();
  },

  async getServiceBySlug(slug: string, options: { activeOnly?: boolean } = {}) {
    const service = await serviceRepository().findOne({
      where: {
        slug,
        ...(options.activeOnly ? { isActive: true } : {}),
      },
      relations: ["category"],
    });

    if (!service) {
      throw new HttpError(404, "Service not found.");
    }

    return service;
  },

  async getServiceById(id: string) {
    const service = await serviceRepository().findOne({
      where: { id },
      relations: ["category"],
    });
    if (!service) {
      throw new HttpError(404, "Service not found.");
    }
    return service;
  },

  async createService(input: ServiceCatalogInput) {
    const service = serviceRepository().create();
    applyInput(service, input);
    return serviceRepository().save(service);
  },

  async updateService(id: string, input: ServiceCatalogInput) {
    const service = await this.getServiceById(id);
    applyInput(service, input);
    return serviceRepository().save(service);
  },

  async deleteService(id: string) {
    const service = await this.getServiceById(id);
    await serviceRepository().remove(service);
    return service;
  },

  calculatePricing(
    service: ServiceCatalog,
    rawOptions: Record<string, unknown>,
  ): BookingPricing {
    const selectedOptions = applyServiceDefaults(service, rawOptions);
    const result =
      service.pricingMode === "hourly"
        ? calculateHourlyService(service, selectedOptions)
        : calculateGenericService(service, selectedOptions);
    const subtotal = round2(result.subtotal);
    const discount = round2(result.discount);
    const taxable = Math.max(0, subtotal - discount);
    const vatRate = service.pricingConfig.vatRate ?? VAT_RATE_FALLBACK;
    const vat = round2(taxable * vatRate);
    const lineItems = [...result.items];

    if (discount > 0) {
      lineItems.push({
        label: result.discountLabel || "Discount",
        amount: -discount,
      });
    }

    lineItems.push({
      label: `VAT (${Math.round(vatRate * 100)}%)`,
      amount: vat,
    });

    return {
      subtotal,
      discount,
      vat,
      total: round2(taxable + vat),
      lineItems,
    };
  },

  createServiceSnapshot,
};
