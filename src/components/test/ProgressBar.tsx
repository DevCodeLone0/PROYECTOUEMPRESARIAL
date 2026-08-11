"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  dimension?: string;
}

/** Map dimension keys to human-readable Spanish labels */
const dimensionLabels: Record<string, string> = {
  // Layer 1 — RIASEC dimensions
  R: "Realista",
  I: "Investigativo",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
  // Layer 2 — Aptitudes
  "aptitude-logical": "Lógica",
  "aptitude-planning": "Planificación",
  "aptitude-learning": "Aprendizaje",
  "aptitude-pressure": "Presión",
  "aptitude-focus": "Concentración",
  // Layer 3 — Values
  autonomy: "Autonomía",
  "work-style": "Estilo de trabajo",
  "risk-tolerance": "Tolerancia al riesgo",
  schedule: "Horario",
  orientation: "Orientación",
  // Layer 4 — Modality
  modality: "Entorno",
  "modality-discipline": "Autonomía",
  "modality-access": "Interacción",
  // Legacy dimensions (backward compat)
  intereses: "Intereses",
  personalidad: "Personalidad",
  habilidades: "Habilidades",
  motivacion: "Motivación",
  cierre: "Cierre",
};

export default function ProgressBar({
  currentStep,
  totalSteps,
  dimension,
}: ProgressBarProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const displayDimension = dimension && dimensionLabels[dimension]
    ? dimensionLabels[dimension]
    : null;

  return (
    <div className="w-full space-y-2">
      {/* Top row: question counter + dimension */}
      <div className="flex items-center justify-between text-lg">
        <div className="flex items-center gap-3">
          {currentStep > 0 ? (
            <span className="text-slate-900 font-black">
              Pregunta {currentStep} de {totalSteps}
            </span>
          ) : (
            <span className="text-slate-900 font-black">Bienvenido</span>
          )}
          {displayDimension && (
            <>
              <span className="text-[#0033A5]/30">·</span>
              <span className="text-slate-500 font-semibold">{displayDimension}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#0033A5] text-base font-black">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress Bar — brand gradient */}
      <div className="relative h-2.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D51933] to-[#0033A5] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(213,25,51,0.5)]"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
