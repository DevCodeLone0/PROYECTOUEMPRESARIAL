"use client";

import { useState } from "react";
import { programs } from "@/lib/programs";
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
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/10 text-white/50 hover:border-[#0033A5] hover:text-[#0033A5] transition-all duration-300 font-medium"
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

            return (
              <div
                key={result.programId}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                {/* Rank */}
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/50">
                  {index + 1}
                </div>

                {/* Name and modality */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/80 truncate">
                    {program.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/25">
                    <span className="capitalize">{program.modality}</span>
                    {isModalityMatch && (
                      <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-1 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar and percentage */}
                <div className="w-28 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D51933]/50 rounded-full transition-all duration-500"
                      style={{ width: `${result.overallScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white/40 w-8 text-right">
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
