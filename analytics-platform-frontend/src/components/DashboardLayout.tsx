"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import ErrorBoundary from "./ErrorBoundary";
import ApiErrorBoundary from "./ApiErrorBoundary";
import ParticleSystem from "./ui/ParticleSystem";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-glass-bg-primary animated-bg relative">
      {/* Particle System Background */}
      <ParticleSystem particleCount={30} />
      
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Fixed Header */}
      <Header />

      {/* Main content with proper spacing for fixed elements */}
      <main className="lg:ml-64 pt-16 overflow-y-auto min-h-screen relative z-10">
        <div className="py-4 lg:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <ApiErrorBoundary>
                {children}
              </ApiErrorBoundary>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
