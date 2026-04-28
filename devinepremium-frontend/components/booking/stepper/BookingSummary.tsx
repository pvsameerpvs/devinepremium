"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import type { Service } from "@/lib/services";
import type { PricingLineItem } from "./bookingTypes";
import { formatAED } from "./bookingUtils";

interface BookingSummaryProps {
  estimateLabel: string;
  lineItems: PricingLineItem[];
  service: Service;
  total: number;
}

export function BookingSummary({
  estimateLabel,
  lineItems,
  service,
  total,
}: BookingSummaryProps) {
  return (
    <div className="w-full space-y-6 lg:sticky lg:top-24 lg:col-span-4 lg:mt-0">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
        <div className="relative overflow-hidden bg-[#0D0D1A] p-6 text-center text-white">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-[#00B4D8] opacity-20 blur-3xl" />
          {service.imageUrl && (
            <div className="relative z-10 mx-auto mb-4 h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/10 shadow-xl">
              <Image
                src={service.imageUrl}
                alt={service.title}
                fill
                sizes="96px"
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <h3 className="relative z-10 text-lg font-bold">Booking Summary</h3>
          <p className="relative z-10 mt-1 text-xs uppercase tracking-widest text-gray-400">
            {service.title}
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="space-y-3">
            {lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex justify-between border-b border-gray-50 py-2 text-sm last:border-0"
                >
                  <span className="max-w-[70%] text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">
                    {formatAED(item.amount)} AED
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm italic text-muted-foreground">
                Select options to see price breakdown
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
            <span className="font-medium text-gray-600">{estimateLabel}</span>
            <span className="text-2xl font-bold text-[#00B4D8]">
              {formatAED(total)}{" "}
              <span className="text-xs font-normal text-gray-400">AED</span>
            </span>
          </div>

          <div className="px-4 text-center text-xs leading-relaxed text-gray-400">
            *Final price may vary based on actual inspection or changes in requirements.
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 p-4 text-center">
          <p className="text-xs font-semibold text-gray-500">Need Help? Call Us</p>
          <div className="flex flex-col items-center gap-2">
            <a
              href="tel:+971563758229"
              className="text-lg font-bold text-[#7B2D8B] hover:underline"
            >
              +971 56 375 8229
            </a>
            <a
              href="tel:+971529769550"
              className="text-lg font-bold text-[#7B2D8B] hover:underline"
            >
              +971 52 976 9550
            </a>
            <a
              href="tel:+971523960074"
              className="text-lg font-bold text-[#7B2D8B] hover:underline"
            >
              +971 52 396 0074
            </a>
          </div>
        </div>
      </div>

      {service.expectations && service.expectations.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <h4 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
            <span className="h-6 w-1 rounded-full bg-[#00B4D8]" />
            What to Expect
          </h4>
          <ul className="space-y-3">
            {service.expectations.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-center text-sm text-gray-600"
              >
                <Check className="mr-3 h-4 w-4 shrink-0 text-[#7B2D8B]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
