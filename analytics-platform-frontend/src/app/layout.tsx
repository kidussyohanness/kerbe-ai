import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
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
  title: "KERBÉ AI - Business Analytics Platform",
  description: "Transform your business documents into actionable insights with AI-powered analytics. Upload financial reports, balance sheets, and business documents to get instant analysis and recommendations.",
  keywords: "business analytics, AI analysis, financial reports, document analysis, business intelligence",
  authors: [{ name: "KERBÉ AI Team" }],
  robots: "index, follow",
  openGraph: {
    title: "KERBÉ AI - Business Analytics Platform",
    description: "Transform your business documents into actionable insights with AI-powered analytics.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
