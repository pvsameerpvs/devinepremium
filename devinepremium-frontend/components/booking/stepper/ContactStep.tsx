"use client";

import { Controller, useFormContext } from "react-hook-form";
import { StepErrorSummary } from "./StepErrorSummary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { BookingFormValues } from "./bookingTypes";

interface ContactStepProps {
  accountEmail: string;
  paymentMethod: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
      <span className="h-1 w-1 rounded-full bg-red-600" />
      {message}
    </p>
  );
}

export function ContactStep({
  accountEmail,
  paymentMethod,
}: ContactStepProps) {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<BookingFormValues>();

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepErrorSummary />
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          className={cn(
            "h-12 transition-colors",
            errors.contact?.fullName && "border-red-500 bg-red-50/50 focus:ring-red-200",
          )}
          placeholder="John Doe"
          {...register("contact.fullName", {
            required: "Full name is required.",
            minLength: {
              value: 2,
              message: "Full name must be at least 2 characters.",
            },
          })}
        />
        <FieldError message={errors.contact?.fullName?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className={cn(
            "h-12 transition-colors",
            errors.contact?.email && "border-red-500 bg-red-50/50 focus:ring-red-200",
          )}
          placeholder="john@example.com"
          readOnly={Boolean(accountEmail)}
          {...register("contact.email", {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            },
          })}
        />
        {accountEmail && (
          <p className="text-xs text-gray-500">
            Orders will be linked to your logged-in account email.
          </p>
        )}
        <FieldError message={errors.contact?.email?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          className={cn(
            "h-12 transition-colors",
            errors.contact?.phone && "border-red-500 bg-red-50/50 focus:ring-red-200",
          )}
          placeholder="+971 50 123 4567"
          {...register("contact.phone", {
            required: "Phone number is required.",
            minLength: {
              value: 7,
              message: "Enter a valid phone number.",
            },
          })}
        />
        <FieldError message={errors.contact?.phone?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="instructions">Additional Notes</Label>
        <textarea
          id="instructions"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Any specific requests, gate codes, or details..."
          {...register("contact.instructions")}
        />
      </div>

      <div className="grid gap-3">
        <Label>Payment Method</Label>
        <Controller
          name="payment.method"
          control={control}
          rules={{ required: "Payment method is required." }}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <Label
                htmlFor="payment-cash"
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all",
                  paymentMethod === "cash"
                    ? "border-[#00B4D8] bg-[#00B4D8]/5"
                    : "border-gray-200 bg-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="cash" id="payment-cash" />
                  <span className="font-semibold text-gray-900">Cash</span>
                </div>
                <span className="mt-2 text-xs text-gray-500">
                  Pay in cash when the team arrives or when the job is completed.
                </span>
              </Label>

              <Label
                htmlFor="payment-online"
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all",
                  paymentMethod === "online"
                    ? "border-[#7B2D8B] bg-[#7B2D8B]/5"
                    : "border-gray-200 bg-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="online" id="payment-online" />
                  <span className="font-semibold text-gray-900">
                    Online Payment
                  </span>
                </div>
                <span className="mt-2 text-xs text-gray-500">
                  Continue to the online checkout page after booking confirmation.
                </span>
              </Label>
            </RadioGroup>
          )}
        />
        <FieldError message={errors.payment?.method?.message} />
      </div>
    </div>
  );
}
