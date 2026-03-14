import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="https://devinepremierservices.ae/" className="flex items-center gap-3">
          <div className="rounded-xl bg-card p-1.5 border border-border">
            <Image
              src="/logo.png"
              alt="Devine Premier Technical Services"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-extrabold tracking-widest uppercase dp-gradient-text">
              Devine Premier
            </p>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
              Technical Services
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              href="/#services"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              href="/about-us"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          <Link
            href="/#services"
            className="relative inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
          >
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
