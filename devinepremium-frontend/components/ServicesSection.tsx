"use client";

import { fetchActiveServices, fetchCategories, type Service, type ServiceCategory } from "@/lib/services";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function ServicesSection() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const categoryParam = activeCategoryId === "all" ? undefined : activeCategoryId;
    fetchActiveServices(categoryParam).then((data) => {
      setServices(data);
      setIsLoading(false);
    });
  }, [activeCategoryId]);

  function handleServiceClick(slug: string) {
    const session = getStoredUserSession();
    if (!session?.token) {
      router.push(`/login?redirect=${encodeURIComponent(`/book/${slug}`)}`);
    } else {
      router.push(`/book/${slug}`);
    }
  }

  return (
    <main id="services" className="container mx-auto px-4 py-14 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Services</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">
            Book a service in minutes.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Transparent pricing, clear add-ons, and fast scheduling.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-10 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategoryId("all")}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
            activeCategoryId === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
              : "bg-background hover:bg-muted text-muted-foreground border-border"
          )}
        >
          All Services
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all border",
              activeCategoryId === cat.id
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-background hover:bg-muted text-muted-foreground border-border"
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className={cn(
        "mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300",
        isLoading ? "opacity-50" : "opacity-100"
      )}>
        {services.map((service) => (
          <button 
            key={service.id} 
            type="button"
            onClick={() => handleServiceClick(service.slug)} 
            className="group block text-left w-full h-full"
          >
            <Card className="h-full rounded-3xl border-border bg-card dp-card-hover overflow-hidden">
              {service.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {service.basePrice > 0
                        ? service.priceUnit === "/hr"
                          ? `From ${service.basePrice} AED/hr + VAT`
                          : service.priceUnit === "starting from"
                            ? `From ${service.basePrice} AED + VAT`
                            : `From ${service.basePrice} AED ${service.priceUnit || ""} + VAT`
                        : service.priceUnit === "based on selection" || service.priceUnit === "per sqm"
                          ? "Based on selection + VAT"
                          : "Get a Quote"}
                    </CardDescription>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 border border-border flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description ||
                    "Premium quality service delivered by trained professionals."}
                </p>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Book service
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </main>
  );
}
