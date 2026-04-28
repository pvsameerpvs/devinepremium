import type { SavedAddressRecord } from "@/lib/account";
import type { Service } from "@/lib/services";
import type { BookingFormValues } from "./bookingTypes";

export const VAT_RATE = 0.05;

export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatAED(value: number) {
  const rounded = round2(value);
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAddressLabel(address: SavedAddressRecord) {
  return [address.label, address.location, address.city]
    .filter(Boolean)
    .join(" - ");
}

export function formatAddressLine(address: {
  building?: string | null;
  apartment?: string | null;
  location: string;
  city: string;
}) {
  return [address.building, address.apartment, address.location, address.city]
    .filter(Boolean)
    .join(", ");
}

export function createInitialServiceOptions(service: Service) {
  return service.options.reduce<Record<string, unknown>>((acc, option) => {
    if (option.defaultValue !== undefined) {
      acc[option.id] = option.defaultValue;
    }

    return acc;
  }, {});
}

export function createDefaultBookingValues(service: Service): BookingFormValues {
  return {
    serviceOptions: createInitialServiceOptions(service),
    address: {
      location: "",
      building: "",
      apartment: "",
      city: "",
      mapLink: "",
      lat: "",
      lng: "",
    },
    schedule: {
      date: undefined,
      timeSlot: "",
    },
    contact: {
      fullName: "",
      email: "",
      phone: "",
      instructions: "",
    },
    payment: {
      method: "cash",
    },
  };
}

export function buildMapLink(lat: string, lng: string) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function parseCoordsFromMapLink(value: string) {
  if (!value) {
    return null;
  }

  const qParamMatch = value.match(/[?&]q=([-0-9.]+),([-0-9.]+)/i);
  if (qParamMatch) {
    return { lat: qParamMatch[1], lng: qParamMatch[2] };
  }

  const atParamMatch = value.match(/@([-0-9.]+),([-0-9.]+)/i);
  if (atParamMatch) {
    return { lat: atParamMatch[1], lng: atParamMatch[2] };
  }

  return null;
}

export function getAddressSummary(address: BookingFormValues["address"]) {
  return [address.building, address.apartment, address.location, address.city]
    .filter(Boolean)
    .join(", ");
}

export function getEstimateCopy(service: Service, serviceOptions: Record<string, unknown>) {
  const frequency = String(serviceOptions.frequency || "one-time");
  const isMaidRecurring = service.id === "maid-cleaning" && frequency !== "one-time";

  return {
    estimateLabel: isMaidRecurring ? "Estimated Monthly Total" : "Estimated Total",
    estimateNote: isMaidRecurring
      ? "Includes recurring frequency pricing for approx. 4 weeks + 5% VAT"
      : "Includes selected options + 5% VAT",
  };
}
