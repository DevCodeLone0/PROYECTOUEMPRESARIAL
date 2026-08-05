"use client";

import { useState } from "react";
import type { Program } from "@/lib/programs";

interface ProgramCardProps {
  program: Program;
  compatibility: number;
  rank: number;
}

export default function ProgramCard({
  program,
  compatibility,
  rank,
}: ProgramCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-white/20">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        {/* Rank */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
            rank === 1
              ? "bg-yellow-500/20 text-yellow-400"
              : rank === 2
              ? "bg-gray-300/20 text-gray-300"
              : rank === 3
              ? "bg-orange-500/20 text-orange-400"
              : "bg-white/10 text-white/60"
          }`}
        >
          #{rank}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{program.name}</div>
          <div className="text-xs text-white/40 capitalize">
            {program.modality === "presencial" ? "Presencial" : "Virtual"}
          </div>
        </div>

        {/* Compatibility */}
        <div className="text-right">
          <div className="text-lg font-bold text-violet-400">{compatibility}%</div>
          <div className="text-xs text-white/40">compatible</div>
        </div>

        {/* Expand icon */}
        <svg
          className={`w-5 h-5 text-white/40 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
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
      <div className="px-4 pb-2">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
            style={{ width: `${compatibility}%` }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <p className="text-sm text-white/60 leading-relaxed">
            {program.description}
          </p>
          <div className="bg-violet-500/5 border border-violet-500/10 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-violet-400 mb-1">
              Modelo Dual
            </h4>
            <p className="text-xs text-white/50 leading-relaxed">
              {program.whyDualModel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
