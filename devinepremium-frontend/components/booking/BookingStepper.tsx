"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { format } from "date-fns";
import { FormProvider, useForm, useWatch, type FieldPath } from "react-hook-form";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type CustomerAccountResponse, type SavedAddressRecord } from "@/lib/account";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
  isUserSessionError,
} from "@/lib/auth";
import { fetchServiceQuote, Service, type ServiceQuote } from "@/lib/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddressStep } from "./stepper/AddressStep";
import { BookingProgress, BOOKING_STEPS } from "./stepper/BookingProgress";
import { BookingSummary } from "./stepper/BookingSummary";
import { ConfirmationModal } from "./stepper/ConfirmationModal";
import { ContactStep } from "./stepper/ContactStep";
import { ScheduleStep } from "./stepper/ScheduleStep";
import { ServiceOptionsStep } from "./stepper/ServiceOptionsStep";
import { calculateBookingBreakdown } from "./stepper/bookingPricing";
import type { BookingFormValues, PlaceSearchResult } from "./stepper/bookingTypes";
import {
  buildMapLink,
  createDefaultBookingValues,
  formatAddressLabel,
  getAddressSummary,
  getEstimateCopy,
  parseCoordsFromMapLink,
} from "./stepper/bookingUtils";

interface BookingStepperProps {
  service: Service;
}

declare global {
  interface Window {
    L?: any;
  }
}

const VALIDATION_FIELDS: Array<Array<FieldPath<BookingFormValues>>> = [
  [],
  ["address.city", "address.location"],
  ["schedule.date", "schedule.timeSlot"],
  ["contact.fullName", "contact.email", "contact.phone", "payment.method"],
];

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const redirect = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
}

export function BookingStepper({ service }: BookingStepperProps) {
  const defaultValues = useMemo(
    () => createDefaultBookingValues(service),
    [service],
  );
  const form = useForm<BookingFormValues>({
    defaultValues,
    mode: "onTouched",
    shouldUnregister: false,
  });
  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
  } = form;

  const formValues = useWatch({ control }) as BookingFormValues;
  const serviceOptions = formValues.serviceOptions ?? defaultValues.serviceOptions;
  const address = formValues.address ?? defaultValues.address;
  const paymentMethod = formValues.payment?.method ?? "cash";

  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [serviceDetailsError, setServiceDetailsError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressRecord[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("");
  const [isLoadingAccountData, setIsLoadingAccountData] = useState(false);
  const [saveCurrentAddress, setSaveCurrentAddress] = useState(false);
  const [saveAddressLabel, setSaveAddressLabel] = useState("");
  const [saveAddressAsDefault, setSaveAddressAsDefault] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");
  const [serviceQuote, setServiceQuote] = useState<ServiceQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletPinRef = useRef<any>(null);

  const localBreakdown = useMemo(
    () => calculateBookingBreakdown(service, serviceOptions),
    [service, serviceOptions],
  );
  const livePricing = serviceQuote?.pricing;
  const hasEmptyLivePricing =
    livePricing && livePricing.total <= 0 && localBreakdown.total > 0;
  const shouldUseLocalPricing = isQuoteLoading || Boolean(hasEmptyLivePricing);
  const pricing = shouldUseLocalPricing
    ? localBreakdown
    : livePricing ?? localBreakdown;
  const lineItems = shouldUseLocalPricing
    ? localBreakdown.items
    : livePricing?.lineItems ?? localBreakdown.items;
  const { estimateLabel, estimateNote } = getEstimateCopy(service, serviceOptions);
  const addressSummary = getAddressSummary(address);
  const hasPinnedCoords =
    Number.isFinite(Number(address.lat)) && Number.isFinite(Number(address.lng));

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (pricing.total > 0) {
      setServiceDetailsError("");
    }
  }, [pricing.total]);

  const setAddressValue = useCallback(
    (field: keyof BookingFormValues["address"], value: string) => {
      setValue(`address.${field}` as FieldPath<BookingFormValues>, value as never, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const setContactValue = useCallback(
    (field: keyof BookingFormValues["contact"], value: string) => {
      setValue(`contact.${field}` as FieldPath<BookingFormValues>, value as never, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const applySavedAddress = useCallback(
    (
      savedAddress: SavedAddressRecord,
      options: { keepSaveControls?: boolean } = {},
    ) => {
      setSelectedSavedAddressId(savedAddress.id);
      if (!options.keepSaveControls) {
        setSaveCurrentAddress(false);
        setSaveAddressLabel("");
        setSaveAddressAsDefault(false);
      }
      setPlaceQuery(formatAddressLabel(savedAddress));
      setAddressValue("location", savedAddress.location);
      setAddressValue("building", savedAddress.building || "");
      setAddressValue("apartment", savedAddress.apartment || "");
      setAddressValue("city", savedAddress.city);
      setAddressValue("mapLink", savedAddress.mapLink || "");
      setAddressValue("lat", savedAddress.lat || "");
      setAddressValue("lng", savedAddress.lng || "");
    },
    [setAddressValue],
  );

  const reverseGeocodeAndFillAddress = useCallback(
    async (latRaw: string, lngRaw: string) => {
      const lat = Number(latRaw).toFixed(6);
      const lng = Number(lngRaw).toFixed(6);
      const mapLink = buildMapLink(lat, lng);

      let locationText = `${lat}, ${lng}`;
      let detectedCity = "";
      let detectedBuilding = "";

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        if (response.ok) {
          const data = await response.json();
          const reverseAddress = data?.address || {};

          locationText =
            reverseAddress?.suburb ||
            reverseAddress?.neighbourhood ||
            reverseAddress?.road ||
            data?.display_name ||
            locationText;
          detectedCity =
            reverseAddress?.city ||
            reverseAddress?.town ||
            reverseAddress?.village ||
            reverseAddress?.state ||
            "";
          detectedBuilding = reverseAddress?.house_number
            ? `${reverseAddress.house_number} ${reverseAddress?.road || ""}`.trim()
            : "";
        }
      } catch {
        // Keep coordinate fallback if reverse geocoding is unavailable.
      }

      setAddressValue("location", locationText);
      setAddressValue("city", detectedCity);
      setAddressValue("building", detectedBuilding);
      setAddressValue("mapLink", mapLink);
      setAddressValue("lat", lat);
      setAddressValue("lng", lng);
    },
    [setAddressValue],
  );

  useEffect(() => {
    const existing = document.getElementById("leaflet-css");
    if (existing) {
      return;
    }

    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, [applySavedAddress, getValues, setContactValue]);

  useEffect(() => {
    const session = getStoredUserSession();

    if (!session) {
      return;
    }

    setAccountEmail(session.user.email);
    const currentContact = getValues("contact");
    setContactValue("fullName", currentContact.fullName || session.user.fullName);
    setContactValue("email", currentContact.email || session.user.email);
    setContactValue("phone", currentContact.phone || session.user.phone || "");

    let isActive = true;
    setIsLoadingAccountData(true);

    void apiRequest<CustomerAccountResponse>("/api/v1/account", {
      method: "GET",
      token: session.token,
    })
      .then((account) => {
        if (!isActive) {
          return;
        }

        setSavedAddresses(account.savedAddresses);
        const defaultAddress = account.savedAddresses.find(
          (savedAddress) => savedAddress.isDefault,
        );
        const currentAddress = getValues("address");

        if (
          defaultAddress &&
          !currentAddress.city &&
          !currentAddress.location &&
          !currentAddress.building &&
          !currentAddress.apartment
        ) {
          applySavedAddress(defaultAddress, { keepSaveControls: true });
        }

        setContactValue("fullName", currentContact.fullName || account.user.fullName);
        setContactValue("email", currentContact.email || account.user.email);
        setContactValue("phone", currentContact.phone || account.user.phone || "");
        setContactValue(
          "instructions",
          currentContact.instructions || account.user.defaultInstructions || "",
        );
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        if (isUserSessionError(error)) {
          clearUserSession();
        }

        setSavedAddresses([]);
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingAccountData(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [applySavedAddress, getValues, setContactValue]);

  useEffect(() => {
    let isActive = true;
    setIsQuoteLoading(true);
    setQuoteError("");

    const timeoutId = window.setTimeout(() => {
      void fetchServiceQuote(service.slug, serviceOptions)
        .then((quote) => {
          if (isActive) {
            setServiceQuote(quote);
          }
        })
        .catch(() => {
          if (isActive) {
            setServiceQuote(null);
            setQuoteError("Live price check is unavailable. Showing local estimate.");
          }
        })
        .finally(() => {
          if (isActive) {
            setIsQuoteLoading(false);
          }
        });
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [service.slug, serviceOptions]);

  useEffect(() => {
    if (
      currentStep !== 1 ||
      !isLeafletReady ||
      !mapContainerRef.current ||
      leafletMapRef.current ||
      !window.L
    ) {
      return;
    }

    const L = window.L;
    const initialLat = Number(address.lat) || 25.2048;
    const initialLng = Number(address.lng) || 55.2708;
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const pin = L.circleMarker([initialLat, initialLng], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: "#00B4D8",
      fillOpacity: 0.95,
    }).addTo(map);

    map.on("click", async (event: any) => {
      const lat = Number(event.latlng.lat).toFixed(6);
      const lng = Number(event.latlng.lng).toFixed(6);
      pin.setLatLng([lat, lng]);
      await reverseGeocodeAndFillAddress(lat, lng);
      setLocationError("");
      setPlaceResults([]);
      setPlaceSearchError("");
    });

    leafletMapRef.current = map;
    leafletPinRef.current = pin;

    return () => {
      map.remove();
      leafletMapRef.current = null;
      leafletPinRef.current = null;
    };
  }, [address.lat, address.lng, currentStep, isLeafletReady, reverseGeocodeAndFillAddress]);

  useEffect(() => {
    const map = leafletMapRef.current;
    const pin = leafletPinRef.current;
    const lat = Number(address.lat);
    const lng = Number(address.lng);
    if (!map || !pin || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    pin.setLatLng([lat, lng]);
    map.setView([lat, lng], Math.max(map.getZoom(), 14));
  }, [address.lat, address.lng]);

  function handleSelectPlaceResult(place: PlaceSearchResult) {
    const lat = Number(place.lat).toFixed(6);
    const lng = Number(place.lon).toFixed(6);
    const currentAddress = getValues("address");
    const area =
      place.address?.suburb ||
      place.address?.neighbourhood ||
      place.address?.road ||
      place.display_name;
    const detectedCity =
      place.address?.city ||
      place.address?.town ||
      place.address?.village ||
      place.address?.state ||
      "";
    const detectedBuilding = place.address?.house_number
      ? `${place.address.house_number} ${place.address?.road || ""}`.trim()
      : "";

    setAddressValue("location", area);
    setAddressValue("city", currentAddress.city || detectedCity);
    setAddressValue("building", currentAddress.building || detectedBuilding);
    setAddressValue("mapLink", buildMapLink(lat, lng));
    setAddressValue("lat", lat);
    setAddressValue("lng", lng);
    setPlaceQuery(place.display_name);
    setPlaceResults([]);
    setPlaceSearchError("");
    setLocationError("");
  }

  async function handleSearchPlaces() {
    const query = placeQuery.trim();
    if (query.length < 3) {
      setPlaceSearchError("Type at least 3 characters to search places.");
      setPlaceResults([]);
      return;
    }

    setPlaceSearchError("");
    setIsSearchingPlaces(true);

    try {
      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        addressdetails: "1",
        limit: "6",
        countrycodes: "ae",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) {
        throw new Error("Place search failed");
      }

      const data = (await response.json()) as PlaceSearchResult[];
      setPlaceResults(Array.isArray(data) ? data : []);
      if (!data.length) {
        setPlaceSearchError("No places found. Try another area/building name.");
      }
    } catch {
      setPlaceSearchError("Could not search places right now. Please try again.");
      setPlaceResults([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported on this browser.");
      return;
    }

    setLocationError("");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude).toFixed(6);
        const lng = Number(position.coords.longitude).toFixed(6);
        await reverseGeocodeAndFillAddress(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        const messageByCode: Record<number, string> = {
          1: "Location permission denied. Please allow location access.",
          2: "Unable to detect your location. Try again.",
          3: "Location request timed out. Please try again.",
        };
        setLocationError(messageByCode[error.code] || "Unable to fetch your location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  function handleMapLinkChange(value: string) {
    const coords = parseCoordsFromMapLink(value);
    setAddressValue("mapLink", value);
    if (coords) {
      setAddressValue("lat", coords.lat);
      setAddressValue("lng", coords.lng);
    }
  }

  function handleClearPin() {
    setAddressValue("lat", "");
    setAddressValue("lng", "");
    setAddressValue("mapLink", "");
  }

  async function validateCurrentStep() {
    if (currentStep === 0 && service.pricingMode !== "quote" && pricing.total <= 0) {
      setServiceDetailsError(
        "Please select at least one priced service option before continuing.",
      );
      return false;
    }

    const fields = VALIDATION_FIELDS[currentStep];
    return fields.length ? trigger(fields, { shouldFocus: true }) : true;
  }

  async function handleNext() {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, BOOKING_STEPS.length - 1));
  }

  function handleReviewBooking() {
    const session = getStoredUserSession();
    if (!session?.token) {
      redirectToLogin();
      return;
    }

    setBookingError("");
    setIsModalOpen(true);
  }

  async function handleStepperSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentStep < BOOKING_STEPS.length - 1) {
      await handleNext();
      return;
    }

    await handleSubmit(handleReviewBooking)(event);
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  }

  async function handleCreateBooking() {
    const isValid = await trigger(VALIDATION_FIELDS.flat(), { shouldFocus: true });
    const values = getValues();

    if (!isValid) {
      setBookingError("Please complete the required booking details.");
      return;
    }

    if (!values.address.city || !values.address.location) {
      setBookingError("Please complete your location details before confirming.");
      return;
    }

    if (!values.schedule.date || !values.schedule.timeSlot) {
      setBookingError("Please select your booking date and preferred time.");
      return;
    }

    const session = getStoredUserSession();
    if (!session?.token) {
      setBookingError("Please login to continue with your order.");
      redirectToLogin();
      return;
    }

    setBookingError("");
    setIsSubmittingBooking(true);

    try {
      const response = await apiRequest<{
        message: string;
        payment?: {
          id: string;
          method: string;
          status: string;
        };
      }>("/api/v1/bookings", {
        method: "POST",
        token: session.token,
        body: JSON.stringify({
          serviceId: service.id,
          serviceSlug: service.slug,
          serviceTitle: service.title,
          serviceOptions: values.serviceOptions,
          address: values.address,
          schedule: {
            date: format(values.schedule.date, "yyyy-MM-dd"),
            timeSlot: values.schedule.timeSlot,
          },
          contact: {
            ...values.contact,
            email: session.user.email,
          },
          paymentMethod: values.payment.method,
          saveAddress:
            saveCurrentAddress && values.address.city && values.address.location
              ? {
                  label:
                    saveAddressLabel.trim() ||
                    [values.address.location, values.address.city]
                      .filter(Boolean)
                      .join(" - "),
                  isDefault: saveAddressAsDefault,
                }
              : undefined,
          pricing: {
            subtotal: pricing.subtotal,
            discount: pricing.discount,
            vat: pricing.vat,
            total: pricing.total,
            lineItems,
          },
        }),
      });

      setIsModalOpen(false);

      if (values.payment.method === "online" && response.payment?.id) {
        window.location.href = `/payment/checkout?paymentId=${response.payment.id}`;
        return;
      }

      window.location.href = "/account";
    } catch (error) {
      if (isUserSessionError(error)) {
        clearUserSession();
        setBookingError("Your session expired. Please log in again.");
        redirectToLogin();
        return;
      }

      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to create booking right now. Please try again.",
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  function renderCurrentStep() {
    if (currentStep === 0) {
      return (
        <ServiceOptionsStep
          estimateLabel={estimateLabel}
          estimateNote={estimateNote}
          isQuoteLoading={isQuoteLoading}
          lineItems={lineItems}
          quoteError={quoteError}
          service={service}
          serviceDetailsError={serviceDetailsError}
          total={pricing.total}
        />
      );
    }

    if (currentStep === 1) {
      return (
        <AddressStep
          accountEmail={accountEmail}
          hasPinnedCoords={hasPinnedCoords}
          isLoadingAccountData={isLoadingAccountData}
          isLocating={isLocating}
          isSearchingPlaces={isSearchingPlaces}
          locationError={locationError}
          mapContainerRef={mapContainerRef}
          placeQuery={placeQuery}
          placeResults={placeResults}
          placeSearchError={placeSearchError}
          saveAddressAsDefault={saveAddressAsDefault}
          saveAddressLabel={saveAddressLabel}
          saveCurrentAddress={saveCurrentAddress}
          savedAddresses={savedAddresses}
          selectedSavedAddressId={selectedSavedAddressId}
          onApplySavedAddress={(savedAddress) => applySavedAddress(savedAddress)}
          onClearPin={handleClearPin}
          onMapLinkChange={handleMapLinkChange}
          onPlaceQueryChange={(value) => {
            setPlaceQuery(value);
            setPlaceSearchError("");
          }}
          onSaveAddressAsDefaultChange={setSaveAddressAsDefault}
          onSaveAddressLabelChange={setSaveAddressLabel}
          onSaveCurrentAddressChange={(enabled) => {
            setSaveCurrentAddress(enabled);
            if (!enabled) {
              setSaveAddressLabel("");
              setSaveAddressAsDefault(false);
            }
          }}
          onSearchPlaces={handleSearchPlaces}
          onSelectPlaceResult={handleSelectPlaceResult}
          onUseCurrentLocation={handleUseCurrentLocation}
        />
      );
    }

    if (currentStep === 2) {
      return <ScheduleStep />;
    }

    return (
      <ContactStep
        accountEmail={accountEmail}
        paymentMethod={paymentMethod}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          strategy="afterInteractive"
          onLoad={() => setIsLeafletReady(true)}
        />

        <form
          className="space-y-6 lg:col-span-8 lg:space-y-8"
          onSubmit={handleStepperSubmit}
        >
          <BookingProgress
            currentStep={currentStep}
            onStepClick={(stepIndex) => {
              if (stepIndex < currentStep) {
                setCurrentStep(stepIndex);
              }
            }}
          />

          <Card className="min-h-[500px] overflow-hidden border-none shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 p-5 pb-6 sm:p-8 sm:pb-8">
              <CardTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                {BOOKING_STEPS[currentStep].title}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-gray-500 sm:text-base">
                {currentStep === 0 && (
                  <span className="mb-2 block">{service.description}</span>
                )}
                Please fill in all the required details below to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-8">{renderCurrentStep()}</CardContent>
            <CardFooter className="mt-auto flex justify-between gap-4 border-t border-gray-100 bg-gray-50 p-5 sm:p-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="-ml-2 px-2 text-xs text-gray-500 hover:bg-gray-200/50 hover:text-gray-900 sm:-ml-2 sm:px-4 sm:text-sm"
              >
                <ChevronLeft className="mr-1 h-4 w-4 sm:mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className={`h-10 rounded-full border-0 px-4 text-xs text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-11 sm:px-8 sm:text-sm ${
                  currentStep === BOOKING_STEPS.length - 1
                    ? "bg-[#7B2D8B] hover:bg-[#6a2578]"
                    : "bg-[#00B4D8] hover:bg-[#009bb8]"
                }`}
              >
                {currentStep === BOOKING_STEPS.length - 1 ? "Confirm" : "Continue"}
                {currentStep !== BOOKING_STEPS.length - 1 && (
                  <ChevronRight className="ml-1 h-4 w-4 sm:ml-2" />
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <BookingSummary
          estimateLabel={estimateLabel}
          lineItems={lineItems}
          service={service}
          total={pricing.total}
        />

        {isModalOpen && (
          <ConfirmationModal
            addressSummary={addressSummary}
            bookingError={bookingError}
            estimateLabel={estimateLabel}
            formValues={getValues()}
            isSubmittingBooking={isSubmittingBooking}
            service={service}
            total={pricing.total}
            onCancel={() => setIsModalOpen(false)}
            onConfirm={handleCreateBooking}
          />
        )}
      </div>
    </FormProvider>
  );
}
