
import { fetchServiceBySlug } from "@/lib/services";
import { notFound } from "next/navigation";
import { BookingStepper } from "@/components/booking/BookingStepper";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function BookServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = await fetchServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Page Title Banner ── */}
      <div className="py-10 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-primary">
            Book a Service
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {service.title}
          </h1>
          {service.description && (
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
              {service.description}
            </p>
          )}
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
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
