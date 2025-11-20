"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="glass-card glass-blue p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-accent-orange to-accent-blue rounded-full flex items-center justify-center text-2xl font-bold text-white">
            SET
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Coming Soon</h2>
          <p className="text-text-secondary">
            This feature is under development and will be available soon.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
