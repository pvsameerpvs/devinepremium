"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { Service } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PricingLineItem } from "./bookingTypes";
import { formatAED } from "./bookingUtils";

interface ServiceOptionsStepProps {
  estimateLabel: string;
  estimateNote: string;
  isQuoteLoading: boolean;
  lineItems: PricingLineItem[];
  quoteError: string;
  service: Service;
  serviceOptions: Record<string, unknown>;
  total: number;
  onCheckboxOptionChange: (
    key: string,
    value: string,
    isChecked: boolean,
  ) => void;
  onServiceOptionChange: (key: string, value: unknown) => void;
}

export function ServiceOptionsStep({
  estimateLabel,
  estimateNote,
  isQuoteLoading,
  lineItems,
  quoteError,
  service,
  serviceOptions,
  total,
  onCheckboxOptionChange,
  onServiceOptionChange,
}: ServiceOptionsStepProps) {
  function getCheckboxOptionValues(key: string) {
    const value = serviceOptions[key];
    return Array.isArray(value) ? value.map(String) : [];
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6">
        {service.options.map((option) => (
          <div key={option.id} className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-lg font-semibold text-gray-800">
                {option.label}
              </Label>
              {option.price && option.type === "quantity" && (
                <span className="text-sm font-medium text-muted-foreground">
                  {option.price} AED / unit
                </span>
              )}
            </div>

            {option.type === "radio" && option.options && (
              <RadioGroup
                onValueChange={(value) => onServiceOptionChange(option.id, value)}
                value={String(serviceOptions[option.id] ?? option.defaultValue ?? "")}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {option.options.map((choice) => {
                  const isSelected = serviceOptions[option.id] === choice.value;

                  return (
                    <div key={`${option.id}-${choice.value}`} className="relative">
                      <RadioGroupItem
                        value={choice.value}
                        id={`${option.id}-${choice.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`${option.id}-${choice.value}`}
                        className={cn(
                          "flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all hover:border-[#00B4D8]/50 hover:bg-slate-50",
                          isSelected
                            ? "border-[#00B4D8] bg-[#00B4D8]/5 shadow-sm"
                            : "border-gray-200 bg-white",
                        )}
                      >
                        <span className="text-base font-semibold">
                          {choice.label}
                        </span>
                        {choice.price && (
                          <span className="mt-1 text-sm text-gray-500">
                            + {choice.price} AED
                          </span>
                        )}
                      </Label>
                      {isSelected && (
                        <div className="absolute right-4 top-4 text-[#00B4D8]">
                          <Check
                            className="h-5 w-5 rounded-full bg-[#00B4D8]/20 p-1"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            )}

            {option.type === "select" && option.options && (
              <>
                <Select
                  onValueChange={(value) => onServiceOptionChange(option.id, value)}
                  value={String(serviceOptions[option.id] ?? option.defaultValue ?? "")}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-[#00B4D8]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {option.options.map((choice) => (
                      <SelectItem key={`${option.id}-${choice.value}`} value={choice.value}>
                        <span className="flex w-full justify-between gap-4">
                          <span>{choice.label}</span>
                          {choice.price && (
                            <span className="ml-auto text-muted-foreground">
                              {choice.price} AED
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {service.id === "maid-cleaning" && option.id === "frequency" && (
                  <p className="ml-1 mt-1 flex items-center gap-1 text-sm font-medium text-[#00B4D8]">
                    Offers: weekly 5%, 2x/week 10%, 3+/week 15%, every 3-6 weeks 5%
                  </p>
                )}
              </>
            )}

            {option.type === "quantity" && (
              <div className="space-y-2">
                <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 sm:w-fit sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-gray-300 hover:border-[#00B4D8] hover:text-[#00B4D8] disabled:opacity-40"
                    disabled={
                      Number(serviceOptions[option.id] ?? option.defaultValue ?? 0) <=
                      (option.min ?? 0)
                    }
                    onClick={() => {
                      const current = Number(
                        serviceOptions[option.id] ?? option.defaultValue ?? 0,
                      );
                      const minValue = option.min ?? 0;
                      if (current > minValue) {
                        onServiceOptionChange(option.id, current - 1);
                      }
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="mx-6 text-center">
                    <span className="block text-2xl font-bold text-gray-900">
                      {String(serviceOptions[option.id] ?? option.defaultValue ?? 0)}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {option.id === "hours" ? "Hours" : "Count"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-gray-300 hover:border-[#00B4D8] hover:text-[#00B4D8]"
                    onClick={() => {
                      const current = Number(
                        serviceOptions[option.id] ?? option.defaultValue ?? 0,
                      );
                      onServiceOptionChange(option.id, current + 1);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {option.id === "hours" && option.min && (
                  <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
                    Minimum booking: {option.min} hours
                  </p>
                )}
              </div>
            )}

            {option.type === "checkbox" && option.options && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {option.options.map((choice) => {
                  const isChecked = getCheckboxOptionValues(option.id).includes(
                    choice.value,
                  );

                  return (
                    <div
                      key={`${option.id}-${choice.value}`}
                      className={cn(
                        "flex items-center rounded-lg border-2 p-3 transition-all",
                        isChecked
                          ? "border-[#00B4D8] bg-[#00B4D8]/5"
                          : "border-gray-100 bg-white hover:border-gray-200",
                      )}
                    >
                      <Checkbox
                        id={`${option.id}-${choice.value}`}
                        checked={isChecked}
                        className="data-[state=checked]:border-[#00B4D8] data-[state=checked]:bg-[#00B4D8]"
                        onCheckedChange={(checked) =>
                          onCheckboxOptionChange(
                            option.id,
                            choice.value,
                            checked === true,
                          )
                        }
                      />
                      <div className="ml-3 flex-1">
                        <Label
                          htmlFor={`${option.id}-${choice.value}`}
                          className="block cursor-pointer font-medium"
                        >
                          {choice.label}
                        </Label>
                        {choice.price && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            + {choice.price} AED
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-6 text-white shadow-lg sm:flex-row">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            {estimateLabel}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-[#00B4D8]">
              {formatAED(total)}
            </p>
            <span className="text-lg font-medium text-slate-300">AED</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{estimateNote}</p>
          {isQuoteLoading && (
            <p className="mt-1 text-xs text-slate-400">Checking live price...</p>
          )}
          {quoteError && !isQuoteLoading && (
            <p className="mt-1 text-xs text-amber-300">{quoteError}</p>
          )}
        </div>

        <div className="hidden space-y-1 text-right text-sm text-slate-300 sm:block">
          {lineItems.slice(0, 3).map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex justify-end gap-3 text-slate-400">
              <span>{item.label}:</span>
              <span className="text-slate-200">{formatAED(item.amount)}</span>
            </div>
          ))}
          {lineItems.length > 3 && (
            <div className="text-slate-500">
              + {lineItems.length - 3} more items...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
