"use client";

import { useEffect, useState } from "react";
import { QUESTION_BANK } from "@/lib/questions/question-bank";
import { LEAD_STATUSES } from "@/lib/schemas";
import { modalityLabel, type Lead } from "@/components/admin/LeadsTable";

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onDeleted: () => void;
}

/** Human-readable label for the confidence level. */
function confidenceLabel(c?: string | null): string {
  if (c === "high") return "Alta";
  if (c === "medium") return "Media";
  if (c === "low") return "Baja";
  return "—";
}

export default function LeadDetail({ lead, onClose, onDeleted }: LeadDetailProps) {
  const [estado, setEstado] = useState(lead.estado || "nuevo");
  const [notas, setNotas] = useState(lead.notas || "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"ok" | "error" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, estado, notas }),
      });
      setSaveMsg(res.ok ? "ok" : "error");
    } catch {
      setSaveMsg("error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar el lead de ${lead.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeleting(true);
    setDeleteMsg(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id }),
      });
      if (!res.ok) {
        setDeleteMsg(
          res.status === 404
            ? "El lead ya no existe."
            : "Error al eliminar. Intenta de nuevo."
        );
        return;
      }
      onDeleted();
    } catch {
      setDeleteMsg("Error de conexión. Intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  };

  let answers: Record<string, string | number> = {};
  try {
    answers = JSON.parse(lead.respuestas_raw || "{}");
  } catch {
    // ignore
  }

  // Q16 is a single-choice aptitude question; resolve the selected option
  // text instead of rendering the raw index.
  const rawQ16 = answers.Q16;
  const q16 = QUESTION_BANK.find((q) => q.id === "Q16");
  const q16Index = typeof rawQ16 === "number" ? rawQ16 : Number(rawQ16);
  const q16Option =
    q16?.options && Number.isInteger(q16Index) && q16Index >= 0
      ? q16.options[q16Index]
      : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Slide-in side panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del lead"
        className="w-full md:max-w-lg h-full md:max-h-[90vh] bg-white border-l border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/70">
          <h3 className="font-bold text-slate-900 text-lg">Detalle del Lead</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contacto
            </h4>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="text-slate-900 font-bold">{lead.nombre}</div>
                {lead.esPrueba && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-700 uppercase tracking-wide">
                    Prueba
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">{lead.email}</div>
              <div className="text-sm text-slate-500">{lead.celular}</div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Consentimiento
            </h4>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    lead.consentimiento ? "bg-[#16a34a]" : "bg-red-600"
                  }`}
                />
                <span className="text-sm text-slate-600">
                  {lead.consentimiento ? "Aceptado" : "No aceptado"}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {new Date(lead.timestamp).toLocaleString("es-CO")}
              </div>
            </div>
          </div>

          {/* Seguimiento */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Seguimiento
            </h4>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-3">
              <div>
                <label
                  htmlFor="lead-estado"
                  className="block text-xs text-slate-500 mb-1"
                >
                  Estado del lead
                </label>
                <select
                  id="lead-estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-[#D51933]/50 focus:outline-none text-sm shadow-sm"
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status === "nuevo" && "Nuevo"}
                      {status === "contactado" && "Contactado"}
                      {status === "en_proceso" && "En proceso"}
                      {status === "admitido" && "Admitido"}
                      {status === "descartado" && "Descartado"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="lead-notas"
                  className="block text-xs text-slate-500 mb-1"
                >
                  Notas internas
                </label>
                <textarea
                  id="lead-notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: llamada realizada, interesado en beca..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933]/50 focus:outline-none text-sm min-h-[96px] resize-y shadow-sm"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#D51933] to-[#0033A5] text-white shadow-lg shadow-[#D51933]/25 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {saveMsg === "ok" && (
                <p className="text-sm text-[#16a34a]">Cambios guardados</p>
              )}
              {saveMsg === "error" && (
                <p className="text-sm text-red-600">
                  Error al guardar. Intenta de nuevo.
                </p>
              )}
              {lead.actualizado_en && (
                <p className="text-xs text-slate-400 mt-2">
                  Actualizado:{" "}
                  {new Date(lead.actualizado_en).toLocaleString("es-CO")}
                </p>
              )}
            </div>
          </div>

          {/* Archetype */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Arquetipo
            </h4>
            <div className="bg-[#D51933]/5 border border-[#D51933]/10 rounded-xl p-4">
              <div className="text-[#D51933] font-bold">{lead.arquetipo}</div>
            </div>
          </div>

          {/* Modalidad + Confianza */}
          {(lead.modality || lead.confidence) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Resultado
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                  <div className="text-xs text-slate-500">Modalidad</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {modalityLabel(lead.modality)}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                  <div className="text-xs text-slate-500">Confianza</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {confidenceLabel(lead.confidence)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scores */}
          <div className="space-y-3">
            {lead.riasec_r + lead.riasec_i + lead.riasec_a + lead.riasec_s + lead.riasec_e + lead.riasec_c > 0 ? (
              <>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Perfil RIASEC
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Realista (R)", value: lead.riasec_r },
                    { label: "Investigativo (I)", value: lead.riasec_i },
                    { label: "Artístico (A)", value: lead.riasec_a },
                    { label: "Social (S)", value: lead.riasec_s },
                    { label: "Emprendedor (E)", value: lead.riasec_e },
                    { label: "Convencional (C)", value: lead.riasec_c },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Puntajes por dimensión
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Intereses", value: lead.puntaje_intereses },
                    { label: "Personalidad", value: lead.puntaje_personalidad },
                    { label: "Habilidades", value: lead.puntaje_habilidades },
                    { label: "Motivación", value: lead.puntaje_motivacion },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Top 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top 3 Programas
            </h4>
            <div className="space-y-2">
              {[
                { name: lead.carrera_1, pct: lead.compatibilidad_1 },
                { name: lead.carrera_2, pct: lead.compatibilidad_2 },
                { name: lead.carrera_3, pct: lead.compatibilidad_3 },
              ]
                .filter((p) => p.name)
                .map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 rounded-xl p-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700 font-medium">{p.name}</div>
                    </div>
                    <div className="text-sm font-bold text-[#0033A5]">
                      {p.pct}%
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Q16 — aptitude single-choice, rendered as option text */}
          {rawQ16 !== undefined && rawQ16 !== "" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {q16?.text ?? "Q16"}
              </h4>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-sm text-slate-600">
                {q16Option ?? String(rawQ16)}
              </div>
            </div>
          )}

          {/* Delete */}
          <div className="pt-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 rounded-xl font-bold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all duration-300 disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Eliminar lead"}
            </button>
            {deleteMsg && (
              <p className="text-sm text-red-600 text-center mt-2">{deleteMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
