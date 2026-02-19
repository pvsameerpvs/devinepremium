
export interface ServiceOption {
  id: string;
  label: string;
  price?: number;
  type: "checkbox" | "radio" | "quantity" | "select";
  options?: { label: string; value: string; price?: number }[];
  defaultValue?: any;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description?: string;
  basePrice: number;
  priceUnit?: string; // e.g. "per hour", "starting from"
  image?: string;
  options: ServiceOption[];
  minHours?: number;
}

export const SERVICES: Service[] = [
  {
    id: "maid-cleaning",
    slug: "maid-cleaning",
    title: "House Cleaning Services",
    basePrice: 35,
    priceUnit: "/hr",
    options: [
      {
        id: "frequency",
        label: "Select your booking frequency",
        type: "radio",
        options: [
          { label: "One-time", value: "one-time" },
          { label: "Weekly", value: "weekly" },
          { label: "Bi-weekly", value: "bi-weekly" },
        ],
        defaultValue: "one-time",
      },
      {
        id: "crew",
        label: "How Many Crew?",
        type: "quantity",
        defaultValue: 1,
      },
      {
        id: "hours",
        label: "Hours",
        type: "quantity",
        defaultValue: 4,
      },
      {
        id: "extras",
        label: "Extras",
        type: "checkbox",
        options: [
          { label: "Cleaning supplies (+10 AED)", value: "supplies", price: 10 },
        ],
        defaultValue: [],
      },
    ],
  },
  {
    id: "sofa-cleaning",
    slug: "sofa-cleaning-service",
    title: "Sofa Cleaning Service",
    basePrice: 0,
    priceUnit: "based on selection",
    options: [
      {
        id: "frequency",
        label: "Select your booking frequency",
        type: "radio",
        options: [
          { label: "One-time", value: "one-time" },
        ],
        defaultValue: "one-time",
      },
      {
        id: "single-seater",
        label: "Single Seater Sofa (50 AED/seat)",
        type: "quantity",
        price: 50,
        defaultValue: 0,
      },
      {
        id: "two-seater",
        label: "2-Seater Sofa (100 AED)",
        type: "quantity",
        price: 100,
        defaultValue: 0,
      },
      {
        id: "three-seater",
        label: "3-Seater Sofa (150 AED)",
        type: "quantity",
        price: 150,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "carpet-cleaning",
    slug: "rug-carpet-cleaning",
    title: "Rug / Carpet Cleaning",
    basePrice: 0,
    priceUnit: "based on selection",
    options: [
      {
        id: "frequency",
        label: "Select your booking frequency",
        type: "radio",
        options: [{ label: "One-time", value: "one-time" }],
        defaultValue: "one-time",
      },
      {
        id: "small-rug",
        label: "Small Rug / Carpet (1.5 x 2.4m) - 149 AED",
        type: "quantity",
        price: 149,
        defaultValue: 0,
      },
      {
        id: "medium-rug",
        label: "Medium Rug / Carpet (2.4 x 3m) - 199 AED",
        type: "quantity",
        price: 199,
        defaultValue: 0,
      },
      {
        id: "large-rug",
        label: "Large Rug / Carpet (3 x 4.3m) - 299 AED",
        type: "quantity",
        price: 299,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "painting",
    slug: "painting",
    title: "Painting Services",
    basePrice: 699,
    priceUnit: "starting from",
    description: "Scope includes protection, sanding, priming, 2-3 coats.",
    options: [
      {
        id: "service-type",
        label: "Service Type",
        type: "select",
        options: [
          { label: "Studio Apartment (699 AED)", value: "studio", price: 699 },
          { label: "1 BHK Apartment (899 AED)", value: "1bhk-apt", price: 899 },
          { label: "2 BHK Apartment (1399 AED)", value: "2bhk-apt", price: 1399 },
          { label: "3 BHK Apartment (1999 AED)", value: "3bhk-apt", price: 1999 },
          { label: "4 BHK Apartment (2500 AED)", value: "4bhk-apt", price: 2500 },
          { label: "5 BHK Apartment (3300 AED)", value: "5bhk-apt", price: 3300 },
          { label: "1 BHK Villa (1499 AED)", value: "1bhk-villa", price: 1499 },
          { label: "3 BHK Villa (2899 AED)", value: "3bhk-villa", price: 2899 },
          { label: "4 BHK Villa (3699 AED)", value: "4bhk-villa", price: 3699 },
        ],
        defaultValue: "studio",
      },
      {
        id: "door-painting",
        label: "Door Painting Add-ons",
        type: "checkbox",
        options: [
          { label: "Roller (500 AED/door)", value: "roller", price: 500 },
          { label: "Spray (650 AED/door)", value: "spray", price: 650 },
          { label: "PU Paint (750 AED/door)", value: "pu", price: 750 },
        ],
        defaultValue: [],
      },
    ],
  },
  {
    id: "kitchen-deep-cleaning",
    slug: "kitchen-deep-cleaning",
    title: "Kitchen Deep Cleaning",
    basePrice: 199,
    priceUnit: "starting from",
    options: [
       {
        id: "size",
        label: "Kitchen Size",
        type: "select",
        options: [
            { label: "Small - Premium (199 AED)", value: "small-premium", price: 199 },
            { label: "Small - Full Scrub (249 AED)", value: "small-full", price: 249 },
            { label: "Medium - Premium (249 AED)", value: "medium-premium", price: 249 },
            { label: "Medium - Full Scrub (299 AED)", value: "medium-full", price: 299 },
            { label: "Large - Premium (299 AED)", value: "large-premium", price: 299 },
            { label: "Large - Full Scrub (349 AED)", value: "large-full", price: 349 },
        ],
        defaultValue: "small-premium"
       }
    ]
  },
  {
    id: "deep-cleaning",
    slug: "deep-cleaning",
    title: "Deep Cleaning Services",
    basePrice: 399,
    priceUnit: "starting from",
    options: [
        {
            id: "type",
            label: "Property Type",
            type: "select",
            options: [
                { label: "Studio (399 AED)", value: "studio", price: 399 },
                { label: "1 BHK Apt (549 AED)", value: "1bhk-apt", price: 549 },
                { label: "2 BHK Apt (649 AED)", value: "2bhk-apt", price: 649 },
                { label: "3 BHK Apt (749 AED)", value: "3bhk-apt", price: 749 },
                { label: "4 BHK Apt (899 AED)", value: "4bhk-apt", price: 899 },
                { label: "2 BHK Villa (899 AED)", value: "2bhk-villa", price: 899 },
                { label: "3 BHK Villa (1199 AED)", value: "3bhk-villa", price: 1199 },
                { label: "4 BHK Villa (1499 AED)", value: "4bhk-villa", price: 1499 },
                { label: "5 BHK Villa (1799 AED)", value: "5bhk-villa", price: 1799 },
            ],
            defaultValue: "studio"
        }
    ]
  }
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
