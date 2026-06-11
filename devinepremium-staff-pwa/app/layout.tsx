import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devine Premium Staff",
  description: "Staff operations dashboard",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/logo.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/logo.png", type: "image/png" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Staff App",
  },
};

export const viewport: Viewport = {
  themeColor: "#152344",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
