"use client";

import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepErrorSummaryProps {
  className?: string;
}

export function StepErrorSummary({ className }: StepErrorSummaryProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <div>
        <p className="text-sm font-bold text-red-800">
          Please correct the following:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {Object.entries(errors).map(([key, error]: [string, any]) => {
            // Recursively find messages in nested objects
            const getMessages = (obj: any): string[] => {
              if (!obj) return [];
              if (obj.message) return [obj.message];
              return Object.values(obj).flatMap((v) => getMessages(v));
            };

            return getMessages(error).map((msg, i) => (
              <li key={`${key}-${i}`} className="text-xs font-medium text-red-700">
                {msg}
              </li>
            ));
          })}
        </ul>
      </div>
    </div>
  );
}
