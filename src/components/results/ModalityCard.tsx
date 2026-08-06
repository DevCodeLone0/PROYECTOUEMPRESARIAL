"use client";

import type { ModalityResult } from "@/lib/scoring/types";
import { programs } from "@/lib/programs";

interface ModalityCardProps {
  modality: ModalityResult;
}

const CONFIDENCE_STYLES: Record<
  ModalityResult["confidence"],
  { bg: string; text: string; label: string }
> = {
  high: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Alta confianza",
  },
  medium: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    label: "Confianza media",
  },
  low: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    label: "Confianza baja",
  },
};

export default function ModalityCard({ modality }: ModalityCardProps) {
  const isPresencial = modality.recommendation === "presencial";
  const emoji = isPresencial ? "🏫" : "💻";
  const label = isPresencial ? "Presencial" : "Virtual";
  const styles = CONFIDENCE_STYLES[modality.confidence];

  const matchingCount = programs.filter(
    (p) => p.modality === modality.recommendation
  ).length;

  return (
    <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-white/8 rounded-3xl p-6 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Modalidad recomendada
          </h3>
          <p className="text-sm text-white/40">
            Basado en tus respuestas y estilo de vida
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold gradient-text">{label}</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text}`}
        >
          {styles.label}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-sm text-white/50 leading-relaxed">
        {modality.explanation || "Basado en tus respuestas"}
      </p>

      {/* Matching programs count */}
      <div className="bg-white/3 border border-white/5 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#0033A5]/10 flex items-center justify-center text-lg">
          📚
        </div>
        <div>
          <p className="text-sm text-white/70 font-medium">
            {matchingCount} de tus programas recomendados son{" "}
            {label.toLowerCase()}
          </p>
          <p className="text-xs text-white/30">
            {isPresencial
              ? "Con experiencia presencial en empresa"
              : "Con flexibilidad de estudio remoto"}
          </p>
        </div>
      </div>
    </div>
  );
}
