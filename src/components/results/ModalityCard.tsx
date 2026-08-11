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
    text: "text-emerald-600",
    label: "Alta confianza",
  },
  medium: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600",
    label: "Confianza media",
  },
  low: {
    bg: "bg-orange-500/10",
    text: "text-orange-600",
    label: "Confianza baja",
  },
};

export default function ModalityCard({ modality }: ModalityCardProps) {
  const isPresencial = modality.recommendation === "presencial";
  const label = isPresencial ? "Presencial" : "Virtual";
  const styles = CONFIDENCE_STYLES[modality.confidence];
  const isLowConfidence = modality.confidence === "low";

  const matchingCount = programs.filter(
    (p) => p.modality === modality.recommendation
  ).length;

  return (
    <div className="bg-white border border-slate-200/70 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0033A5]/10 border border-[#0033A5]/15 flex items-center justify-center">
          {isPresencial ? (
            <svg
              className="w-7 h-7 text-[#0033A5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 text-[#0033A5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Modalidad recomendada
          </h3>
          <p className="text-sm text-slate-500">
            Basado en tus respuestas y estilo de vida
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-extrabold gradient-text">{label}</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text}`}
        >
          {styles.label}
        </span>
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Por qué esta modalidad
        </h4>
        {isLowConfidence ? (
          <div className="border border-orange-300 bg-orange-50 rounded-xl p-4">
            <p className="text-sm text-orange-700 leading-relaxed">
              {modality.explanation || "Basado en tus respuestas"}
            </p>
          </div>
        ) : (
          <p className="text-[15px] text-slate-600 leading-relaxed">
            {modality.explanation || "Basado en tus respuestas"}
          </p>
        )}
      </div>

      {/* Matching programs count */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#0033A5]/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-[#0033A5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-slate-700 font-medium">
            {matchingCount} de tus programas recomendados son{" "}
            {label.toLowerCase()}
          </p>
          <p className="text-xs text-slate-400">
            {isPresencial
              ? "Con experiencia presencial en empresa"
              : "Con flexibilidad de estudio remoto"}
          </p>
        </div>
      </div>
    </div>
  );
}
