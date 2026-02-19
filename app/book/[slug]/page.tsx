
import { getServiceBySlug } from "@/lib/services";
import { notFound } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BookServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Devine Premier Technical Services"
              width={56}
              height={56}
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
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-[#00B4D8] transition-colors"
          >
          Home
          </Link>
          
        </div>
      </header>

      {/* ── Page Title Banner ── */}
      <div className="py-10 px-4 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D0D1A 0%, #1a0a2e 60%, #0a1a2e 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: "#00B4D8" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: "#7B2D8B" }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#00B4D8" }}>
            Book a Service
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            {service.title}
          </h1>
          {service.description && (
            <p className="text-gray-300 mt-2 max-w-xl mx-auto text-sm">{service.description}</p>
          )}
        </div>
      </div>

      {/* ── Booking Form ── */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <BookingStepper service={service} />
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
