"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Metrics {
  total: number;
  thisWeek: number;
  thisMonth: number;
  daily: { date: string; count: number }[];
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/metrics");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMetrics(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    loadMetrics();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-200/60 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 bg-slate-200/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-6">Error al cargar métricas</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0033A5] hover:border-[#0033A5]/40 text-sm transition-all duration-300 shadow-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Total leads",
      value: metrics.total,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-[#D51933]",
      bg: "bg-[#D51933]/10",
    },
    {
      label: "Esta semana",
      value: metrics.thisWeek,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-[#0033A5]",
      bg: "bg-[#0033A5]/10",
    },
    {
      label: "Este mes",
      value: metrics.thisMonth,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-amber-600",
      bg: "bg-amber-400/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm hover:border-[#0033A5]/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 font-medium">{card.label}</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">
                  {card.value}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Leads por día (últimos 30 días)
        </h3>
        {metrics.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis
                dataKey="date"
                stroke="rgba(15,23,42,0.25)"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value: string) => value.slice(5)}
              />
              <YAxis stroke="rgba(15,23,42,0.25)" tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.1)",
                  borderRadius: "12px",
                  color: "#0f172a",
                }}
              />
              <Bar dataKey="count" fill="#D51933" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0033A5]/10 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#0033A5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p>Aún no hay leads. ¡Comparte el test!</p>
          </div>
        )}
      </div>
    </div>
  );
}
