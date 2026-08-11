"use client";

import { useState } from "react";
import LeadsTable, { statusLabel, type Lead } from "@/components/admin/LeadsTable";
import LeadDetail from "@/components/admin/LeadDetail";

/**
 * CSV/Excel formula-injection guard: any string that could be interpreted as
 * a formula by Excel or Google Sheets gets an apostrophe prefix so it is
 * treated as plain text.
 */
function sanitizeCell(value: string): string {
  return /^[=+\-@\t]/.test(value) ? `'${value}` : value;
}

type ExportMessage = {
  kind: "error" | "success";
  text: string;
} | null;

export default function AdminLeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [archetype, setArchetype] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [estado, setEstado] = useState("");
  const [includePruebas, setIncludePruebas] = useState(false);
  const [message, setMessage] = useState<ExportMessage>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setMessage(null);
    setExporting(true);

    try {
      // Export uses the CURRENT filters plus pageSize=1000 so ALL matching
      // leads are included, not just the first page of the table.
      const params = new URLSearchParams({
        search,
        archetype,
        dateFrom,
        dateTo,
        estado,
        pageSize: "1000",
      });
      // Mismo toggle que la tabla: OFF (default) excluye leads de prueba.
      if (!includePruebas) params.set("esPrueba", "false");
      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setMessage({ kind: "error", text: "Error al exportar" });
        return;
      }

      if (!data.leads || data.leads.length === 0) {
        setMessage({ kind: "error", text: "No hay leads para exportar" });
        return;
      }

      // Dynamic import of xlsx
      // Nota de seguridad: xlsx@0.18.5 (última publicada en npm) tiene CVEs conocidas
      // (Prototype Pollution GHSA-4r6h-8v6p-xvw6 y ReDoS GHSA-5pgg-2g8v-p4x9).
      // No existe versión parcheada en npm; los builds oficiales con fixes solo se
      // distribuyen desde https://cdn.sheetjs.com. Mitigación actual: solo
      // serializamos datos propios del API (nunca archivos de usuario), por lo que
      // el vector de explotación no es alcanzable desde esta ruta.
      const XLSX = await import("xlsx");

      const exportData = data.leads.map((lead: Lead) => ({
        Nombre: sanitizeCell(lead.nombre),
        Email: sanitizeCell(lead.email),
        Celular: sanitizeCell(lead.celular),
        Arquetipo: sanitizeCell(lead.arquetipo),
        Estado: lead.estado ? statusLabel(lead.estado) : "Nuevo",
        "Compatibilidad Top 1": `${lead.compatibilidad_1}%`,
        "Carrera 1": sanitizeCell(lead.carrera_1),
        "Carrera 2": sanitizeCell(lead.carrera_2),
        "Carrera 3": sanitizeCell(lead.carrera_3),
        Fecha: sanitizeCell(
          new Date(lead.timestamp).toLocaleDateString("es-CO")
        ),
        Consentimiento: lead.consentimiento ? "Sí" : "No",
        "RIASEC R": lead.riasec_r,
        "RIASEC I": lead.riasec_i,
        "RIASEC A": lead.riasec_a,
        "RIASEC S": lead.riasec_s,
        "RIASEC E": lead.riasec_e,
        "RIASEC C": lead.riasec_c,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(
        wb,
        `leads-tu-futuro-dual-${new Date().toISOString().split("T")[0]}.xlsx`
      );

      setMessage({
        kind: "success",
        text: `${data.leads.length} leads exportados`,
      });
    } catch (error) {
      console.error("Export error:", error);
      setMessage({ kind: "error", text: "Error al exportar" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona los leads del test vocacional
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/25 text-[#16a34a] hover:bg-[#16a34a]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? "Exportando..." : "Exportar Excel"}
        </button>
      </div>

      {message && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            message.kind === "success"
              ? "bg-[#16a34a]/10 border-[#16a34a]/25 text-[#16a34a]"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            aria-label="Cerrar aviso"
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <LeadsTable
        onSelectLead={setSelectedLead}
        search={search}
        onSearchChange={setSearch}
        archetype={archetype}
        onArchetypeChange={setArchetype}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        estado={estado}
        onEstadoChange={setEstado}
        includePruebas={includePruebas}
        onIncludePruebasChange={setIncludePruebas}
      />

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onDeleted={() => {
            setSelectedLead(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
