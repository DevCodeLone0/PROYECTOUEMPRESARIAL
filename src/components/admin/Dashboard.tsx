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

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12 text-white/40">
        Error al cargar métricas
      </div>
    );
  }

  const cards = [
    {
      label: "Total leads",
      value: metrics.total,
      icon: "📊",
      color: "from-violet-500/10 to-violet-500/5",
    },
    {
      label: "Esta semana",
      value: metrics.thisWeek,
      icon: "📅",
      color: "from-blue-500/10 to-blue-500/5",
    },
    {
      label: "Este mes",
      value: metrics.thisMonth,
      icon: "📈",
      color: "from-green-500/10 to-green-500/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border border-white/10 rounded-xl p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/50">{card.label}</div>
                <div className="text-3xl font-bold text-white mt-1">
                  {card.value}
                </div>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Leads por día (últimos 30 días)
        </h3>
        {metrics.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => value.slice(5)}
              />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-white/40">
            <div className="text-4xl mb-4">📭</div>
            <p>Aún no hay leads. ¡Comparte el test!</p>
          </div>
        )}
      </div>
    </div>
  );
}
