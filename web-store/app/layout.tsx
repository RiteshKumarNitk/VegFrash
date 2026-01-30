import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for Admin dashboard (cleaner)
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
      <body className={`${inter.className} bg-slate-50 flex min-h-screen`}>
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
