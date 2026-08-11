"use client";

import { useState } from "react";
import { programs, getProgramById, getProgramBaseName } from "@/lib/programs";
import type { ScoringResult, ModalityResult } from "@/lib/scoring/types";

interface RankingFullProps {
  results: ScoringResult[];
  modalityRecommendation?: ModalityResult["recommendation"];
}

export default function RankingFull({
  results,
  modalityRecommendation,
}: RankingFullProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-300 text-slate-600 hover:border-[#0033A5] hover:text-[#0033A5] transition-all duration-300 font-medium bg-white/60"
      >
        <span>
          {expanded
            ? "Ocultar ranking completo"
            : `Ver el ranking completo (${results.length} programas)`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
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

      {/* Full ranking */}
      {expanded && (
        <div className="space-y-2 animate-fade-in">
          {results.map((result, index) => {
            const program = programs.find((p) => p.id === result.programId);
            if (!program) return null;

            const isModalityMatch =
              modalityRecommendation === program.modality;
            const twinId =
              program.modality === "virtual"
                ? program.id.replace(/-virtual$/, "")
                : `${program.id}-virtual`;
            const hasTwin = !!getProgramById(twinId);

            return (
              <div
                key={result.programId}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200/70 shadow-sm hover:border-slate-300 transition-all duration-300"
              >
                {/* Rank */}
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  {index + 1}
                </div>

                {/* Name and modality */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {getProgramBaseName(program.id)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    {(program.modality === "presencial" || hasTwin) && (
                      <span className="text-[10px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-1 py-0.5 rounded">
                        Presencial
                      </span>
                    )}
                    {(program.modality === "virtual" || hasTwin) && (
                      <span className="text-[10px] font-bold text-[#0033A5] bg-[#0033A5]/10 px-1 py-0.5 rounded">
                        Virtual
                      </span>
                    )}
                    {isModalityMatch && (
                      <span className="text-[10px] font-bold text-[#D51933] bg-[#D51933]/10 px-1 py-0.5 rounded">
                        Recomendado
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar and percentage */}
                <div className="w-28 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D51933] to-[#0033A5] rounded-full transition-all duration-500"
                      style={{ width: `${result.overallScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500 w-8 text-right">
                    {Math.round(result.overallScore)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
