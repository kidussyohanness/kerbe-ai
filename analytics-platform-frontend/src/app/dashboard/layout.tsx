import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Dashboard - KERBÉ AI",
  description: "Upload and analyze your business documents with AI-powered insights.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
