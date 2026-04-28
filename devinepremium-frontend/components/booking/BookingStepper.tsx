"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Service } from "@/lib/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type CustomerAccountResponse, type SavedAddressRecord } from "@/lib/account";
import { CUSTOMER_TIME_SLOTS } from "@/lib/booking";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import {
  clearUserSession,
  getStoredUserSession,
  isUserSessionError,
} from "@/lib/auth";
import { CalendarIcon, Check, ChevronRight, ChevronLeft, Minus, Plus, MapPin, Clock, User, CreditCard } from "lucide-react";

interface BookingStepperProps {
  service: Service;
}

declare global {
  interface Window {
    L?: any;
  }
}

interface PlaceSearchResult {
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

const VAT_RATE = 0.05;

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function formatAED(n: number) {
  const v = round2(n);
  return v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAddressLabel(address: SavedAddressRecord) {
  return [address.label, address.location, address.city].filter(Boolean).join(" • ");
}

function formatAddressLine(address: {
  building?: string | null;
  apartment?: string | null;
  location: string;
  city: string;
}) {
  return [address.building, address.apartment, address.location, address.city]
    .filter(Boolean)
    .join(", ");
}

const STEPS = [
  { id: "service", title: "Service Details", icon: CreditCard },
  { id: "address", title: "Address", icon: MapPin },
  { id: "schedule", title: "Schedule", icon: Clock },
  { id: "contact", title: "Contact", icon: User },
];

export function BookingStepper({ service }: BookingStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState("");
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletPinRef = useRef<any>(null);
  // Pre-seed serviceOptions with each option's defaultValue so pricing is correct from the start
  const initialServiceOptions = service.options.reduce((acc, opt) => {
    if (opt.defaultValue !== undefined) {
      acc[opt.id] = opt.defaultValue;
    }
    return acc;
  }, {} as Record<string, any>);

  const [formData, setFormData] = useState<any>({
    serviceOptions: initialServiceOptions,
    address: {
      location: "",
      building: "",
      apartment: "",
      city: "",
      mapLink: "",
      lat: "",
      lng: "",
    },
    schedule: {
      date: undefined,
      timeSlot: "",
    },
    contact: {
      fullName: "",
      email: "",
      phone: "",
      instructions: "",
    },
    payment: {
      method: "cash",
    },
  });

  // Pricing: subtotal (ex VAT) -> discounts -> VAT -> grand total
  const calculateBreakdown = () => {
      let subtotal = 0;
      let discount = 0;
      let discountLabel: string | null = null;
      const items: { label: string; amount: number }[] = [];

      // Special handling for maid cleaning to be more intuitive
       if (service.id === 'maid-cleaning') {
           const hours = Number(formData.serviceOptions['hours']) || 0;
           const crew = Number(formData.serviceOptions['crew']) || 0;
           const frequency = String(formData.serviceOptions['frequency'] || "one-time");

           const maidDiscountRateByFrequency: Record<string, number> = {
             weekly: 0.05,
             "2-times-weekly": 0.1,
             "3-times-weekly": 0.15,
             "4-times-weekly": 0.15,
             "5-times-weekly": 0.15,
             "6-times-weekly": 0.15,
             "bi-weekly": 0.05,
             "every-3-weeks": 0.05,
             "every-4-weeks": 0.05,
             "every-5-weeks": 0.05,
             "every-6-weeks": 0.05,
           };
           const maidVisitsPerMonthByFrequency: Record<string, number> = {
             "one-time": 1,
             weekly: 4,
             "2-times-weekly": 8,
             "3-times-weekly": 12,
             "4-times-weekly": 16,
             "5-times-weekly": 20,
             "6-times-weekly": 24,
             "bi-weekly": 2,
             "every-3-weeks": 4 / 3,
             "every-4-weeks": 1,
             "every-5-weeks": 0.8,
             "every-6-weeks": 2 / 3,
           };

           const maidDiscountRate = maidDiscountRateByFrequency[frequency] || 0;
           const visitsPerMonth = maidVisitsPerMonthByFrequency[frequency] || 1;
           const visitsPerMonthLabel = Number.isInteger(visitsPerMonth)
             ? String(visitsPerMonth)
             : visitsPerMonth.toFixed(1);
           const recurringSuffix =
             frequency === "one-time"
               ? ""
               : ` x ${visitsPerMonthLabel} visit(s)/month`;
            
           if (hours > 0 && crew > 0) {
               const laborPerVisit = hours * crew * service.basePrice;
               const laborTotal = laborPerVisit * visitsPerMonth;
               subtotal += laborTotal;
               items.push({ 
                   label: `${crew} Cleaner(s) x ${hours} Hour(s) @ ${service.basePrice} AED/hr${recurringSuffix}`,
                   amount: laborTotal 
               });

               if (maidDiscountRate > 0) {
                 discount += laborTotal * maidDiscountRate;
                 discountLabel = `Offer (${Math.round(maidDiscountRate * 100)}%)`;
               }
           }

          const extras = formData.serviceOptions['extras'] || [];
            // Assuming options structure has prices for extras
            // We need to look up the option definition in service.options
            const extraOpt = service.options.find(o => o.id === 'extras');
            if (extraOpt && extraOpt.options) {
                extras.forEach((val: string) => {
                    const item = extraOpt.options?.find(o => o.value === val);
                    const price = item?.price || (val === 'supplies' ? 10 : 0); // Fallback for hardcoded
                      if (price > 0) {
                          const extraTotal = price * visitsPerMonth;
                          subtotal += extraTotal;
                          items.push({ label: `${item?.label || val}${recurringSuffix}`, amount: extraTotal });
                      }
                 });
             }
       } else {
         // Generic Service Logic
         // Only add base price if it's a fixed fee, not a "starting from" placeholder or per-unit rate
         if (service.basePrice > 0 && service.priceUnit !== 'starting from' && service.priceUnit !== '/hr') {
            subtotal += service.basePrice;
            items.push({ label: "Base Price", amount: service.basePrice });
         }

        service.options.forEach(opt => {
         const val = formData.serviceOptions[opt.id];
         if (val) {
             if (opt.type === 'quantity' && opt.price) {
                 const qty = Number(val);
                  if (qty > 0) {
                     const lineTotal = qty * opt.price;
                     subtotal += lineTotal;
                     items.push({ label: `${opt.label} (x${qty})`, amount: lineTotal });
                  }
              }
              else if (opt.type === 'checkbox' && Array.isArray(val) && opt.options) {
                   val.forEach((s: string) => {
                       const o = opt.options?.find(x => x.value === s);
                       if (o && o.price) {
                           subtotal += o.price;
                           items.push({ label: o.label, amount: o.price });
                       }
                   });
              }
              else if (opt.type === 'select' && opt.options) {
                  const o = opt.options.find(x => x.value === val);
                  if (o && o.price) {
                     // If select overrides base label
                     subtotal += o.price;
                     items.push({ label: o.label, amount: o.price });
                  }
              }
              else if (opt.type === 'radio' && opt.options) {
                 const o = opt.options.find(x => x.value === val);
                 if (o && o.price) {
                     subtotal += o.price;
                     items.push({ label: o.label, amount: o.price });
                 }
              }
          }
         });
       }

       const discountRounded = round2(discount);
       const taxable = Math.max(0, subtotal - discountRounded);
       const vat = round2(taxable * VAT_RATE);
       const total = round2(taxable + vat);

       const finalItems = [...items];
       if (discountRounded > 0) {
         finalItems.push({ label: discountLabel || "Discount", amount: -discountRounded });
       }
       finalItems.push({ label: `VAT (${Math.round(VAT_RATE * 100)}%)`, amount: vat });

       return { subtotal: round2(subtotal), discount: discountRounded, vat, total, items: finalItems };
  };

  const { total, items: lineItems, subtotal, discount, vat } = calculateBreakdown();
  const maidFrequency = String(formData.serviceOptions["frequency"] || "one-time");
  const isMaidRecurring =
    service.id === "maid-cleaning" && maidFrequency !== "one-time";
  const estimateLabel = isMaidRecurring
    ? "Estimated Monthly Total"
    : "Estimated Total";
  const estimateNote = isMaidRecurring
    ? "Includes recurring frequency pricing for approx. 4 weeks + 5% VAT"
    : "Includes selected options + 5% VAT";
  const addressSummary = [
    formData.address.building,
    formData.address.apartment,
    formData.address.location,
    formData.address.city,
  ]
    .filter(Boolean)
    .join(", ");

  const applySavedAddress = (address: SavedAddressRecord) => {
    setSelectedSavedAddressId(address.id);
    setSaveCurrentAddress(false);
    setSaveAddressLabel("");
    setSaveAddressAsDefault(false);
    setPlaceQuery(formatAddressLabel(address));
    setFormData((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        location: address.location,
        building: address.building || "",
        apartment: address.apartment || "",
        city: address.city,
        mapLink: address.mapLink || "",
        lat: address.lat || "",
        lng: address.lng || "",
      },
    }));
  };
  const hasPinnedCoords =
    Number.isFinite(Number(formData.address.lat)) && Number.isFinite(Number(formData.address.lng));

  const buildMapLink = (lat: string, lng: string) =>
    `https://www.google.com/maps?q=${lat},${lng}`;

  const parseCoordsFromMapLink = (value: string) => {
    if (!value) return null;
    const qParamMatch = value.match(/[?&]q=([-0-9.]+),([-0-9.]+)/i);
    if (qParamMatch) {
      return { lat: qParamMatch[1], lng: qParamMatch[2] };
    }
    const atParamMatch = value.match(/@([-0-9.]+),([-0-9.]+)/i);
    if (atParamMatch) {
      return { lat: atParamMatch[1], lng: atParamMatch[2] };
    }
    return null;
  };

  const reverseGeocodeAndFillAddress = async (latRaw: string, lngRaw: string) => {
    const lat = Number(latRaw).toFixed(6);
    const lng = Number(lngRaw).toFixed(6);
    const mapLink = buildMapLink(lat, lng);

    let locationText = `${lat}, ${lng}`;
    let detectedCity = "";
    let detectedBuilding = "";

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data?.address || {};

        locationText =
          address?.suburb ||
          address?.neighbourhood ||
          address?.road ||
          data?.display_name ||
          locationText;
        detectedCity = address?.city || address?.town || address?.village || address?.state || "";
        detectedBuilding = address?.house_number
          ? `${address.house_number} ${address?.road || ""}`.trim()
          : "";
      }
    } catch {
      // Use coordinate fallback if reverse geocode API is unavailable.
    }

    setFormData((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        location: locationText,
        city: detectedCity,
        building: detectedBuilding,
        mapLink,
        lat,
        lng,
      },
    }));
  };

  useEffect(() => {
    const existing = document.getElementById("leaflet-css");
    if (existing) return;

    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const session = getStoredUserSession();

    if (!session) {
      return;
    }

    setAccountEmail(session.user.email);
    setFormData((prev: any) => ({
      ...prev,
      contact: {
        ...prev.contact,
        fullName: prev.contact.fullName || session.user.fullName,
        email: prev.contact.email || session.user.email,
        phone: prev.contact.phone || session.user.phone || "",
      },
    }));

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
          (address) => address.isDefault,
        );
        setFormData((prev: any) => {
          const shouldApplyDefaultAddress =
            defaultAddress &&
            !prev.address.city &&
            !prev.address.location &&
            !prev.address.building &&
            !prev.address.apartment;

          return {
            ...prev,
            address:
              shouldApplyDefaultAddress && defaultAddress
                ? {
                    ...prev.address,
                    location: defaultAddress.location,
                    building: defaultAddress.building || "",
                    apartment: defaultAddress.apartment || "",
                    city: defaultAddress.city,
                    mapLink: defaultAddress.mapLink || "",
                    lat: defaultAddress.lat || "",
                    lng: defaultAddress.lng || "",
                  }
                : prev.address,
            contact: {
              ...prev.contact,
              fullName: prev.contact.fullName || account.user.fullName,
              email: prev.contact.email || account.user.email,
              phone: prev.contact.phone || account.user.phone || "",
              instructions:
                prev.contact.instructions ||
                account.user.defaultInstructions ||
                "",
            },
          };
        });

        if (defaultAddress) {
          setSelectedSavedAddressId((current) => current || defaultAddress.id);
          setPlaceQuery((current) => current || formatAddressLabel(defaultAddress));
        }
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
  }, []);

  const redirectToLogin = () => {
    if (typeof window === "undefined") {
      return;
    }

    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
  };

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
    const initialLat = Number(formData.address.lat) || 25.2048;
    const initialLng = Number(formData.address.lng) || 55.2708;

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
  }, [isLeafletReady, currentStep]);

  useEffect(() => {
    const map = leafletMapRef.current;
    const pin = leafletPinRef.current;
    const lat = Number(formData.address.lat);
    const lng = Number(formData.address.lng);
    if (!map || !pin || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    pin.setLatLng([lat, lng]);
    map.setView([lat, lng], Math.max(map.getZoom(), 14));
  }, [formData.address.lat, formData.address.lng]);

  const handleSelectPlaceResult = (place: PlaceSearchResult) => {
    const lat = Number(place.lat).toFixed(6);
    const lng = Number(place.lon).toFixed(6);
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

    setFormData((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        location: area,
        city: prev.address.city || detectedCity,
        building: prev.address.building || detectedBuilding,
        mapLink: buildMapLink(lat, lng),
        lat,
        lng,
      },
    }));
    setPlaceQuery(place.display_name);
    setPlaceResults([]);
    setPlaceSearchError("");
    setLocationError("");
  };

  const handleSearchPlaces = async () => {
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
  };

  const handleUseCurrentLocation = () => {
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const session = getStoredUserSession();

      if (!session?.token) {
        redirectToLogin();
        return;
      }

      setBookingError("");
      setIsModalOpen(true);
    }
  };

  const handleCreateBooking = async () => {
    if (!formData.contact.fullName || !formData.contact.email) {
      setBookingError("Please complete your contact details before confirming.");
      return;
    }

    if (!formData.address.city || !formData.address.location) {
      setBookingError("Please complete your location details before confirming.");
      return;
    }

    if (!formData.schedule.date || !formData.schedule.timeSlot) {
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
          serviceOptions: formData.serviceOptions,
          address: formData.address,
          schedule: {
            date: format(formData.schedule.date, "yyyy-MM-dd"),
            timeSlot: formData.schedule.timeSlot,
          },
          contact: {
            ...formData.contact,
            email: session.user.email,
          },
          paymentMethod: formData.payment.method,
          saveAddress:
            saveCurrentAddress && formData.address.city && formData.address.location
              ? {
                  label:
                    saveAddressLabel.trim() ||
                    [formData.address.location, formData.address.city]
                      .filter(Boolean)
                      .join(" - "),
                  isDefault: saveAddressAsDefault,
                }
              : undefined,
          pricing: {
            subtotal,
            discount,
            vat,
            total,
            lineItems,
          },
        }),
      });

      setIsModalOpen(false);

      if (formData.payment.method === "online" && response.payment?.id) {
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
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateServiceOption = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      serviceOptions: { ...prev.serviceOptions, [key]: value },
    }));
  };

  const renderServiceStep = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-6">
        {service.options.map((opt) => (
          <div key={opt.id} className="space-y-3">
             <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-gray-800">{opt.label}</Label>
                {opt.price && opt.type === 'quantity' && <span className="text-sm text-muted-foreground font-medium">{opt.price} AED / unit</span>}
             </div>
            
            {opt.type === "radio" && opt.options && (
              <RadioGroup
                onValueChange={(val) => updateServiceOption(opt.id, val)}
                defaultValue={opt.defaultValue}
                value={formData.serviceOptions[opt.id]}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {opt.options.map((o) => {
                   const isSelected = formData.serviceOptions[opt.id] === o.value;
                   return (
                  <div key={o.value} className="relative">
                    <RadioGroupItem value={o.value} id={`${opt.id}-${o.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`${opt.id}-${o.value}`}
                      className={cn(
                        "flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-[#00B4D8]/50 hover:bg-slate-50",
                        isSelected 
                            ? "border-[#00B4D8] bg-[#00B4D8]/5 shadow-sm" 
                            : "border-gray-200 bg-white"
                      )}
                    >
                      <span className="font-semibold text-base">{o.label}</span>
                      {o.price && <span className="text-sm text-gray-500 mt-1">+ {o.price} AED</span>}
                    </Label>
                    {isSelected && (
                        <div className="absolute top-4 right-4 text-[#00B4D8]">
                            <Check className="w-5 h-5 rounded-full bg-[#00B4D8]/20 p-1" strokeWidth={3} />
                        </div>
                    )}
                  </div>
                )})}
              </RadioGroup>
            )}

            {opt.type === "select" && opt.options && (
              <>
                <Select
                  onValueChange={(val) => updateServiceOption(opt.id, val)}
                  defaultValue={opt.defaultValue}
                  value={formData.serviceOptions[opt.id]}
                >
                  <SelectTrigger className="h-12 border-gray-300 rounded-xl focus:ring-[#00B4D8]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {opt.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        <span className="flex justify-between w-full gap-4">
                            <span>{o.label}</span>
                            {o.price && <span className="text-muted-foreground ml-auto"> {o.price} AED</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Discount Helper Text for Maid Cleaning Frequency */}
                 {service.id === 'maid-cleaning' && opt.id === 'frequency' && (
                     <p className="text-sm text-[#00B4D8] font-medium mt-1 ml-1 flex items-center gap-1">
                         Offers: weekly 5%, 2x/week 10%, 3+/week 15%, every 3-6 weeks 5% (totals are monthly estimates)
                     </p>
                 )}
              </>
            )}

            {opt.type === "quantity" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between sm:justify-start p-4 bg-gray-50 rounded-xl border border-gray-200 w-full sm:w-fit">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-gray-300 hover:border-[#00B4D8] hover:text-[#00B4D8] disabled:opacity-40"
                        disabled={(formData.serviceOptions[opt.id] ?? opt.defaultValue ?? 0) <= (opt.min ?? 0)}
                        onClick={() => {
                        const current = formData.serviceOptions[opt.id] ?? opt.defaultValue ?? 0;
                        const minVal = opt.min ?? 0;
                        if (current > minVal) updateServiceOption(opt.id, current - 1);
                        }}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="mx-6 text-center">
                         <span className="block text-2xl font-bold text-gray-900">{formData.serviceOptions[opt.id] ?? opt.defaultValue ?? 0}</span>
                         <span className="text-xs text-muted-foreground uppercase tracking-wider">{opt.id === 'hours' ? 'Hours' : 'Count'}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full border-gray-300 hover:border-[#00B4D8] hover:text-[#00B4D8]"
                        onClick={() => {
                        const current = formData.serviceOptions[opt.id] ?? opt.defaultValue ?? 0;
                        updateServiceOption(opt.id, current + 1);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {opt.id === 'hours' && opt.min && (
                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      ⏱ Minimum booking: {opt.min} hours
                    </p>
                  )}
                </div>
            )}

            {opt.type === "checkbox" && opt.options && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {opt.options.map((o) => {
                   const isChecked = formData.serviceOptions[opt.id]?.includes(o.value);
                   return (
                   <div key={o.value} 
                        className={cn(
                            "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                             isChecked ? "border-[#00B4D8] bg-[#00B4D8]/5" : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                        onClick={() => {
                             const current = formData.serviceOptions[opt.id] || [];
                             if (isChecked) {
                                 updateServiceOption(opt.id, current.filter((x:any) => x !== o.value));
                             } else {
                                 updateServiceOption(opt.id, [...current, o.value]);
                             }
                        }}
                   >
                     <Checkbox 
                        id={`${opt.id}-${o.value}`}
                        checked={isChecked}
                        className="data-[state=checked]:bg-[#00B4D8] data-[state=checked]:border-[#00B4D8]"
                        // Handling handled by parent div click for better UX
                        onCheckedChange={() => {}} 
                     />
                     <div className="ml-3 flex-1">
                        <Label htmlFor={`${opt.id}-${o.value}`} className="cursor-pointer font-medium block">
                        {o.label}
                        </Label>
                        {o.price && <p className="text-xs text-gray-500 mt-0.5">+ {o.price} AED</p>}
                     </div>
                   </div>
                 )})}
               </div>
            )}
          </div>
        ))}
        </div>
        
        {/* Total Display Inside Step 1 - Per User Request */}
         <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white flex flex-col sm:flex-row justify-between items-center shadow-lg border border-slate-700">
              <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">{estimateLabel}</p>
                  <div className="flex items-baseline gap-2">
                     <p className="text-4xl font-bold text-[#00B4D8]">{formatAED(total)}</p>
                     <span className="text-lg font-medium text-slate-300">AED</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{estimateNote}</p>
              </div>
             
             {/* Mini Breakdown for clarity */}
             <div className="text-sm text-slate-300 space-y-1 text-right hidden sm:block">
                  {lineItems.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-end gap-3 text-slate-400">
                          <span>{item.label}:</span>
                          <span className="text-slate-200">{formatAED(item.amount)}</span>
                      </div>
                  ))}
                  {lineItems.length > 3 && <div className="text-slate-500">+ {lineItems.length - 3} more items...</div>}
              </div>
         </div>
      </div>
    );
  };

  const renderAddressStep = () => (
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
            {savedAddresses.map((address) => {
              const isSelected = selectedSavedAddressId === address.id;

              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => applySavedAddress(address)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    isSelected
                      ? "border-[#00B4D8] bg-white shadow-sm"
                      : "border-cyan-100 bg-white/80 hover:border-cyan-200",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {address.label}
                    </p>
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
            })}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="city">City</Label>
        <Select 
            value={formData.address.city} 
            onValueChange={(val) => setFormData({...formData, address: {...formData.address, city: val}})}
        >
            <SelectTrigger className="h-12"><SelectValue placeholder="Select City" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="placeSearch">Search Place & Pin on Map</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="placeSearch"
            placeholder="Search area, building, street..."
            className="h-12"
            value={placeQuery}
            onChange={(e) => {
              setPlaceQuery(e.target.value);
              setPlaceSearchError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchPlaces();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleSearchPlaces}
            disabled={isSearchingPlaces}
            className="h-12 sm:min-w-[120px]"
          >
            {isSearchingPlaces ? "Searching..." : "Search"}
          </Button>
        </div>
        {placeSearchError && (
          <p className="text-sm text-red-600">{placeSearchError}</p>
        )}
        {placeResults.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white max-h-64 overflow-y-auto">
            {placeResults.map((place) => (
              <button
                key={`${place.lat}-${place.lon}-${place.display_name}`}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelectPlaceResult(place)}
              >
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{place.display_name}</p>
                <p className="text-xs text-gray-500 mt-1">Tap to pin this location</p>
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
            value={formData.address.location}
            onChange={(e) => setFormData({...formData, address: {...formData.address, location: e.target.value}})}
        />
      </div>
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:w-fit"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isLocating ? "Getting Your Location..." : "Use Current Location & Pin"}
        </Button>
        {formData.address.mapLink && (
          <a
            href={formData.address.mapLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#00B4D8] hover:underline"
          >
            Open map pin
          </a>
        )}
        {locationError && (
          <p className="text-sm text-red-600">{locationError}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
            <Label htmlFor="building">Building / Villa</Label>
            <Input 
                id="building" 
                placeholder="Name or Number" 
                className="h-12"
                value={formData.address.building}
                onChange={(e) => setFormData({...formData, address: {...formData.address, building: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="apartment">Flat / Unit No</Label>
            <Input 
                id="apartment" 
                placeholder="1204"
                className="h-12"
                value={formData.address.apartment}
                onChange={(e) => setFormData({...formData, address: {...formData.address, apartment: e.target.value}})}
            />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mapLink">Google Map Link (Optional)</Label>
        <Input
          id="mapLink"
          placeholder="https://www.google.com/maps?q=..."
          className="h-12"
          value={formData.address.mapLink}
          onChange={(e) => {
            const value = e.target.value;
            const coords = parseCoordsFromMapLink(value);
            setFormData({
              ...formData,
              address: {
                ...formData.address,
                mapLink: value,
                lat: coords?.lat || formData.address.lat,
                lng: coords?.lng || formData.address.lng,
              },
            });
          }}
        />
      </div>
      <div className="grid gap-2">
        <Label>Map Pin Selector (Click Map)</Label>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 aspect-video">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            aria-label="Interactive map. Click to pin and auto fill address."
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className={cn("text-xs", hasPinnedCoords ? "text-emerald-600" : "text-muted-foreground")}>
            {hasPinnedCoords
              ? `Pin selected: ${formData.address.lat}, ${formData.address.lng}`
              : "No pin selected yet. Click on map to drop a pin."}
          </p>
          {hasPinnedCoords && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    lat: "",
                    lng: "",
                    mapLink: "",
                  },
                }))
              }
            >
              Clear Pin
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Click anywhere on the map to drop pin and auto fill address. You can also search place or use current location.
        </p>
      </div>

      {accountEmail && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <label className="flex items-start gap-3">
            <Checkbox
              checked={saveCurrentAddress}
              onCheckedChange={(checked) => {
                const enabled = checked === true;
                setSaveCurrentAddress(enabled);
                if (!enabled) {
                  setSaveAddressLabel("");
                  setSaveAddressAsDefault(false);
                }
              }}
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
                  onChange={(event) => setSaveAddressLabel(event.target.value)}
                  className="h-12"
                  placeholder="Home, Office, Villa..."
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2">
                <Checkbox
                  checked={saveAddressAsDefault}
                  onCheckedChange={(checked) =>
                    setSaveAddressAsDefault(checked === true)
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

  const renderScheduleStep = () => (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col space-y-3">
            <Label>Date of Service</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full h-12 justify-start text-left font-normal border-gray-300",
                            !formData.schedule.date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.schedule.date ? format(formData.schedule.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={formData.schedule.date}
                        onSelect={(date) => setFormData({...formData, schedule: {...formData.schedule, date}})}
                        initialFocus
                        fromDate={new Date()}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                </PopoverContent>
            </Popover>
        </div>
        <div className="space-y-3">
            <Label>Preferred Time (Start)</Label>
            <Select
                value={formData.schedule.timeSlot}
                onValueChange={(val) => setFormData({...formData, schedule: {...formData.schedule, timeSlot: val}})}
            >
                <SelectTrigger className="h-12 border-gray-300"><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                    {CUSTOMER_TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time} {(parseInt(time) < 12) ? 'AM' : 'PM'}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
                id="fullName" 
                className="h-12"
                 placeholder="John Doe"
                value={formData.contact.fullName}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, fullName: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email"
                className="h-12"
                placeholder="john@example.com"
                value={formData.contact.email}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                readOnly={Boolean(accountEmail)}
            />
            {accountEmail && (
              <p className="text-xs text-gray-500">
                Orders will be linked to your logged-in account email.
              </p>
            )}
        </div>
        <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
                id="phone" 
                type="tel"
                className="h-12"
                placeholder="+971 50 123 4567"
                value={formData.contact.phone}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
            />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="instructions">Additional Notes</Label>
            <textarea
                id="instructions" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any specific requests, gate codes, or details..."
                value={formData.contact.instructions}
                onChange={(e) => setFormData({...formData, contact: {...formData.contact, instructions: e.target.value}})}
            />
        </div>
        <div className="grid gap-3">
            <Label>Payment Method</Label>
            <RadioGroup
                value={formData.payment.method}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    payment: { method: value },
                  })
                }
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
                <Label
                  htmlFor="payment-cash"
                  className={cn(
                    "flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-all",
                    formData.payment.method === "cash"
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
                    formData.payment.method === "online"
                      ? "border-[#7B2D8B] bg-[#7B2D8B]/5"
                      : "border-gray-200 bg-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="online" id="payment-online" />
                    <span className="font-semibold text-gray-900">Online Payment</span>
                  </div>
                  <span className="mt-2 text-xs text-gray-500">
                    Continue to the online checkout page after booking confirmation.
                  </span>
                </Label>
            </RadioGroup>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => setIsLeafletReady(true)}
      />
      {/* ── Stepper Sidebar / Header (Responsive) ── */}
      <div className="lg:col-span-8 space-y-6 lg:space-y-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center relative">
                 {/* Connecting Line */}
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-100 -z-0" />
                 
                 {STEPS.map((step, idx) => {
                     const Icon = step.icon;
                     const isActive = currentStep >= idx;
                     const isCompleted = currentStep > idx;

                     return (
                     <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => idx < currentStep && setCurrentStep(idx)}>
                         <div 
                             className={cn(
                                 "w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-[3px] sm:border-4",
                                 isActive 
                                     ? "bg-white border-[#00B4D8] text-[#00B4D8] shadow-md scale-110" 
                                     : "bg-gray-50 border-gray-200 text-gray-400"
                              )}
                         >
                             {isCompleted ? <Check className="w-4 h-4 sm:w-6 sm:h-6" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                         </div>
                         <span className={cn(
                             "mt-2 sm:mt-3 text-[10px] sm:text-sm font-medium transition-colors duration-300 text-center max-w-[65px] sm:max-w-none leading-tight",
                             isActive ? "text-gray-900 font-bold" : "text-gray-400"
                         )}>
                             {step.title}
                         </span>
                     </div>
                 )})}
             </div>
        </div>

        <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 overflow-hidden ring-1 ring-gray-100">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-5 sm:p-8 pb-6 sm:pb-8">
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-500 mt-2">
              {currentStep === 0 && <span className="block mb-2">{service.description}</span>}
              Please fill in all the required details below to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-8">
            {currentStep === 0 && renderServiceStep()}
            {currentStep === 1 && renderAddressStep()}
            {currentStep === 2 && renderScheduleStep()}
            {currentStep === 3 && renderContactStep()}
          </CardContent>
          <CardFooter className="bg-gray-50 p-5 sm:p-6 flex justify-between border-t border-gray-100 gap-4 mt-auto">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 -ml-2 sm:-ml-2 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              size="lg"
              className={cn(
                  "rounded-full px-4 sm:px-8 shadow-lg transition-transform hover:scale-105 active:scale-95 text-white border-0 text-xs sm:text-sm h-10 sm:h-11",
                  currentStep === STEPS.length - 1 
                    ? "bg-[#7B2D8B] hover:bg-[#6a2578]" // Confirm Color
                    : "bg-[#00B4D8] hover:bg-[#009bb8]"  // Next Color
              )}
            >
              {currentStep === STEPS.length - 1 ? "Confirm" : "Continue"}
              {currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ── Summary Sidebar (Sticky) ── */}
      <div className="w-full lg:col-span-4 space-y-6 lg:sticky lg:top-24 mt-8 lg:mt-0">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-[#0D0D1A] p-6 text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8] rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
                 <h3 className="text-lg font-bold relative z-10">Booking Summary</h3>
                 <p className="text-xs text-gray-400 relative z-10 mt-1 uppercase tracking-widest">{service.title}</p>
            </div>
            
            <div className="p-6 space-y-6">
                {/* Line Items */}
                <div className="space-y-3">
                     {lineItems.length > 0 ? lineItems.map((item, i) => (
                         <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                             <span className="text-gray-600 max-w-[70%]">{item.label}</span>
                             <span className="font-semibold text-gray-900">{formatAED(item.amount)} AED</span>
                         </div>
                     )) : (
                         <p className="text-sm text-muted-foreground text-center py-4 italic">Select options to see price breakdown</p>
                     )}
                 </div>

                {/* Total */}
                 <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border border-gray-100">
                      <span className="text-gray-600 font-medium">{estimateLabel}</span>
                      <span className="text-2xl font-bold text-[#00B4D8]">{formatAED(total)} <span className="text-xs text-gray-400 font-normal">AED</span></span>
                 </div>

                {/* Info */}
                <div className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                    *Final price may vary based on actual inspection or changes in requirements.
                </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                 <p className="text-xs font-semibold text-gray-500">Need Help? Call Us</p>
                 <div className="flex flex-col items-center gap-2">
                     <a href="tel:+971563758229" className="text-[#7B2D8B] font-bold text-lg hover:underline">+971 56 375 8229</a>
                     <a href="tel:+971529769550" className="text-[#7B2D8B] font-bold text-lg hover:underline">+971 52 976 9550</a>
                     <a href="tel:+971523960074" className="text-[#7B2D8B] font-bold text-lg hover:underline">+971 52 396 0074</a>
                 </div>
            </div>
        </div>

      {/* What to Expect Section */}
        {service.expectations && service.expectations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#00B4D8] rounded-full" />
                    What to Expect
                </h4>
                <ul className="space-y-3">
                    {service.expectations.map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600">
                            <Check className="w-4 h-4 text-[#7B2D8B] mr-3 shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

       {/* Confirmation Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#0D0D1A] p-6 text-white text-center relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8] rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
               <h3 className="text-xl font-bold relative z-10">Confirm Booking</h3>
               <p className="text-sm text-gray-400 mt-1 relative z-10">Review your details before sending</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
               <div className="space-y-2">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</p>
                   <p className="font-medium text-gray-900">{service.title}</p>
               </div>
               
               <div className="space-y-2">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Schedule</p>
                   <p className="font-medium text-gray-900">
                       {formData.schedule.date ? format(formData.schedule.date, "PPP") : "Date not set"} at {formData.schedule.timeSlot || "Time not set"}
                   </p>
               </div>

                <div className="space-y-2">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                   <p className="font-medium text-gray-900 text-sm">
                       {addressSummary || "Not Set"}
                   </p>
                   {formData.address.mapLink && (
                     <a
                       href={formData.address.mapLink}
                       target="_blank"
                       rel="noreferrer"
                       className="text-sm text-[#00B4D8] hover:underline"
                     >
                       Open map pin
                     </a>
                   )}
               </div>

               <div className="space-y-2">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</p>
                   <p className="font-medium text-gray-900 text-sm">{formData.contact.fullName}</p>
                   <p className="text-sm text-gray-600">{formData.contact.phone}</p>
               </div>

               <div className="space-y-2">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method</p>
                   <p className="font-medium text-gray-900 text-sm capitalize">
                     {formData.payment.method === "online" ? "Online Payment" : "Cash Payment"}
                   </p>
                   <p className="text-xs text-gray-500">
                     {formData.payment.method === "online"
                       ? "You will continue to the checkout screen after booking."
                       : "Payment will stay marked as cash due until admin updates it."}
                   </p>
               </div>

               <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">{estimateLabel}</span>
                     <span className="text-xl font-bold text-[#00B4D8]">{formatAED(total)} AED</span>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
              {bookingError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bookingError}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
               <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button
                 className="flex-1 bg-[#7B2D8B] hover:bg-[#632271] text-white"
                 onClick={handleCreateBooking}
                 disabled={isSubmittingBooking}
               >
                  {isSubmittingBooking
                    ? "Creating booking..."
                    : formData.payment.method === "online"
                      ? "Confirm & Pay Online"
                      : "Confirm Booking"}
               </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
