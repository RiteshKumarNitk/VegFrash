import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep these
import "./globals.css";
import { headers } from "next/headers";
import { CartProvider } from "@/context/CartContext";
import BottomNav from "@/components/ui/BottomNav";
import Footer from "@/components/ui/Footer";
import { getDarkVariant, getLightVariant } from "@/lib/colors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VegFrom - Fresh Produce Delivery",
  description: "Hyperlocal fresh vegetables and fruits delivery",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const primary = headersList.get("X-Theme-Primary") || "#0C831F";
  const gradient = headersList.get("X-Theme-Gradient") || "from-orange-500 via-red-500 to-yellow-500";
  const isFestival = headersList.get("X-Theme-Festival") === 'true';

  // Compute variants
  const primaryDark = getDarkVariant(primary);
  const primaryLight = getLightVariant(primary);

  return (
    <html lang="en" style={{
      "--theme-primary": primary,
      "--theme-primary-dark": primaryDark,
      "--theme-primary-light": primaryLight,
      "--theme-gradient-raw": gradient,
      "--theme-is-festival": isFestival ? '1' : '0',
    } as React.CSSProperties}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VegFrash" />
        <meta name="theme-color" content={primary} />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CartProvider>
          {children}
          <Footer />
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
