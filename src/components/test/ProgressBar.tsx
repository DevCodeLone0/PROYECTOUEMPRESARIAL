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
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {currentStep > 0 ? (
            <span className="text-white/90 font-semibold">
              Pregunta {currentStep} de {totalSteps}
            </span>
          ) : (
            <span className="text-white/90 font-semibold">Bienvenido</span>
          )}
          {displayDimension && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-white/50">{displayDimension}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Progress Bar — clean white/gray */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
