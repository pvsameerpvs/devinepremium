import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      {children}
      <Footer />
    </div>
  );
}
