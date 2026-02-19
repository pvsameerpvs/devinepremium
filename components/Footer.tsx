
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-[#0D0D1A] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* 1. Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
               <div className="bg-white p-2 rounded-lg inline-block">
                  <Image
                    src="/logo.png"
                    alt="Devine Premier Technical Services"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
               </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
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
              {['Home', 'About Us', 'Our Services', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === 'Home' ? '/' : item === 'Our Services' ? '/#services' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></span>
                    {item}
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
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-xs text-gray-500 mb-1">Email Us</span>
                    <a href="mailto:Devinepremier39@gmail.com" className="hover:text-white transition-colors">Devinepremier39@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                </div>
                <div>
                    <span className="block text-xs text-gray-500 mb-1">Call Us</span>
                    <a href="tel:+971563758229" className="hover:text-white transition-colors block">+971 56 375 8229</a>
                    <a href="tel:0523960074" className="hover:text-white transition-colors block mt-1">052 396 0074</a>
                </div>
              </li>
               <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                </div>
                <div>
                     <span className="block text-xs text-gray-500 mb-1">Our Location</span>
                    <span className="text-gray-400">Dubai, United Arab Emirates</span>
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
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Stay connected with the latest offers and services from Devine Premier.
            </p>
            <div className="bg-white/5 p-1 rounded-full flex focus-within:ring-1 ring-[#00B4D8]/50 transition-all border border-gray-700">
               <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="border-0 bg-transparent text-white placeholder:text-gray-500 focus-visible:ring-0 h-11 px-4"
               />
               <Button className="rounded-full h-11 px-6 bg-gradient-to-r from-[#00B4D8] to-[#7B2D8B] hover:opacity-90 transition-opacity">
                  Subscribe
               </Button>
            </div>
          </div>
        </div>

       
      </div>
    </footer>
  );
}
