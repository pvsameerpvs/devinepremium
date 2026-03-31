import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { CustomerAccountPage } from "@/components/account/CustomerAccountPage";

export default function AccountPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <CustomerAccountPage />
      <Footer />
    </div>
  );
}
