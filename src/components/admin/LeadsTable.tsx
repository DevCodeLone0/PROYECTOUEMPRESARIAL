"use client";

import { useState, useEffect, useCallback } from "react";

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
}

interface LeadsTableProps {
  onSelectLead: (lead: Lead) => void;
}

export default function LeadsTable({ onSelectLead }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [archetype, setArchetype] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      search,
      archetype,
      dateFrom,
      dateTo,
    });

    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, archetype, dateFrom, dateTo]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar nombre o email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-[200px] p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none text-sm"
        />
        <input
          type="text"
          placeholder="Arquetipo..."
          value={archetype}
          onChange={(e) => {
            setArchetype(e.target.value);
            setPage(1);
          }}
          className="w-48 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none text-sm"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Cargando...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            No se encontraron leads
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/50 font-medium">
                    Nombre
                  </th>
                  <th className="text-left p-4 text-white/50 font-medium">
                    Email
                  </th>
                  <th className="text-left p-4 text-white/50 font-medium">
                    Arquetipo
                  </th>
                  <th className="text-left p-4 text-white/50 font-medium">
                    Compat.
                  </th>
                  <th className="text-left p-4 text-white/50 font-medium">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="p-4 text-white/80 font-medium">
                      {lead.nombre}
                    </td>
                    <td className="p-4 text-white/60">{lead.email}</td>
                    <td className="p-4 text-white/60">{lead.arquetipo}</td>
                    <td className="p-4 text-violet-400 font-bold">
                      {lead.compatibilidad_1}%
                    </td>
                    <td className="p-4 text-white/40">
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
          <div className="text-sm text-white/40">
            {total} leads encontrados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Anterior
            </button>
            <span className="text-sm text-white/40">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
