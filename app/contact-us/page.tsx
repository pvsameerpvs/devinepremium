import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Contact</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">Get in touch</h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            Tell us what you need and when you need it. We will get back quickly with the best option.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">Call</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <a className="block hover:text-foreground transition-colors" href="tel:+971563758229">
                +971 56 375 8229
              </a>
              <a className="block hover:text-foreground transition-colors" href="tel:0523960074">
                052 396 0074
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">Email</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <a className="hover:text-foreground transition-colors" href="mailto:Devinepremier39@gmail.com">
                Devinepremier39@gmail.com
              </a>
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">Location</p>
            <p className="mt-2 text-sm text-muted-foreground">Dubai, United Arab Emirates</p>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-card overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Prefer WhatsApp?</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Send your location and service details, and we will confirm the best slot.
              </p>
            </div>
            <Link
              href="https://wa.me/971563758229"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-11 text-sm font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
            >
              Chat on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
