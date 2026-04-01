"use client";

import { useRouter } from "next/navigation";
import { getStoredUserSession } from "@/lib/auth";
import { SERVICES } from "@/lib/services";
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

export function HeroSection() {
  const router = useRouter();

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
            {SERVICES.map((service) => (
              <button 
                key={service.id} 
                type="button" 
                onClick={() => handleServiceClick(service.slug)}
                className="group block text-left"
              >
                <Card className="h-full rounded-3xl border-border bg-card dp-card-hover overflow-hidden">
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
        </div>
        
      </div>
    </section>
  );
}
