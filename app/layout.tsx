import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/hooks/use-cart";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { WebVitals } from "@/components/web-vitals";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  ...generateSEOMetadata({
    title: "QuickHaat - Your Curated Online Marketplace",
    description:
      "Discover quality products at amazing prices. Shop electronics, fashion, home & living, and more.",
    path: "",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <CartProvider>
            {children}
            <Toaster />
            <Analytics />
            <SpeedInsights />
            <WebVitals />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
