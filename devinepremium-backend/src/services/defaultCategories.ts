export interface DefaultCategoryInput {
  title: string;
  slug: string;
  description?: string;
  sortOrder: number;
}

export const DEFAULT_CATEGORIES: DefaultCategoryInput[] = [
  {
    title: "Cleaning Services",
    slug: "cleaning",
    description: "Professional cleaning for homes, offices, and upholstery.",
    sortOrder: 10,
  },
  {
    title: "Maintenance & AC",
    slug: "maintenance",
    description: "Expert AC servicing, repair, and general home maintenance.",
    sortOrder: 20,
  },
  {
    title: "Painting & Renovation",
    slug: "renovation",
    description: "High-quality painting and specialized renovation works.",
    sortOrder: 30,
  },
];
