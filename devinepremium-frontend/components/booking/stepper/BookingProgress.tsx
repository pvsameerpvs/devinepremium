"use client";

import { Check, Clock, CreditCard, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStepId } from "./bookingTypes";

export const BOOKING_STEPS: Array<{
  id: BookingStepId;
  title: string;
  icon: typeof CreditCard;
}> = [
  { id: "service", title: "Service Details", icon: CreditCard },
  { id: "address", title: "Address", icon: MapPin },
  { id: "schedule", title: "Schedule", icon: Clock },
  { id: "contact", title: "Contact", icon: User },
];

interface BookingProgressProps {
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -z-0 h-[2px] w-full -translate-y-1/2 bg-gray-100" />
        {BOOKING_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep >= index;
          const isCompleted = currentStep > index;

          return (
            <button
              key={step.id}
              type="button"
              className="group relative z-10 flex flex-col items-center"
              disabled={index > currentStep}
              onClick={() => onStepClick(index)}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-[3px] transition-all duration-300 sm:h-12 sm:w-12 sm:border-4",
                  isActive
                    ? "scale-110 border-[#00B4D8] bg-white text-[#00B4D8] shadow-md"
                    : "border-gray-200 bg-gray-50 text-gray-400",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 sm:h-6 sm:w-6" />
                ) : (
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </span>
              <span
                className={cn(
                  "mt-2 max-w-[65px] text-center text-[10px] font-medium leading-tight transition-colors duration-300 sm:mt-3 sm:max-w-none sm:text-sm",
                  isActive ? "font-bold text-gray-900" : "text-gray-400",
                )}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
