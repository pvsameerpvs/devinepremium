import { CheckCircle2, Clock, Shield, Star } from "lucide-react";

export function StatsSection() {
  return (
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
  );
}
