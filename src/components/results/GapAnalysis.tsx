"use client";

import { useState } from "react";
import type { RIASECDimension, RIASECProfile } from "@/lib/scoring/types";
import { PROGRAM_PROFILES } from "@/lib/scoring/programs-matrix";
import { programs } from "@/lib/programs";

interface GapAnalysisProps {
  riasecProfile: RIASECProfile;
  topProgramIds: string[];
}

const DIMENSION_LABELS: Record<RIASECDimension, string> = {
  R: "Realista",
  I: "Investigativo",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

const SUGGESTIONS: Record<RIASECDimension, string> = {
  R: "Desarrolla habilidades técnicas y prácticas",
  I: "Fortalece tu pensamiento analítico y investigación",
  A: "Explora tu lado creativo y expresivo",
  S: "Practica trabajo en equipo y liderazgo social",
  E: "Desarrolla habilidades de negociación y emprendimiento",
  C: "Refuerza la organización y atención al detalle",
};

const DIMENSIONS: RIASECDimension[] = ["R", "I", "A", "S", "E", "C"];

function GapBar({
  student,
  required,
  dimension,
}: {
  student: number;
  required: number;
  dimension: RIASECDimension;
}) {
  const ratio = required > 0 ? student / required : 1;

  let status: "strong" | "gap" | "significant";
  let statusColor: string;
  let statusLabel: string;

  if (ratio >= 0.9) {
    status = "strong";
    statusColor = "bg-emerald-400";
    statusLabel = "✓ Fuerte";
  } else if (ratio >= 0.6) {
    status = "gap";
    statusColor = "bg-yellow-400";
    statusLabel = "Brecha";
  } else {
    status = "significant";
    statusColor = "bg-orange-400";
    statusLabel = "Brecha significativa";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">
          {DIMENSION_LABELS[dimension]}
        </span>
        <span
          className={`text-xs font-bold ${
            status === "strong"
              ? "text-emerald-400"
              : status === "gap"
                ? "text-yellow-400"
                : "text-orange-400"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Student bar */}
      <div className="relative h-5 bg-white/5 rounded-full overflow-hidden">
        {/* Requirement line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
          style={{ left: `${required * 100}%` }}
        />
        {/* Student fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ${statusColor}`}
          style={{
            width: `${Math.min(student * 100, 100)}%`,
            opacity: 0.7,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-white/30">
        <span>Tú: {Math.round(student * 100)}%</span>
        <span>Requerido: {Math.round(required * 100)}%</span>
      </div>

      {status !== "strong" && (
        <p className="text-xs text-white/35 italic">{SUGGESTIONS[dimension]}</p>
      )}
    </div>
  );
}

export default function GapAnalysis({
  riasecProfile,
  topProgramIds,
}: GapAnalysisProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#0033A5]/10 flex items-center justify-center text-sm">
          📊
        </span>
        Análisis de brechas
      </h3>

      {topProgramIds.slice(0, 3).map((programId, index) => {
        const program = programs.find((p) => p.id === programId);
        const programProfile = PROGRAM_PROFILES.find(
          (p) => p.id === programId
        );
        if (!program || !programProfile) return null;

        const isOpen = expandedIndex === index;

        return (
          <div
            key={programId}
            className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(isOpen ? null : index)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/80 truncate">
                  {program.name}
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-white/30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4 animate-fade-in">
                {DIMENSIONS.map((dim) => (
                  <GapBar
                    key={dim}
                    student={riasecProfile[dim]}
                    required={programProfile.riasec[dim]}
                    dimension={dim}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
