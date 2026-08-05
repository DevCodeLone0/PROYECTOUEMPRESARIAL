"use client";

interface LeadDetailProps {
  lead: {
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
  };
  onClose: () => void;
}

export default function LeadDetail({ lead, onClose }: LeadDetailProps) {
  let answers: Record<string, string | number> = {};
  try {
    answers = JSON.parse(lead.respuestas_raw || "{}");
  } catch {
    // ignore
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[80vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-bold text-white">Detalle del Lead</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Contact info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Contacto
            </h4>
            <div className="bg-white/5 rounded-xl p-3 space-y-1">
              <div className="text-white font-medium">{lead.nombre}</div>
              <div className="text-sm text-white/60">{lead.email}</div>
              <div className="text-sm text-white/60">{lead.celular}</div>
            </div>
          </div>

          {/* Consent */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Consentimiento
            </h4>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    lead.consentimiento ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className="text-sm text-white/60">
                  {lead.consentimiento ? "Aceptado" : "No aceptado"}
                </span>
              </div>
              <div className="text-xs text-white/40 mt-1">
                {new Date(lead.timestamp).toLocaleString("es-CO")}
              </div>
            </div>
          </div>

          {/* Archetype */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Arquetipo
            </h4>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
              <div className="text-violet-400 font-bold">{lead.arquetipo}</div>
            </div>
          </div>

          {/* Scores */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Puntajes por dimensión
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Intereses", value: lead.puntaje_intereses },
                { label: "Personalidad", value: lead.puntaje_personalidad },
                { label: "Habilidades", value: lead.puntaje_habilidades },
                { label: "Motivación", value: lead.puntaje_motivacion },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/40">{item.label}</div>
                  <div className="text-lg font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
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
                    className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white/80">{p.name}</div>
                    </div>
                    <div className="text-sm font-bold text-violet-400">
                      {p.pct}%
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Q16 */}
          {answers.Q16 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Lo que me apasiona
              </h4>
              <div className="bg-white/5 rounded-xl p-3 text-sm text-white/60">
                {String(answers.Q16)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
