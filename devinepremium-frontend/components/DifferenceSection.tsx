import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Shield,
  Star,
} from "lucide-react";

export function DifferenceSection() {
  return (
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
  );
}
