"use client";

import { useState } from "react";
import LeadsTable, { statusLabel, modalityLabel, type Lead } from "@/components/admin/LeadsTable";
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

      // Dynamic import de exceljs
      // Nota de seguridad: reemplazamos xlsx@0.18.5 (última publicada en npm;
      // CVEs conocidas de Prototype Pollution GHSA-4r6h-8v6p-xvw6 y ReDoS
      // GHSA-5pgg-2g8v-p4x9, sin versión parcheada en npm) por exceljs, que
      // no tiene esas CVEs. Igual que antes, solo serializamos datos propios
      // del API (nunca archivos de usuario).
      const ExcelJS = await import("exceljs");

      const HEADER_FILL = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0033A5" },
      } as const;
      const TITLE_FILL = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD51933" },
      } as const;
      const BAND_FILL = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F7FF" },
      } as const;
      const SLATE_BORDER = {
        style: "thin",
        color: { argb: "FFE2E8F0" },
      } as const;
      const WHITE_BORDER = {
        style: "thin",
        color: { argb: "FFFFFFFF" },
      } as const;

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Leads");

      // Anchos de columna: Nombre, Email, Celular, Fecha, Arquetipo,
      // Modalidad, Confianza, Carrera 1/2/3, Estado, Consentimiento
      sheet.columns = [
        { width: 28 },
        { width: 34 },
        { width: 18 },
        { width: 14 },
        { width: 16 },
        { width: 14 },
        { width: 12 },
        { width: 30 },
        { width: 30 },
        { width: 30 },
        { width: 14 },
        { width: 14 },
      ];

      const carreraCell = (carrera: string, compatibilidad: number): string => {
        if (!carrera) return "";
        const base = sanitizeCell(carrera);
        return compatibilidad > 0 ? `${base} (${compatibilidad}%)` : base;
      };

      const confianzaLabel = (c: string | null | undefined): string =>
        c === "high" ? "Alta" : c === "medium" ? "Media" : c === "low" ? "Baja" : "";

      // Fila 1: título con merge A1:L1
      sheet.addRow(["Leads — Tu Futuro Dual"]);
      sheet.mergeCells("A1:L1");
      const titleRow = sheet.getRow(1);
      titleRow.height = 32;
      const titleCell = titleRow.getCell(1);
      titleCell.fill = TITLE_FILL;
      titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      // Borde delgado blanco en todas las celdas del merge
      titleRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: WHITE_BORDER,
          left: WHITE_BORDER,
          bottom: WHITE_BORDER,
          right: WHITE_BORDER,
        };
      });

      // Fila 2: encabezados
      sheet.addRow([
        "Nombre",
        "Email",
        "Celular",
        "Fecha",
        "Arquetipo",
        "Modalidad",
        "Confianza",
        "Carrera 1",
        "Carrera 2",
        "Carrera 3",
        "Estado",
        "Consentimiento",
      ]);
      const headerRow = sheet.getRow(2);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.fill = HEADER_FILL;
        cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      // Columnas centradas: Fecha, Modalidad, Confianza, Estado, Consentimiento
      const centeredCols = new Set([4, 6, 7, 11, 12]);

      // Filas de datos (3..n): banding con pares en azul claro
      data.leads.forEach((lead: Lead) => {
        const row = sheet.addRow([
          sanitizeCell(lead.nombre),
          sanitizeCell(lead.email),
          sanitizeCell(lead.celular),
          sanitizeCell(new Date(lead.timestamp).toLocaleDateString("es-CO")),
          sanitizeCell(lead.arquetipo),
          modalityLabel(lead.modality),
          confianzaLabel(lead.confidence),
          carreraCell(lead.carrera_1, lead.compatibilidad_1),
          carreraCell(lead.carrera_2, lead.compatibilidad_2),
          carreraCell(lead.carrera_3, lead.compatibilidad_3),
          lead.estado ? statusLabel(lead.estado) : "Nuevo",
          lead.consentimiento ? "Sí" : "No",
        ]);
        row.height = 20;
        const hasBand = row.number % 2 === 0;
        row.eachCell((cell, colNumber) => {
          if (hasBand) cell.fill = BAND_FILL;
          cell.font = { color: { argb: "FF1F2937" } };
          cell.border = {
            top: SLATE_BORDER,
            left: SLATE_BORDER,
            bottom: SLATE_BORDER,
            right: SLATE_BORDER,
          };
          cell.alignment = {
            horizontal: centeredCols.has(colNumber) ? "center" : "left",
            vertical: "middle",
          };
        });
      });

      // Congela título + encabezados y activa el filtro automático
      sheet.views = [{ state: "frozen", ySplit: 2 }];
      sheet.autoFilter = { from: "A2", to: "L2" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-tu-futuro-dual-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

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
