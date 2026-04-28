"use client";

import { format } from "date-fns";
import type { Service } from "@/lib/services";
import { Button } from "@/components/ui/button";
import type { BookingFormValues } from "./bookingTypes";
import { formatAED } from "./bookingUtils";

interface ConfirmationModalProps {
  addressSummary: string;
  bookingError: string;
  estimateLabel: string;
  formValues: BookingFormValues;
  isSubmittingBooking: boolean;
  service: Service;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({
  addressSummary,
  bookingError,
  estimateLabel,
  formValues,
  isSubmittingBooking,
  onCancel,
  onConfirm,
  service,
  total,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative bg-[#0D0D1A] p-6 text-center text-white">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-[#00B4D8] opacity-20 blur-3xl" />
          <h3 className="relative z-10 text-xl font-bold">Confirm Booking</h3>
          <p className="relative z-10 mt-1 text-sm text-gray-400">
            Review your details before sending
          </p>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Service
            </p>
            <p className="font-medium text-gray-900">{service.title}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Schedule
            </p>
            <p className="font-medium text-gray-900">
              {formValues.schedule.date
                ? format(formValues.schedule.date, "PPP")
                : "Date not set"}{" "}
              at {formValues.schedule.timeSlot || "Time not set"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Location
            </p>
            <p className="text-sm font-medium text-gray-900">
              {addressSummary || "Not Set"}
            </p>
            {formValues.address.mapLink && (
              <a
                href={formValues.address.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#00B4D8] hover:underline"
              >
                Open map pin
              </a>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Contact
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formValues.contact.fullName}
            </p>
            <p className="text-sm text-gray-600">{formValues.contact.phone}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Payment Method
            </p>
            <p className="text-sm font-medium capitalize text-gray-900">
              {formValues.payment.method === "online"
                ? "Online Payment"
                : "Cash Payment"}
            </p>
            <p className="text-xs text-gray-500">
              {formValues.payment.method === "online"
                ? "You will continue to the checkout screen after booking."
                : "Payment will stay marked as cash due until admin updates it."}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="font-semibold text-gray-700">{estimateLabel}</span>
            <span className="text-xl font-bold text-[#00B4D8]">
              {formatAED(total)} AED
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 bg-gray-50 p-6">
          {bookingError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bookingError}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#7B2D8B] text-white hover:bg-[#632271]"
              onClick={onConfirm}
              disabled={isSubmittingBooking}
            >
              {isSubmittingBooking
                ? "Creating booking..."
                : formValues.payment.method === "online"
                  ? "Confirm & Pay Online"
                  : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
