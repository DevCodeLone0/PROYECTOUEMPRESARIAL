"use client";

import { useState } from "react";
import type { Program } from "@/lib/programs";
import { getProgramById, getProgramBaseName } from "@/lib/programs";
import type { ScoringResult, ModalityResult } from "@/lib/scoring/types";

interface ProgramCardProps {
  program: Program;
  result: ScoringResult;
  rank: number;
  isExpanded?: boolean;
  modalityRecommendation?: ModalityResult["recommendation"];
}

const FIT_LABELS: Record<
  keyof ScoringResult["fitBreakdown"],
  { label: string; color: string }
> = {
  personality: { label: "Personalidad", color: "bg-[#D51933]" },
  technical: { label: "Aptitud técnica", color: "bg-[#0033A5]" },
  lifestyle: { label: "Estilo de vida", color: "bg-[#00ff88]" },
};

const rankColors: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-[#fbbf24]/15", text: "text-[#fbbf24]" },
  2: { bg: "bg-white/10", text: "text-white/70" },
  3: { bg: "bg-[#cd7f32]/15", text: "text-[#cd7f32]" },
};

export default function ProgramCard({
  program,
  result,
  rank,
  isExpanded: controlledExpanded,
  modalityRecommendation,
}: ProgramCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  const colors = rankColors[rank] || { bg: "bg-white/5", text: "text-white/50" };
  const isModalityMatch = modalityRecommendation === program.modality;
  const twinId =
    program.modality === "virtual"
      ? program.id.replace(/-virtual$/, "")
      : `${program.id}-virtual`;
  const hasTwin = !!getProgramById(twinId);

  return (
    <div
      className={`bg-white/3 border rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/15 ${rank === 1 ? "border-[#fbbf24]/25" : "border-white/8"} ${expanded ? "shadow-xl shadow-black/20" : ""}`}
    >
      {/* Header */}
      <button
        onClick={() => setInternalExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        {/* Rank */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${colors.bg} ${colors.text}`}
        >
          #{rank}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white truncate">
            {getProgramBaseName(program.id)}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {(program.modality === "presencial" || hasTwin) && (
              <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-1.5 py-0.5 rounded">
                Presencial
              </span>
            )}
            {(program.modality === "virtual" || hasTwin) && (
              <span className="text-[10px] font-bold text-[#4da6ff] bg-[#4da6ff]/10 px-1.5 py-0.5 rounded">
                Virtual
              </span>
            )}
            {isModalityMatch && (
              <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-1.5 py-0.5 rounded">
                Recomendado
              </span>
            )}
          </div>
        </div>

        {/* Compatibility */}
        <div className="text-right">
          <div className="text-lg font-bold text-[#00ff88]">
            {Math.round(result.overallScore)}%
          </div>
          <div className="text-xs text-white/30">compatible</div>
        </div>

        {/* Expand icon */}
        <svg
          className={`w-5 h-5 text-white/30 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
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

      {/* Compatibility bar */}
      <div className="px-5 pb-3">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full transition-all duration-700"
            style={{ width: `${result.overallScore}%` }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4 animate-fade-in">
          {/* Fit breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Desglose de compatibilidad
            </h4>
            {(Object.entries(FIT_LABELS) as [keyof typeof FIT_LABELS, { label: string; color: string }][]).map(
              ([key, { label, color }]) => {
                const value = result.fitBreakdown[key];
                const isHighest =
                  value >= result.fitBreakdown.personality &&
                  value >= result.fitBreakdown.technical &&
                  value >= result.fitBreakdown.lifestyle;
                const isLowest =
                  value <= result.fitBreakdown.personality &&
                  value <= result.fitBreakdown.technical &&
                  value <= result.fitBreakdown.lifestyle;

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${isHighest ? "text-white font-bold" : isLowest ? "text-white/30" : "text-white/50"}`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-white/40 font-medium">
                        {Math.round(value)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{
                          width: `${value}%`,
                          opacity: isLowest ? 0.4 : 0.8,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-white/50 leading-relaxed">
            {program.description}
          </p>

          {/* Dual Model */}
          <div className="bg-[#D51933]/5 border border-[#D51933]/10 rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#D51933] uppercase tracking-wider mb-2">
              Modelo Dual
            </h4>
            <p className="text-xs text-white/40 leading-relaxed">
              {program.whyDualModel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
