"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUserSession } from "@/lib/auth";
import { fetchActiveServices, type Service } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronRight,
  Sparkles,
} from "lucide-react";

const SERVICE_IMAGE_FALLBACK = "/hero-cleaning.jpg";

function formatServicePrice(service: Service) {
  if (service.basePrice > 0) {
    if (service.priceUnit === "/hr") {
      return `From ${service.basePrice} AED/hr + VAT`;
    }

    if (service.priceUnit === "starting from") {
      return `From ${service.basePrice} AED + VAT`;
    }

    return `From ${service.basePrice} AED ${service.priceUnit || ""} + VAT`;
  }

  if (service.priceUnit === "based on selection" || service.priceUnit === "per sqm") {
    return "Based on selection + VAT";
  }

  return "Get a Quote";
}

export function HeroSection() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let isActive = true;

    void fetchActiveServices().then((nextServices) => {
      if (isActive) {
        setServices(nextServices);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  function handleServiceClick(slug: string) {
    const session = getStoredUserSession();
    if (!session?.token) {
      router.push(`/login?redirect=${encodeURIComponent(`/book/${slug}`)}`);
    } else {
      router.push(`/book/${slug}`);
    }
  }

  return (
    <section className="relative">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-24 -right-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px] opacity-50" />
      </div>

      <div className="container mx-auto px-4  pb-12 md:pb-16 relative z-10">
       

        <div id="services" className="mt-14 md:mt-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Services</p>
            <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">
              Book a service in minutes.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Transparent pricing, clear add-ons, and fast scheduling.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <button 
                key={service.id} 
                type="button" 
                onClick={() => handleServiceClick(service.slug)}
                className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="h-full rounded-3xl border-border bg-card dp-card-hover overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={service.image || SERVICE_IMAGE_FALLBACK}
                      alt={`${service.title} service`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-xl leading-tight text-white drop-shadow-sm break-words">
                          {service.title}
                        </CardTitle>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/90 text-primary shadow-sm backdrop-blur">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardDescription className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {formatServicePrice(service)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
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
        </div>
        
      </div>
    </section>
  );
}
