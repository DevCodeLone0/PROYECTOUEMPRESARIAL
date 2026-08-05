"use client";

import { useState } from "react";
import { programs } from "@/lib/programs";
import type { ScoringResult } from "@/lib/scoring";

interface RankingFullProps {
  results: ScoringResult[];
}

export default function RankingFull({ results }: RankingFullProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-all"
      >
        <span>{expanded ? "Ocultar" : "Ver los 12 programas"}</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
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
        <div className="space-y-2">
          {results.map((result, index) => {
            const program = programs.find((p) => p.id === result.programId);
            if (!program) return null;

            return (
              <div
                key={result.programId}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
              >
                {/* Rank */}
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                  {index + 1}
                </div>

                {/* Name and modality */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/80 truncate">
                    {program.name}
                  </div>
                  <div className="text-xs text-white/30 capitalize">
                    {program.modality}
                  </div>
                </div>

                {/* Bar and percentage */}
                <div className="w-24 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500/60 rounded-full"
                      style={{ width: `${result.compatibility}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white/50 w-8 text-right">
                    {result.compatibility}%
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
