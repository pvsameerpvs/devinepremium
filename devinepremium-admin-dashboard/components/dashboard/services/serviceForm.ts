import type {
  ManagedService,
  ServiceOption,
  ServiceOptionChoice,
  ServicePricingMode,
} from "@/lib/services";

export type ServiceFormState = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  pricingMode: ServicePricingMode;
  basePrice: number;
  priceUnit: string;
  expectationsText: string;
  hourlyRate: number;
  defaultHours: number;
  minHours: number;
  defaultStaffCount: number;
  recurringEnabled: boolean;
  packagesText: string;
  quantityText: string;
  areaRate: number;
  defaultArea: number;
  quoteStartingFrom: number;
  addOnsText: string;
  categoryId: string;
};

export const servicePricingModes: Array<{
  value: ServicePricingMode;
  label: string;
  help: string;
}> = [
  { value: "hourly", label: "Hourly", help: "Cleaning style: staff x hours" },
  { value: "package", label: "Package", help: "Painting, AC, deep cleaning" },
  { value: "quantity", label: "Quantity", help: "Sofa, carpet, mattress items" },
  { value: "area", label: "Area/SQM", help: "Commercial or texture work" },
  { value: "quote", label: "Quote", help: "Manual estimate or project work" },
];

const defaultRecurringOptions = [
  { value: "one-time", label: "One Time", visitsPerMonth: 1, discountPercent: 0 },
  { value: "weekly", label: "Once a Week", visitsPerMonth: 4, discountPercent: 5 },
  { value: "2-times-weekly", label: "Twice a Week", visitsPerMonth: 8, discountPercent: 10 },
  { value: "3-times-weekly", label: "3 Times a Week", visitsPerMonth: 12, discountPercent: 15 },
];

export function slugifyService(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
}

function parsePriceLines(value: string): ServiceOptionChoice[] {
  const valueCounts = new Map<string, number>();
  const usedValues = new Set<string>();

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawLabel, rawPrice] = line.includes("=")
        ? line.split("=")
        : line.split(",");
      const label = rawLabel?.trim() || "Item";
      const price = Number(rawPrice);

      return {
        label: Number.isFinite(price) ? `${label} (${price} AED)` : label,
        value: createUniqueChoiceValue(slugifyService(label), valueCounts, usedValues),
        price: Number.isFinite(price) ? price : 0,
      };
    });
}

function createUniqueChoiceValue(
  value: string,
  counts: Map<string, number>,
  usedValues: Set<string>,
) {
  const baseValue = value || "option";
  let count = (counts.get(baseValue) ?? 0) + 1;
  let uniqueValue = count === 1 ? baseValue : `${baseValue}-${count}`;

  while (usedValues.has(uniqueValue)) {
    count += 1;
    uniqueValue = `${baseValue}-${count}`;
  }

  counts.set(baseValue, count);
  usedValues.add(uniqueValue);
  return uniqueValue;
}

function formatChoices(choices?: ServiceOptionChoice[]) {
  return (choices ?? [])
    .map(
      (choice) =>
        `${choice.label.replace(/\s*\([0-9.]+\s*AED\)$/i, "")}=${choice.price ?? 0}`,
    )
    .join("\n");
}

function formatQuantityOptions(options: ServiceOption[]) {
  return options
    .filter((option) => option.type === "quantity" && option.price)
    .map(
      (option) =>
        `${option.label.replace(/\s*[-(].*$/i, "")}=${option.price ?? 0}`,
    )
    .join("\n");
}

export function createEmptyServiceForm(): ServiceFormState {
  return {
    id: "",
    title: "",
    slug: "",
    description: "",
    imageUrl: "/hero-cleaning.jpg",
    isActive: true,
    sortOrder: 0,
    pricingMode: "package",
    basePrice: 0,
    priceUnit: "starting from",
    expectationsText: "",
    hourlyRate: 35,
    defaultHours: 4,
    minHours: 2,
    defaultStaffCount: 1,
    recurringEnabled: false,
    packagesText: "Standard Service=199",
    quantityText: "",
    areaRate: 10,
    defaultArea: 50,
    quoteStartingFrom: 1000,
    addOnsText: "",
    categoryId: "",
  };
}

export function serviceFormFromService(service: ManagedService): ServiceFormState {
  const packageOption = service.options.find(
    (option) =>
      (option.type === "select" || option.type === "radio") &&
      option.id !== service.pricingConfig.recurring?.frequencyOptionId &&
      option.options?.some((choice) => choice.price),
  );
  const addOnOption = service.options.find((option) => option.type === "checkbox");
  const hourly = service.pricingConfig.hourly;
  const hoursOption = service.options.find((option) => option.id === hourly?.hoursOptionId);
  const staffOption = service.options.find(
    (option) => option.id === hourly?.staffCountOptionId,
  );
  const areaOption =
    service.pricingMode === "area"
      ? service.options.find((option) => option.type === "quantity")
      : undefined;

  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description || "",
    imageUrl: service.imageUrl || "/hero-cleaning.jpg",
    isActive: service.isActive,
    sortOrder: service.sortOrder,
    pricingMode: service.pricingMode,
    basePrice: service.basePrice,
    priceUnit: service.priceUnit || "",
    expectationsText: service.expectations.join("\n"),
    hourlyRate: hourly?.rate ?? service.basePrice ?? 35,
    defaultHours: Number(hoursOption?.defaultValue ?? 4),
    minHours: hoursOption?.min ?? 2,
    defaultStaffCount: Number(staffOption?.defaultValue ?? 1),
    recurringEnabled: Boolean(service.pricingConfig.recurring?.enabled),
    packagesText: formatChoices(packageOption?.options),
    quantityText: formatQuantityOptions(
      service.options.filter(
        (option) =>
          option.id !== hourly?.hoursOptionId &&
          option.id !== hourly?.staffCountOptionId,
      ),
    ),
    areaRate: areaOption?.price ?? 10,
    defaultArea: Number(areaOption?.defaultValue ?? 50),
    quoteStartingFrom:
      service.pricingConfig.quote?.startingFrom ?? service.basePrice ?? 1000,
    addOnsText: formatChoices(addOnOption?.options),
    categoryId: service.categoryId || "",
  };
}

function buildServiceOptions(form: ServiceFormState): ServiceOption[] {
  const options: ServiceOption[] = [];
  const addOns = parsePriceLines(form.addOnsText);
  const packages = parsePriceLines(form.packagesText);
  const quantityItems = parsePriceLines(form.quantityText);

  if (form.recurringEnabled) {
    options.push({
      id: "frequency",
      label: "Select your booking frequency",
      type: "select",
      options: defaultRecurringOptions.map(({ label, value }) => ({ label, value })),
      defaultValue: "one-time",
    });
  }

  if (form.pricingMode === "hourly") {
    options.push(
      {
        id: "crew",
        label: `Number of staff (${form.hourlyRate} AED/hr each)`,
        type: "quantity",
        defaultValue: form.defaultStaffCount,
        min: 1,
      },
      {
        id: "hours",
        label: "Hours",
        type: "quantity",
        defaultValue: form.defaultHours,
        min: form.minHours,
      },
    );
  }

  if (form.pricingMode === "package" && packages.length) {
    options.push({
      id: "service-type",
      label: "Service Type",
      type: "select",
      options: packages,
      defaultValue: packages[0]?.value,
    });
  }

  if (form.pricingMode === "quantity" || form.pricingMode === "package") {
    quantityItems.forEach((item) => {
      options.push({
        id: item.value,
        label: item.label,
        type: "quantity",
        price: item.price,
        defaultValue: 0,
        min: 0,
      });
    });
  }

  if (form.pricingMode === "area") {
    options.push({
      id: "area-size",
      label: `Area Size (SQM) - ${form.areaRate} AED/SQM`,
      type: "quantity",
      price: form.areaRate,
      defaultValue: form.defaultArea,
      min: 1,
    });
  }

  if (addOns.length) {
    options.push({
      id: "extras",
      label: "Add-ons",
      type: "checkbox",
      options: addOns,
      defaultValue: [],
    });
  }

  return options;
}

export function buildServicePayload(form: ServiceFormState) {
  const options = buildServiceOptions(form);
  const basePrice =
    form.pricingMode === "hourly"
      ? form.hourlyRate
      : form.pricingMode === "area"
        ? form.areaRate
        : form.pricingMode === "quote"
          ? form.quoteStartingFrom
          : form.basePrice;

  return {
    title: form.title,
    slug: form.slug || slugifyService(form.title),
    description: form.description || null,
    imageUrl: form.imageUrl || null,
    isActive: form.isActive,
    sortOrder: form.sortOrder,
    basePrice,
    priceUnit: form.priceUnit || null,
    pricingMode: form.pricingMode,
    pricingConfig: {
      vatRate: 0.05,
      hourly:
        form.pricingMode === "hourly"
          ? {
              rate: form.hourlyRate,
              hoursOptionId: "hours",
              staffCountOptionId: "crew",
            }
          : undefined,
      recurring: form.recurringEnabled
        ? {
            enabled: true,
            frequencyOptionId: "frequency",
            options: defaultRecurringOptions,
          }
        : undefined,
      quote:
        form.pricingMode === "quote"
          ? {
              startingFrom: form.quoteStartingFrom,
            }
          : undefined,
    },
    options,
    categoryId: form.categoryId || null,
    expectations: form.expectationsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}
