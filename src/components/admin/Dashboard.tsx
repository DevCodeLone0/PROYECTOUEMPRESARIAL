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
              className="h-28 bg-white/3 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 bg-white/3 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-white/30 mb-6">Error al cargar métricas</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-white/60 hover:text-white text-sm transition-all duration-300"
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
      color: "text-[#00ff88]",
      bg: "bg-[#00ff88]/5",
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
      bg: "bg-[#0033A5]/5",
    },
    {
      label: "Este mes",
      value: metrics.thisMonth,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-[#D51933]",
      bg: "bg-[#D51933]/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards — Chaptr clean */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white/3 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/40 font-medium">{card.label}</div>
                <div className="text-3xl font-extrabold text-white mt-2">
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

      {/* Chart — Clean card */}
      <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">
          Leads por día (últimos 30 días)
        </h3>
        {metrics.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => value.slice(5)}
              />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "white",
                }}
              />
              <Bar dataKey="count" fill="#D51933" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-white/30">
            <div className="text-4xl mb-4">📭</div>
            <p>Aún no hay leads. ¡Comparte el test!</p>
          </div>
        )}
      </div>
    </div>
  );
}
