import type { Service } from "@/lib/services";
import type { PricingBreakdown, PricingLineItem } from "./bookingTypes";
import { round2, VAT_RATE } from "./bookingUtils";

export function calculateBookingBreakdown(
  service: Service,
  serviceOptions: Record<string, unknown>,
): PricingBreakdown {
  const selectedOptions = service.options.reduce<Record<string, unknown>>(
    (acc, option) => {
      if (option.defaultValue !== undefined && acc[option.id] === undefined) {
        acc[option.id] = option.defaultValue;
      }

      return acc;
    },
    { ...serviceOptions },
  );
  let subtotal = 0;
  let discount = 0;
  let discountLabel: string | null = null;
  const items: PricingLineItem[] = [];

  const pricingMode = service.pricingMode || "package";
  const pricingConfig = service.pricingConfig || {};

  if (pricingMode === "hourly" && pricingConfig.hourly) {
    const hours =
      Number(selectedOptions[pricingConfig.hourly.hoursOptionId]) || 0;
    const crew = pricingConfig.hourly.staffCountOptionId
      ? Number(selectedOptions[pricingConfig.hourly.staffCountOptionId]) || 1
      : 1;
    const rate = pricingConfig.hourly.rate || service.basePrice || 0;

    if (hours > 0) {
      const laborTotal = hours * crew * rate;
      subtotal += laborTotal;
      items.push({
        label: `${crew} Staff x ${hours} Hour(s) @ ${rate} AED/hr`,
        amount: laborTotal,
      });
    }
  } else if (
    pricingMode !== "quote" &&
    service.basePrice > 0 &&
    service.priceUnit !== "starting from"
  ) {
    subtotal += service.basePrice;
    items.push({ label: "Base Price", amount: service.basePrice });
  }

  service.options.forEach((option) => {
    const value = selectedOptions[option.id];
    if (!value) {
      return;
    }

    if (option.type === "quantity" && option.price) {
      const quantity = Number(value);
      if (quantity > 0) {
        const lineTotal = quantity * option.price;
        subtotal += lineTotal;
        items.push({ label: `${option.label} (x${quantity})`, amount: lineTotal });
      }
      return;
    }

    if (option.type === "checkbox" && Array.isArray(value) && option.options) {
      value.forEach((selectedValue: string) => {
        const choice = option.options?.find((item) => item.value === selectedValue);
        if (choice?.price) {
          subtotal += choice.price;
          items.push({ label: choice.label, amount: choice.price });
        }
      });
      return;
    }

    if ((option.type === "select" || option.type === "radio") && option.options) {
      if (option.id === pricingConfig.recurring?.frequencyOptionId) {
        return;
      }

      const choice = option.options.find((item) => item.value === value);
      if (choice?.price) {
        subtotal += choice.price;
        items.push({ label: choice.label, amount: choice.price });
      }
    }
  });

  if (pricingConfig.recurring?.enabled && pricingConfig.recurring.frequencyOptionId) {
    const frequencyValue = String(
      selectedOptions[pricingConfig.recurring.frequencyOptionId] || "one-time",
    );
    const frequencyOption = pricingConfig.recurring.options.find(
      (option) => option.value === frequencyValue,
    );

    if (frequencyOption) {
      const visitsPerMonth = frequencyOption.visitsPerMonth || 1;
      if (visitsPerMonth > 1) {
        const monthlySubtotal = subtotal * visitsPerMonth;
        const monthlyDiscount =
          (monthlySubtotal * (frequencyOption.discountPercent || 0)) / 100;

        items.forEach((item) => {
          item.label = `${item.label} (x${visitsPerMonth} visits/mo)`;
          item.amount *= visitsPerMonth;
        });

        subtotal = monthlySubtotal;
        discount = monthlyDiscount;
        if (discount > 0) {
          discountLabel = `${frequencyOption.label} Discount (${frequencyOption.discountPercent}%)`;
        }
      }
    }
  }

  const discountRounded = round2(discount);
  const taxable = Math.max(0, subtotal - discountRounded);
  const vat = round2(taxable * VAT_RATE);
  const total = round2(taxable + vat);
  const finalItems = [...items];

  if (discountRounded > 0) {
    finalItems.push({ label: discountLabel || "Discount", amount: -discountRounded });
  }

  finalItems.push({ label: `VAT (${Math.round(VAT_RATE * 100)}%)`, amount: vat });

  return {
    subtotal: round2(subtotal),
    discount: discountRounded,
    vat,
    total,
    items: finalItems,
  };
}
