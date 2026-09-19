import type { Metadata } from "next";
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
  title: "MedCare Hospital — Trusted Healthcare Excellence",
  description:
    "MedCare Hospital provides world-class healthcare with compassionate care, advanced technology, and expert physicians. Book your appointment today.",
  keywords: ["hospital", "healthcare", "medical", "doctor", "appointment"],
};

import Web3Providers from "@/components/Web3Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Web3Providers>
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}

