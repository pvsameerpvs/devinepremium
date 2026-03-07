import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Shield, Star, Clock } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">About</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">
            Devine Premier Technical Services
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            We deliver premium cleaning, painting, and maintenance services with a simple promise: show up on time, do the work right, and leave your space better than we found it.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Star, title: "Quality-first", desc: "Detail-focused service and premium finishing." },
            { icon: Shield, title: "Trusted team", desc: "Vetted professionals and clear communication." },
            { icon: Clock, title: "Reliable scheduling", desc: "Transparent slots and on-time arrivals." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-card overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Ready to book?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Choose a service, customize add-ons, and confirm your slot.
            </p>
            <div className="mt-6">
              <Link
                href="/#services"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-sm font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
              >
                Browse Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
