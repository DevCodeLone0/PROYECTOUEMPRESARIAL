"use client";

import { useState, useEffect } from "react";

/**
 * Human-readable label for a lead status, falling back to the raw value
 * when the status is unknown.
 */
export function statusLabel(s: string): string {
  const labels: Record<string, string> = {
    nuevo: "Nuevo",
    contactado: "Contactado",
    en_proceso: "En proceso",
    admitido: "Admitido",
    descartado: "Descartado",
  };
  return labels[s] ?? s;
}

/**
 * Badge color classes for a lead status, with a neutral fallback for
 * unknown values.
 */
export function statusBadgeClasses(s: string): string {
  const classes: Record<string, string> = {
    nuevo: "bg-[#4da6ff]/15 text-[#4da6ff]",
    contactado: "bg-[#00ff88]/15 text-[#00ff88]",
    en_proceso: "bg-[#fbbf24]/15 text-[#fbbf24]",
    admitido: "bg-[#a78bfa]/15 text-[#a78bfa]",
    descartado: "bg-red-500/15 text-red-400",
  };
  return classes[s] ?? "bg-white/5 text-white/40";
}

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  celular: string;
  arquetipo: string;
  compatibilidad_1: number;
  timestamp: string;
  consentimiento: boolean;
  puntaje_intereses: number;
  puntaje_personalidad: number;
  puntaje_habilidades: number;
  puntaje_motivacion: number;
  carrera_1: string;
  carrera_2: string;
  carrera_3: string;
  compatibilidad_2: number;
  compatibilidad_3: number;
  respuestas_raw: string;
  riasec_r: number;
  riasec_i: number;
  riasec_a: number;
  riasec_s: number;
  riasec_e: number;
  riasec_c: number;
  estado: string;
  notas: string;
  actualizado_en: string;
}

interface LeadsTableProps {
  onSelectLead: (lead: Lead) => void;
  search: string;
  onSearchChange: (value: string) => void;
  archetype: string;
  onArchetypeChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  estado: string;
  onEstadoChange: (value: string) => void;
}

export default function LeadsTable({
  onSelectLead,
  search,
  onSearchChange,
  archetype,
  onArchetypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  estado,
  onEstadoChange,
}: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLeads() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        archetype,
        dateFrom,
        dateTo,
        estado,
      });

      try {
        const res = await fetch(`/api/admin/leads?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setLeads(data.leads || []);
          setTotal(data.total || 0);
        }
      } catch {
        if (!cancelled) {
          setLeads([]);
          setTotal(0);
          setError("Error al cargar los leads. Intenta de nuevo.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLeads();
    return () => {
      cancelled = true;
    };
  }, [page, search, archetype, dateFrom, dateTo, estado]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      {/* Filters — Clean input fields */}
      <div className="flex flex-wrap gap-3">
        <label htmlFor="leads-search" className="sr-only">
          Buscar nombre o email
        </label>
        <input
          id="leads-search"
          type="text"
          placeholder="Buscar nombre o email..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-[200px] p-3.5 rounded-xl bg-white/3 border border-white/5 text-white placeholder-white/25 focus:border-[#D51933]/50 focus:bg-[#D51933]/3 focus:outline-none text-sm transition-all duration-300"
        />
        <label htmlFor="leads-archetype" className="sr-only">
          Filtrar por arquetipo
        </label>
        <input
          id="leads-archetype"
          type="text"
          placeholder="Arquetipo..."
          value={archetype}
          onChange={(e) => {
            onArchetypeChange(e.target.value);
            setPage(1);
          }}
          className="w-48 p-3.5 rounded-xl bg-white/3 border border-white/5 text-white placeholder-white/25 focus:border-[#D51933]/50 focus:bg-[#D51933]/3 focus:outline-none text-sm transition-all duration-300"
        />
        <label htmlFor="leads-estado" className="sr-only">
          Filtrar por estado
        </label>
        <select
          id="leads-estado"
          value={estado}
          onChange={(e) => {
            onEstadoChange(e.target.value);
            setPage(1);
          }}
          className="p-3.5 rounded-xl bg-white/3 border border-white/5 text-white focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300"
        >
          <option value="" className="bg-[#141414] text-white">
            Todos los estados
          </option>
          <option value="nuevo" className="bg-[#141414] text-white">
            Nuevo
          </option>
          <option value="contactado" className="bg-[#141414] text-white">
            Contactado
          </option>
          <option value="en_proceso" className="bg-[#141414] text-white">
            En proceso
          </option>
          <option value="admitido" className="bg-[#141414] text-white">
            Admitido
          </option>
          <option value="descartado" className="bg-[#141414] text-white">
            Descartado
          </option>
        </select>
        <label htmlFor="leads-date-from" className="sr-only">
          Desde
        </label>
        <input
          id="leads-date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => {
            onDateFromChange(e.target.value);
            setPage(1);
          }}
          className="p-3.5 rounded-xl bg-white/3 border border-white/5 text-white focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300"
        />
        <label htmlFor="leads-date-to" className="sr-only">
          Hasta
        </label>
        <input
          id="leads-date-to"
          type="date"
          value={dateTo}
          onChange={(e) => {
            onDateToChange(e.target.value);
            setPage(1);
          }}
          className="p-3.5 rounded-xl bg-white/3 border border-white/5 text-white focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300"
        />
      </div>

      {/* Table — Chaptr clean style */}
      <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-white/30">
            No se encontraron leads
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-white/40 font-medium">
                    Nombre
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium">
                    Email
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium">
                    Arquetipo
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium">
                    Estado
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium">
                    Compat.
                  </th>
                  <th className="text-left p-4 text-white/40 font-medium">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => onSelectLead(lead)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectLead(lead);
                      }
                    }}
                    className="border-b border-white/3 hover:bg-white/3 cursor-pointer transition-colors focus:outline-none focus:bg-white/5"
                  >
                    <td className="p-4 text-white/80 font-medium">
                      {lead.nombre}
                    </td>
                    <td className="p-4 text-white/50">{lead.email}</td>
                    <td className="p-4 text-white/50">{lead.arquetipo}</td>
                    <td className="p-4">
                      <span
                        className={
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium " +
                          statusBadgeClasses(lead.estado)
                        }
                      >
                        {statusLabel(lead.estado)}
                      </span>
                    </td>
                    <td className="p-4 text-[#00ff88] font-bold">
                      {lead.compatibilidad_1}%
                    </td>
                    <td className="p-4 text-white/30">
                      {new Date(lead.timestamp).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/30">
            {total} leads encontrados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-sm transition-all duration-300"
            >
              Anterior
            </button>
            <span className="text-sm text-white/30 px-3">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-sm transition-all duration-300"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
