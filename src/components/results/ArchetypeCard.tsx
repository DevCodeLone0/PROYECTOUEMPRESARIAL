"use client";

import type { RIASECDimension } from "@/lib/scoring/types";
import type { Archetype } from "@/lib/scoring/types";

export interface RelatedArchetype {
  archetype: Archetype;
  similarity: number;
}

export interface TopDimension {
  dim: RIASECDimension;
  label: string;
  value: number;
}

interface ArchetypeCardProps {
  archetype: Archetype;
  affinity?: number;
  relatedArchetypes?: RelatedArchetype[];
  topDimensions?: TopDimension[];
}

export default function ArchetypeCard({
  archetype,
  affinity,
  relatedArchetypes = [],
  topDimensions = [],
}: ArchetypeCardProps) {
  const topLabels = topDimensions.map((d) => d.label);
  const whyText =
    topLabels.length >= 3
      ? `Tus dimensiones dominantes son ${topLabels[0]}, ${topLabels[1]} y ${topLabels[2]}. ${archetype.name} se construye sobre esa combinación: refleja cómo piensas, cómo decides y cómo afrontas los retos, y por eso sus rasgos te resultan tan familiares.`
      : archetype.description;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-white/8 rounded-3xl p-8 md:p-10 text-center space-y-6 neon-border">
      {/* Background decorative */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#D51933]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00ff88]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      {/* Emoji */}
      <div className="text-7xl md:text-8xl animate-float relative z-10">
        {archetype.emoji}
      </div>

      {/* Name + affinity badge */}
      <div className="relative z-10 space-y-3">
        <h2 className="text-3xl md:text-4xl font-extrabold gradient-text">
          {archetype.name}
        </h2>
        {typeof affinity === "number" && (
          <span className="inline-block px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-xs font-bold text-[#00ff88]">
            {affinity}% de afinidad con tu perfil
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-white/60 leading-relaxed max-w-lg mx-auto text-lg relative z-10">
        {archetype.description}
      </p>

      {/* Why this archetype */}
      {topDimensions.length >= 3 && (
        <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-left relative z-10">
          <h3 className="text-sm font-bold text-[#D51933] uppercase tracking-wider mb-3">
            Por qué este arquetipo
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">{whyText}</p>
        </div>
      )}

      {/* Related archetypes */}
      {relatedArchetypes.length > 0 && (
        <div className="text-left relative z-10">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
            También podrías identificarte con
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedArchetypes.map(({ archetype: related, similarity }) => (
              <div
                key={related.id}
                className="bg-white/3 border border-white/5 rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:border-white/15"
              >
                <span className="text-3xl">{related.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">
                    {related.name}
                  </p>
                  <p className="text-xs font-semibold text-[#00ff88]">
                    {Math.round(similarity * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why Dual Model */}
      <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-left relative z-10">
        <h3 className="text-sm font-bold text-[#00ff88] uppercase tracking-wider mb-3">
          ¿Por qué el Modelo Dual es para ti?
        </h3>
        <p className="text-sm text-white/50 leading-relaxed">
          {archetype.whyDualModel}
        </p>
      </div>
    </div>
  );
}
