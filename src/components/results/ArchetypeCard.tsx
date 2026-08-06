"use client";

import type { Archetype } from "@/lib/scoring/types";

interface ArchetypeCardProps {
  archetype: Archetype;
}

export default function ArchetypeCard({ archetype }: ArchetypeCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-white/8 rounded-3xl p-8 md:p-10 text-center space-y-6 neon-border">
      {/* Background decorative */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#D51933]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00ff88]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      {/* Emoji */}
      <div className="text-7xl md:text-8xl animate-float relative z-10">
        {archetype.emoji}
      </div>

      {/* Name */}
      <h2 className="text-3xl md:text-4xl font-extrabold gradient-text relative z-10">
        {archetype.name}
      </h2>

      {/* Description */}
      <p className="text-white/60 leading-relaxed max-w-lg mx-auto text-lg relative z-10">
        {archetype.description}
      </p>

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
