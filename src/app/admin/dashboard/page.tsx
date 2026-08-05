"use client";

import Dashboard from "@/components/admin/Dashboard";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          Métricas generales de leads
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
