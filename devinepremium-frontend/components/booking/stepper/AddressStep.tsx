"use client";

import { Controller, useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";
import { type SavedAddressRecord } from "@/lib/account";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AddressStepProps, BookingFormValues } from "./bookingTypes";
import { formatAddressLine } from "./bookingUtils";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

function SavedAddressCard({
  address,
  isSelected,
  onSelect,
}: {
  address: SavedAddressRecord;
  isSelected: boolean;
  onSelect: (address: SavedAddressRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address)}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        isSelected
          ? "border-[#00B4D8] bg-white shadow-sm"
          : "border-cyan-100 bg-white/80 hover:border-cyan-200",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{address.label}</p>
        {address.isDefault && (
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Default
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {formatAddressLine(address)}
      </p>
      <p className="mt-3 text-xs font-medium text-cyan-700">
        {isSelected ? "Address selected" : "Use this address"}
      </p>
    </button>
  );
}

export function AddressStep({
  accountEmail,
  hasPinnedCoords,
  isLoadingAccountData,
  isLocating,
  isSearchingPlaces,
  locationError,
  mapContainerRef,
  onApplySavedAddress,
  onClearPin,
  onMapLinkChange,
  onPlaceQueryChange,
  onSaveAddressAsDefaultChange,
  onSaveAddressLabelChange,
  onSaveCurrentAddressChange,
  onSearchPlaces,
  onSelectPlaceResult,
  onUseCurrentLocation,
  placeQuery,
  placeResults,
  placeSearchError,
  saveAddressAsDefault,
  saveAddressLabel,
  saveCurrentAddress,
  savedAddresses,
  selectedSavedAddressId,
}: AddressStepProps) {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<BookingFormValues>();

  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {savedAddresses.length > 0 && (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Saved addresses
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Reuse one of your saved locations for a faster booking.
              </p>
            </div>
            {isLoadingAccountData && (
              <p className="text-xs font-medium text-cyan-700">
                Loading saved addresses...
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {savedAddresses.map((address) => (
              <SavedAddressCard
                key={address.id}
                address={address}
                isSelected={selectedSavedAddressId === address.id}
                onSelect={onApplySavedAddress}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="city">City</Label>
        <Controller
          name="address.city"
          control={control}
          rules={{ required: "City is required." }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="city" className="h-12">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.address?.city?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="placeSearch">Search Place & Pin on Map</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="placeSearch"
            placeholder="Search area, building, street..."
            className="h-12"
            value={placeQuery}
            onChange={(event) => {
              onPlaceQueryChange(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearchPlaces();
              }
            }}
          />
          <Button
            type="button"
            onClick={onSearchPlaces}
            disabled={isSearchingPlaces}
            className="h-12 sm:min-w-[120px]"
          >
            {isSearchingPlaces ? "Searching..." : "Search"}
          </Button>
        </div>
        {placeSearchError && <p className="text-sm text-red-600">{placeSearchError}</p>}
        {placeResults.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white">
            {placeResults.map((place) => (
              <button
                key={`${place.lat}-${place.lon}-${place.display_name}`}
                type="button"
                className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 last:border-b-0"
                onClick={() => onSelectPlaceResult(place)}
              >
                <p className="line-clamp-2 text-sm font-medium text-gray-900">
                  {place.display_name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Tap to pin this location
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Area / Location</Label>
        <Input
          id="location"
          placeholder="e.g. Dubai Marina, JLT..."
          className="h-12"
          {...register("address.location", {
            required: "Area / location is required.",
          })}
        />
        <FieldError message={errors.address?.location?.message} />
      </div>

      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:w-fit"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {isLocating ? "Getting Your Location..." : "Use Current Location & Pin"}
        </Button>
        {locationError && <p className="text-sm text-red-600">{locationError}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="building">Building / Villa</Label>
          <Input
            id="building"
            placeholder="Name or Number"
            className="h-12"
            {...register("address.building")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apartment">Flat / Unit No</Label>
          <Input
            id="apartment"
            placeholder="1204"
            className="h-12"
            {...register("address.apartment")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mapLink">Google Map Link (Optional)</Label>
        <Controller
          name="address.mapLink"
          control={control}
          render={({ field }) => (
            <Input
              id="mapLink"
              placeholder="https://www.google.com/maps?q=..."
              className="h-12"
              value={field.value}
              onChange={(event) => onMapLinkChange(event.target.value)}
            />
          )}
        />
      </div>

      <div className="grid gap-2">
        <Label>Map Pin Selector (Click Map)</Label>
        <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            aria-label="Interactive map. Click to pin and auto fill address."
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Controller
            name="address.lat"
            control={control}
            render={({ field: latField }) => (
              <Controller
                name="address.lng"
                control={control}
                render={({ field: lngField }) => (
                  <p
                    className={cn(
                      "text-xs",
                      hasPinnedCoords ? "text-emerald-600" : "text-muted-foreground",
                    )}
                  >
                    {hasPinnedCoords
                      ? `Pin selected: ${latField.value}, ${lngField.value}`
                      : "No pin selected yet. Click on map to drop a pin."}
                  </p>
                )}
              />
            )}
          />
          {hasPinnedCoords && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onClearPin}
            >
              Clear Pin
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Click anywhere on the map to drop pin and auto fill address.
        </p>
      </div>

      {accountEmail && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={saveCurrentAddress}
              onCheckedChange={(checked) =>
                onSaveCurrentAddressChange(checked === true)
              }
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Save this address to my account
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Use it again next time without typing the full address.
              </p>
            </div>
          </label>

          {saveCurrentAddress && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Address label
                </span>
                <Input
                  value={saveAddressLabel}
                  onChange={(event) => onSaveAddressLabelChange(event.target.value)}
                  className="h-12"
                  placeholder="Home, Office, Villa..."
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2">
                <Checkbox
                  checked={saveAddressAsDefault}
                  onCheckedChange={(checked) =>
                    onSaveAddressAsDefaultChange(checked === true)
                  }
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Make this my default address
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    We will prefill this location the next time you book.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
