"use client";

import { Controller, useFormContext } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BookingFormValues } from "./bookingTypes";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

export function ScheduleStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col space-y-3">
        <Label>Date of Service</Label>
        <Controller
          name="schedule.date"
          control={control}
          rules={{ required: "Date of service is required." }}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start border-gray-300 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                  fromDate={new Date()}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          )}
        />
        <FieldError message={errors.schedule?.date?.message} />
      </div>

      <div className="space-y-3">
        <Label>Preferred Time (Start)</Label>
        <Controller
          name="schedule.timeSlot"
          control={control}
          rules={{ required: "Preferred time is required." }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-12 border-gray-300">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_TIME_SLOTS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time} {parseInt(time) < 12 ? "AM" : "PM"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.schedule?.timeSlot?.message} />
      </div>
    </div>
  );
}
