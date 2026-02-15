import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for Admin dashboard (cleaner)
import { Toaster } from "sonner";
import "./globals.css";


import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Store Ops - VegFrash",
  description: "Dark Store Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <AppShell>
          {children}
        </AppShell>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
