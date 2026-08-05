"use client";

import { useState } from "react";
import LeadsTable, { type Lead } from "@/components/admin/LeadsTable";
import LeadDetail from "@/components/admin/LeadDetail";

export default function AdminLeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/leads?search=&archetype=&dateFrom=&dateTo=");
      const data = await res.json();

      if (!data.leads || data.leads.length === 0) {
        alert("No hay leads para exportar");
        return;
      }

      // Dynamic import of xlsx
      const XLSX = await import("xlsx");

      const exportData = data.leads.map((lead: Lead) => ({
        Nombre: lead.nombre,
        Email: lead.email,
        Celular: lead.celular,
        Arquetipo: lead.arquetipo,
        "Compatibilidad Top 1": `${lead.compatibilidad_1}%`,
        "Carrera 1": lead.carrera_1,
        "Carrera 2": lead.carrera_2,
        "Carrera 3": lead.carrera_3,
        Fecha: new Date(lead.timestamp).toLocaleDateString("es-CO"),
        Consentimiento: lead.consentimiento ? "Sí" : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, `leads-tu-futuro-dual-${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error al exportar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-white/40 mt-1">
            Gestiona los leads del test vocacional
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Excel
        </button>
      </div>

      <LeadsTable onSelectLead={setSelectedLead} />

      {selectedLead && (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
