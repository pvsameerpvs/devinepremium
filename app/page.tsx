import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Devine Premier Technical Services"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold tracking-widest uppercase leading-none" style={{ color: "#7B2D8B" }}>
                Devine Premier
              </p>
              <p className="text-[10px] tracking-widest uppercase text-gray-500 leading-none mt-0.5">
                Technical Services
              </p>
            </div>
          </Link>

          {/* Nav */}
          <nav>
            <ul className="flex items-center space-x-6 text-sm font-medium">
              <li>
                <Link href="/" className="text-foreground hover:text-[#00B4D8] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground hover:text-[#00B4D8] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground hover:text-[#00B4D8] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="px-4 py-2 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00B4D8 0%, #7B2D8B 100%)" }}
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 px-4" style={{ background: "linear-gradient(135deg, #0D0D1A 0%, #1a0a2e 60%, #0a1a2e 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#00B4D8" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "#7B2D8B" }} />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-[#00B4D8]/30 text-[#00B4D8]" style={{ background: "rgba(0,180,216,0.1)" }}>
            ✦ Trusted Home Services in UAE
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Professional Home{" "}
            <span style={{ background: "linear-gradient(135deg, #00B4D8 0%, #7B2D8B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Services
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
            Book trusted professionals for cleaning, painting, and maintenance.
            Top-rated service at your doorstep across Dubai, Abu Dhabi & Sharjah.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#services"
              className="px-8 py-3.5 rounded-full text-white font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-1 shadow-lg"
              style={{ background: "linear-gradient(135deg, #00B4D8 0%, #7B2D8B 100%)" }}
            >
              Explore Services
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full font-semibold text-base border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "5000+", label: "Happy Clients" },
              { value: "10+", label: "Years Experience" },
              { value: "50+", label: "Expert Technicians" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold" style={{ color: "#00B4D8" }}>{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <main id="services" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: "#00B4D8" }}>
            What We Offer
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Our{" "}
            <span style={{ background: "linear-gradient(135deg, #00B4D8 0%, #7B2D8B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Services
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Professional, reliable, and affordable home maintenance solutions tailored for you.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <Card
              key={service.id}
              className="dp-card-hover border border-border bg-card overflow-hidden group"
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00B4D8 0%, #7B2D8B 100%)" }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-[#00B4D8] transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="font-semibold" style={{ color: "#7B2D8B" }}>
                  {service.priceUnit
                    ? `From ${service.basePrice} AED ${service.priceUnit}`
                    : "Get a Quote"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {service.description || "Premium quality service guaranteed."}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full text-white font-semibold rounded-full transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #00B4D8 0%, #7B2D8B 100%)", border: "none" }}
                >
                  <Link href={`/book/${service.slug}`}>Book Now →</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
