
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-background text-foreground pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* 1. Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
               <div className="bg-card p-2 rounded-xl inline-block border border-border">
                  <Image
                    src="/logo.png"
                    alt="Devine Premier Technical Services"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
               </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Delivering excellence in cleaning, maintenance, and technical services across Dubai. 
              Experience reliability, hygiene, and perfection with Devine Premier.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              <span className="text-[#00B4D8]">Quick Links</span>
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#7B2D8B] rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about-us" },
                { label: "Contact Us", href: "/contact-us" },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all inline-flex items-center gap-2 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              <span className="text-[#00B4D8]">Contact Info</span>
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#7B2D8B] rounded-full"></span>
            </h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-xs text-muted-foreground/80 mb-1">Email Us</span>
                    <a href="mailto:Devinepremier39@gmail.com" className="hover:text-foreground transition-colors">Devinepremier39@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-xs text-muted-foreground/80 mb-1">Call Us</span>
                    <a href="tel:+971563758229" className="hover:text-foreground transition-colors block">+971 56 375 8229</a>
                    <a href="tel:0523960074" className="hover:text-foreground transition-colors block mt-1">052 396 0074</a>
                </div>
              </li>
               <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                </div>
                <div>
                     <span className="block text-xs text-muted-foreground/80 mb-1">Our Location</span>
                    <span className="text-muted-foreground">Dubai, United Arab Emirates</span>
                </div>
              </li>
            </ul>
          </div>

          {/* 4. Subscribe */}
          <div>
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              <span className="text-[#00B4D8]">Subscribe for Updates</span>
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-[#7B2D8B] rounded-full"></span>
            </h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Stay connected with the latest offers and services from Devine Premier.
            </p>
            <div className="bg-card p-1 rounded-full flex focus-within:ring-1 ring-[#00B4D8]/50 transition-all border border-border">
               <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="border-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 h-11 px-4"
               />
               <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-[#00B4D8] to-[#7B2D8B] hover:opacity-90 transition-opacity">
                  Subscribe
               </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Devine Premier Technical Services. All rights reserved.
          </p>
          <Link
            href="/#services"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          >
            Book a service
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
