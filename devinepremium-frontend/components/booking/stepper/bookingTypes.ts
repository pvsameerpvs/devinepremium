import type { RefObject } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { SavedAddressRecord } from "@/lib/account";

export type BookingStepId = "service" | "address" | "schedule" | "contact";

export type PaymentMethod = "cash" | "online";

export interface BookingFormValues {
  serviceOptions: Record<string, unknown>;
  address: {
    location: string;
    building: string;
    apartment: string;
    city: string;
    mapLink: string;
    lat: string;
    lng: string;
  };
  schedule: {
    date?: Date;
    timeSlot: string;
  };
  contact: {
    fullName: string;
    email: string;
    phone: string;
    instructions: string;
  };
  payment: {
    method: PaymentMethod;
  };
}

export interface PlaceSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    suburb?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
  };
}

export interface PricingLineItem {
  label: string;
  amount: number;
}

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  items: PricingLineItem[];
}

export interface StepFormProps {
  control: Control<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
  register: UseFormRegister<BookingFormValues>;
}

export interface AddressStepProps extends StepFormProps {
  accountEmail: string;
  hasPinnedCoords: boolean;
  isLoadingAccountData: boolean;
  isLocating: boolean;
  isSearchingPlaces: boolean;
  locationError: string;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  placeQuery: string;
  placeResults: PlaceSearchResult[];
  placeSearchError: string;
  saveAddressAsDefault: boolean;
  saveAddressLabel: string;
  saveCurrentAddress: boolean;
  savedAddresses: SavedAddressRecord[];
  selectedSavedAddressId: string;
  onApplySavedAddress: (address: SavedAddressRecord) => void;
  onClearPin: () => void;
  onMapLinkChange: (value: string) => void;
  onPlaceQueryChange: (value: string) => void;
  onSaveAddressAsDefaultChange: (value: boolean) => void;
  onSaveAddressLabelChange: (value: string) => void;
  onSaveCurrentAddressChange: (value: boolean) => void;
  onSearchPlaces: () => void;
  onSelectPlaceResult: (place: PlaceSearchResult) => void;
  onUseCurrentLocation: () => void;
}
