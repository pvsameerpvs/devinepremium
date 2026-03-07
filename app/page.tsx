import { SERVICES } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden">
      <SiteHeader />

      <section className="relative">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-24 -right-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px] opacity-50" />
        </div>

        <div className="container mx-auto px-4 pt-14 md:pt-20 pb-12 md:pb-16 relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-4 py-2 text-xs font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Premium home services across UAE</span>
                </div>

                <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                  A cleaner, brighter home —
                  <span className="block dp-gradient-text">done by pros you trust.</span>
                </h1>

                <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl">
                  Book trusted professionals for cleaning, painting, and maintenance in Dubai, Abu Dhabi &amp; Sharjah.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/#services"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-sm font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
                  >
                    Explore Services
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="https://wa.me/971563758229"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-sm font-semibold border border-border bg-background hover:bg-accent transition-colors"
                  >
                    WhatsApp Support
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Star, title: "4.9 average rating", desc: "Thousands of happy clients" },
                    { icon: Shield, title: "Vetted staff", desc: "Trained & professional" },
                    { icon: Clock, title: "On-time visits", desc: "Reliable scheduling" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-border bg-card/70 backdrop-blur p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10" />
                <div className="relative aspect-[4/3] md:aspect-[16/12] lg:aspect-[4/5]">
                  <Image
                    src="/hero-cleaning.jpg"
                    alt="Professional home cleaning"
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, (min-width: 768px) 60vw, 92vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white bg-gradient-to-t from-black/60 via-black/15 to-transparent">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">Home cleaning</p>
                  <p className="mt-1 text-sm text-white/90">Spotless results with trained professionals.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Eco-friendly", "Insured", "Same-day slots"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card/70 backdrop-blur px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-2 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[
            { value: "5000+", label: "Happy Clients", icon: Star },
            { value: "10+", label: "Years Experience", icon: Clock },
            { value: "50+", label: "Expert Staff", icon: Shield },
            { value: "4.9★", label: "Average Rating", icon: CheckCircle2 },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-5 text-center"
              >
                <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl md:text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <main id="services" className="container mx-auto px-4 py-14 md:py-20">
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
            <Link key={service.id} href={`/book/${service.slug}`} className="group block">
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
            </Link>
          ))}
        </div>
      </main>

      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="p-8 md:p-12 relative">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
              <h3 className="text-2xl md:text-4xl font-black tracking-tight">
                The Devine Premier difference.
              </h3>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                We combine premium products, trained staff, and reliable scheduling so your home feels immaculate — every time.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Shield,
                    title: "Vetted & trained",
                    desc: "Rigorous checks and continuous training.",
                  },
                  {
                    icon: Clock,
                    title: "On-time service",
                    desc: "Prompt arrival with full equipment.",
                  },
                  {
                    icon: Star,
                    title: "Premium quality",
                    desc: "Eco-friendly products and polished finishes.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border bg-background/60 p-5"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/#services"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-sm font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
                >
                  Book a Service
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-sm font-semibold border border-border bg-background hover:bg-accent transition-colors"
                >
                  Contact Us
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
