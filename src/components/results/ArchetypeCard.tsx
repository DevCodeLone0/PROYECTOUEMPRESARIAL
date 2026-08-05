"use client";

import type { Archetype } from "@/lib/archetypes";

interface ArchetypeCardProps {
  archetype: Archetype;
}

export default function ArchetypeCard({ archetype }: ArchetypeCardProps) {
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-6 md:p-8 text-center space-y-4">
      {/* Emoji */}
      <div className="text-7xl md:text-8xl animate-bounce">{archetype.emoji}</div>

      {/* Name */}
      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        {archetype.name}
      </h2>

      {/* Description */}
      <p className="text-white/70 leading-relaxed max-w-lg mx-auto">
        {archetype.description}
      </p>

      {/* Why Dual Model */}
      <div className="bg-white/5 rounded-xl p-4 text-left mt-4">
        <h3 className="text-sm font-semibold text-violet-400 mb-2">
          ¿Por qué el Modelo Dual es para ti?
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">
          {archetype.whyDualModel}
        </p>
      </div>
    </div>
  );
}
