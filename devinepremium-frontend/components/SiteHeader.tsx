"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getStoredUserSession } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/about-us", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [accountHref, setAccountHref] = useState("/login");
  const [accountLabel, setAccountLabel] = useState("Login");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const session = getStoredUserSession();

    if (session?.token) {
      setAccountHref("/account");
      setAccountLabel("My Account");
      return;
    }

    setAccountHref("/login?redirect=%2Faccount");
    setAccountLabel("Login");
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* ── Logo ── */}
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

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-7 text-sm font-medium">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              href={accountHref}
              className="ml-4 inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {accountLabel}
            </Link>

            <Link
              href="/#services"
              className="relative inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
            >
              Book Now
            </Link>
          </nav>

          {/* ── Mobile Right Side ── */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/#services"
              className="relative inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold text-primary-foreground dp-gradient shadow-sm hover:opacity-95 transition-opacity"
            >
              Book Now
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobile}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-background shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-card p-1 border border-border">
                  <Image
                    src="/logo.png"
                    alt="Devine Premier"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-extrabold tracking-widest uppercase dp-gradient-text">
                    Devine Premier
                  </p>
                  <p className="text-[9px] tracking-widest uppercase text-muted-foreground">
                    Technical Services
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMobile}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col px-4 pt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-accent active:bg-accent/80"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {link.label === "Services" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    )}
                    {link.label === "About" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    )}
                    {link.label === "Contact" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    )}
                  </span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-5 my-3 h-px bg-border" />

            {/* Account & CTA */}
            <div className="flex flex-col gap-3 px-5">
              <Link
                href={accountHref}
                onClick={closeMobile}
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                {accountLabel}
              </Link>

              <Link
                href="/#services"
                onClick={closeMobile}
                className="flex items-center justify-center rounded-2xl dp-gradient px-5 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:opacity-95"
              >
                Book a Service
              </Link>
            </div>

            {/* Bottom branding */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border px-5 py-4">
              <p className="text-center text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Premium Technical Services · UAE
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
