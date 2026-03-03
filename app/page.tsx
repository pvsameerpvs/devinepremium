import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { CheckCircle2, Star, Shield, Clock, Sparkles, ChevronRight, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#03030A] text-slate-50 selection:bg-[#00B4D8]/30 overflow-hidden font-sans">
      {/* ── Header ── */}
      <header className="absolute top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#7B2D8B] opacity-0 group-hover:opacity-40 blur transition duration-500"></div>
              <Image
                src="/logo.png"
                alt="Devine Premier Technical Services"
                width={50}
                height={50}
                className="object-contain relative z-10"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black tracking-widest uppercase leading-none bg-gradient-to-r from-[#00B4D8] to-[#7B2D8B] bg-clip-text text-transparent">
                Devine Premier
              </p>
              <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400 leading-none mt-1">
                Technical Services
              </p>
            </div>
          </Link>

          {/* Nav */}
          <nav>
            <ul className="flex items-center space-x-6 md:space-x-8 text-sm font-medium">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors relative group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00B4D8] transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li className="hidden md:block">
                <Link href="/about-us" className="text-slate-300 hover:text-white transition-colors relative group">
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00B4D8] transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li className="hidden md:block">
                <Link href="/contact-us" className="text-slate-300 hover:text-white transition-colors relative group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00B4D8] transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="relative inline-flex h-9 md:h-10 items-center justify-center overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all hover:scale-105"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite]" style={{ background: "conic-gradient(from 90deg at 50% 50%, #00B4D8 0%, #7B2D8B 50%, #00B4D8 100%)"}}></span>
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 md:px-6 py-1 text-xs md:text-sm font-semibold text-white backdrop-blur-3xl">
                    Book Now
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ── Cinematic Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center justify-center min-h-[90vh]">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#00B4D8] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7B2D8B] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border border-white/10 bg-white/5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-[#00B4D8]" />
            <span className="text-slate-300">Premium Home Services in UAE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Elevate Your <br className="hidden md:block" />
            <span className="relative">
              Living Space
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#00B4D8]/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Experience unparalleled cleaning, painting, and maintenance with Devine Premier. 
            <strong className="text-slate-200 font-medium"> Top-rated service at your doorstep across Dubai, Abu Dhabi & Sharjah.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link
              href="#services"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(0,180,216,0.5)]"
              style={{ background: "linear-gradient(135deg, #00B4D8 0%, #7B2D8B 100%)" }}
            >
              <span className="relative z-10">Explore Our Services</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            <Link
              href="https://wa.me/971563758229"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* ── Floating Stats Bar ── */}
      <section className="relative z-20 -mt-16 md:-mt-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-6 md:p-10 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
            {[
              { value: "5000+", label: "Happy Clients", icon: Star },
              { value: "10+", label: "Years Experience", icon: Clock },
              { value: "50+", label: "Expert Staff", icon: Shield },
              { value: "4.9★", label: "Average Rating", icon: CheckCircle2 },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-[#00B4D8] group-hover:scale-110 group-hover:bg-[#00B4D8]/10 transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl md:text-4xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Services Showcase ── */}
      <main id="services" className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-4 text-[#00B4D8]">
            What We Do Best
          </h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
            Our Premium <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-[#00B4D8] via-[#7B2D8B] to-[#00B4D8] bg-clip-text text-transparent bg-300% animate-gradient">
              Service Offerings
            </span>
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Impeccable quality. Unmatched reliability. Discover our collection of specialized services designed for your peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {SERVICES.map((service, index) => (
            <Link key={service.id} href={`/book/${service.slug}`} className="group block h-full">
              <Card className="h-full border border-white/10 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,180,216,0.3)] rounded-3xl relative">
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00B4D8]/0 to-[#7B2D8B]/0 group-hover:from-[#00B4D8]/10 group-hover:to-[#7B2D8B]/10 transition-all duration-500 z-0 pointer-events-none"></div>
                
                <CardHeader className="relative z-10 pb-4 pt-8 px-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B4D8]/20 to-[#7B2D8B]/20 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-7 h-7 text-[#00B4D8]" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-[#00B4D8] transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="font-semibold text-[#7B2D8B] text-base flex items-center gap-2">
                    {service.priceUnit ? `From ${service.basePrice} AED ${service.priceUnit}` : "Get a Quote"}
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 px-8 pb-8">
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {service.description || "Experience premium quality service delivered by our trained professionals."}
                  </p>
                  <div className="flex items-center text-sm font-bold text-white group-hover:text-[#00B4D8] transition-colors">
                    Book Service
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      {/* ── Why Choose Us Bento Grid ── */}
      <section className="bg-slate-950 border-t border-b border-white/5 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7B2D8B]/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">The Devine Premier <span className="text-[#00B4D8]">Difference</span></h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">We don't just clean or fix; we elevate your living standards with meticulous attention to detail.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Shield className="w-32 h-32 text-white" /></div>
               <div className="w-12 h-12 rounded-full bg-[#00B4D8]/20 flex items-center justify-center mb-6 text-[#00B4D8]"><Shield className="w-6 h-6" /></div>
               <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Vetted & Trained Professionals</h3>
               <p className="text-slate-400 leading-relaxed max-w-md relative z-10">Every member of our team undergoes rigorous background checks and continuous training to ensure they meet our exacting standards of excellence.</p>
            </div>
            
            {/* Box 2 */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 rounded-3xl border border-white/10 group">
               <div className="w-12 h-12 rounded-full bg-[#7B2D8B]/20 flex items-center justify-center mb-6 text-[#7B2D8B]"><Clock className="w-6 h-6" /></div>
               <h3 className="text-xl font-bold text-white mb-3">On-Time, Every Time</h3>
               <p className="text-slate-400 leading-relaxed text-sm">We respect your time. Our scheduling is precise, and our professionals arrive promptly, fully equipped and ready to work.</p>
            </div>

            {/* Box 3 */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 rounded-3xl border border-white/10 group">
               <div className="w-12 h-12 rounded-full bg-[#00B4D8]/20 flex items-center justify-center mb-6 text-[#00B4D8]"><Star className="w-6 h-6" /></div>
               <h3 className="text-xl font-bold text-white mb-3">Premium Quality</h3>
               <p className="text-slate-400 leading-relaxed text-sm">We use top-tier, eco-friendly products and state-of-the-art equipment to deliver results that truly shine.</p>
            </div>

            {/* Box 4 */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#00B4D8]/10 to-[#7B2D8B]/10 p-8 md:p-12 rounded-3xl border border-white/10 group flex flex-col justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
               <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Ready for a spotless home?</h3>
               <p className="text-slate-300 mb-8 max-w-lg relative z-10">Join thousands of satisfied customers across the UAE who trust Devine Premier with their properties.</p>
               <Link href="#services" className="relative z-10 inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold w-fit hover:bg-slate-200 transition-colors shadow-lg">
                  Book A Service Now <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
      
      {/* Required for the animate-gradient class */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
        .bg-300\\% {
          background-size: 300% 300%;
        }
      `}} />
    </div>
  );
}
