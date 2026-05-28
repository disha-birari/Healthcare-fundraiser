import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedCare Hospital — Trusted Healthcare Excellence",
  description:
    "MedCare Hospital provides world-class healthcare with compassionate care, advanced technology, and expert physicians. Book your appointment today.",
  keywords: ["hospital", "healthcare", "medical", "doctor", "appointment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
