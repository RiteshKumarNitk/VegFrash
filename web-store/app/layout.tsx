import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for Admin dashboard (cleaner)
import "./globals.css";


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
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
