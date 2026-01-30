import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep these
import "./globals.css";
import { headers } from "next/headers";
import { CartProvider } from "@/context/CartContext";

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
  const primary = headersList.get("X-Theme-Primary") || "#00BFA5";
  const secondary = headersList.get("X-Theme-Secondary") || "#FFD700";
  const accent = headersList.get("X-Theme-Accent") || "#E65100";
  const gradient = headersList.get("X-Theme-Gradient") || "linear-gradient(135deg, #00BFA5, #00897B)";

  return (
    <html lang="en" style={{
      "--theme-primary": primary,
      "--theme-secondary": secondary,
      "--theme-accent": accent,
      "--theme-gradient": gradient,
    } as React.CSSProperties}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
