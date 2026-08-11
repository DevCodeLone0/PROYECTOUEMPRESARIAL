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
    nuevo: "bg-[#0033A5]/10 text-[#0033A5]",
    contactado: "bg-[#16a34a]/10 text-[#16a34a]",
    en_proceso: "bg-amber-400/20 text-amber-700",
    admitido: "bg-violet-500/10 text-violet-600",
    descartado: "bg-red-500/10 text-red-600",
  };
  return classes[s] ?? "bg-slate-100 text-slate-500";
}

/**
 * Human-readable label for a lead modality, with a neutral fallback when
 * the lead has no modality yet.
 */
export function modalityLabel(m?: string | null): string {
  if (m === "presencial") return "Presencial";
  if (m === "virtual") return "Virtual";
  return "—";
}

export interface Lead {
  id: number;
  nombre: string;
  email: string;
  celular: string;
  arquetipo: string;
  modality?: string | null;
  confidence?: string | null;
  esPrueba?: boolean;
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
  includePruebas: boolean;
  onIncludePruebasChange: (value: boolean) => void;
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
  includePruebas,
  onIncludePruebasChange,
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
      // "Incluir pruebas" OFF (default): excluye leads de prueba del listado.
      // ON: sin el param → trae todos (comportamiento anterior).
      if (!includePruebas) params.set("esPrueba", "false");

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
  }, [page, search, archetype, dateFrom, dateTo, estado, includePruebas]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      {/* Filters */}
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
          className="flex-1 min-w-[200px] p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300 shadow-sm"
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
          className="w-48 p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300 shadow-sm"
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
          className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300 shadow-sm"
        >
          <option value="">Todos los estados</option>
          <option value="nuevo">Nuevo</option>
          <option value="contactado">Contactado</option>
          <option value="en_proceso">En proceso</option>
          <option value="admitido">Admitido</option>
          <option value="descartado">Descartado</option>
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
          className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300 shadow-sm"
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
          className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-[#D51933]/50 focus:outline-none text-sm transition-all duration-300 shadow-sm"
        />
        <label htmlFor="leads-include-pruebas" className="sr-only">
          Incluir leads de prueba
        </label>
        <label
          htmlFor="leads-include-pruebas"
          className="flex items-center gap-2 p-3.5 rounded-xl bg-white border border-slate-200 cursor-pointer select-none hover:bg-slate-50 transition-colors shadow-sm"
        >
          <input
            id="leads-include-pruebas"
            type="checkbox"
            checked={includePruebas}
            onChange={(e) => {
              onIncludePruebasChange(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded accent-[#D51933]"
          />
          <span className="text-sm text-slate-600">Incluir pruebas</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No se encontraron leads
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/60">
                  <th className="text-left p-4 text-slate-500 font-medium">
                    Nombre
                  </th>
                  <th className="text-left p-4 text-slate-500 font-medium">
                    Email
                  </th>
                  <th className="text-left p-4 text-slate-500 font-medium">
                    Arquetipo
                  </th>
                  <th className="text-left p-4 text-slate-500 font-medium">
                    Modalidad
                  </th>
                  <th className="text-left p-4 text-slate-500 font-medium">
                    Estado
                  </th>
                  <th className="text-left p-4 text-slate-500 font-medium">
                    Compat.
                  </th>
                  <th className="text-left p-4 text-slate-500 font-medium">
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
                    className="border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors focus:outline-none focus:bg-slate-50"
                  >
                    <td className="p-4 text-slate-900 font-medium">
                      {lead.nombre}
                    </td>
                    <td className="p-4 text-slate-500">{lead.email}</td>
                    <td className="p-4 text-slate-500">{lead.arquetipo}</td>
                    <td className="p-4 text-slate-500">
                      {modalityLabel(lead.modality)}
                    </td>
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
                    <td className="p-4 text-[#0033A5] font-bold">
                      {lead.compatibilidad_1}%
                    </td>
                    <td className="p-4 text-slate-400">
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
          <div className="text-sm text-slate-500">
            {total} leads encontrados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0033A5] hover:border-[#0033A5]/40 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all duration-300 shadow-sm"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-500 px-3">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0033A5] hover:border-[#0033A5]/40 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-all duration-300 shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
