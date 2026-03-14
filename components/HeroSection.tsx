import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";

export function HeroSection() {
  return (
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
  );
}
