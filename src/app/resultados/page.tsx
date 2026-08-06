"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTestStore } from "@/stores/test-store";
import { programs } from "@/lib/programs";
import Header from "@/components/layout/Header";
import type { RIASECProfile, ModalityResult, Archetype, ScoringResult } from "@/lib/scoring/types";
import Confetti from "@/components/ui/Confetti";
import ArchetypeCard from "@/components/results/ArchetypeCard";
import RadarChart from "@/components/results/RadarChart";
import ModalityCard from "@/components/results/ModalityCard";
import ProgramCard from "@/components/results/ProgramCard";
import GapAnalysis from "@/components/results/GapAnalysis";
import RankingFull from "@/components/results/RankingFull";

interface ResultsData {
  riasecProfile: RIASECProfile;
  modalityResult: ModalityResult;
  archetype: Archetype;
  aptitudeVec: number[];
  valuesVec: number[];
  rankedResults: ScoringResult[];
  answers: Record<string, number>;
}

function loadResults(): ResultsData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem("tufuturo-results");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function ResultadosPage() {
  const router = useRouter();
  const { isCompleted } = useTestStore();
  const [data] = useState<ResultsData | null>(loadResults);

  useEffect(() => {
    if (!data && !isCompleted) {
      router.push("/test");
    }
  }, [data, isCompleted, router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/40">Cargando resultados...</div>
      </div>
    );
  }

  const top3 = data.rankedResults.slice(0, 3);
  const top3WithProgram = top3.map((r) => ({
    ...r,
    program: programs.find((p) => p.id === r.programId)!,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Confetti />

      {/* Header */}
      <Header />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Hero result */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            <span className="gradient-text">Tu resultado</span>
          </h1>
          <p className="text-white/50 text-lg">
            Basado en tus respuestas, estos son tus arquetipos y programas ideales
          </p>
        </div>

        {/* Archetype */}
        <ArchetypeCard archetype={data.archetype} />

        {/* Radar Chart */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#D51933]/10 flex items-center justify-center text-xl">
              🎯
            </span>
            Tu perfil RIASEC
          </h3>
          <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-white/8 rounded-3xl p-6">
            <RadarChart profile={data.riasecProfile} />
          </div>
        </div>

        {/* Modality Card */}
        <ModalityCard modality={data.modalityResult} />

        {/* Top 3 */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center text-xl">
              🏆
            </span>
            Tus 3 carreras ideales
          </h3>
          <div className="space-y-3">
            {top3WithProgram.map((r, index) => (
              <ProgramCard
                key={r.programId}
                program={r.program}
                result={r}
                rank={index + 1}
                isExpanded={true}
                modalityRecommendation={data.modalityResult.recommendation}
              />
            ))}
          </div>
        </div>

        {/* Gap Analysis */}
        <GapAnalysis
          riasecProfile={data.riasecProfile}
          topProgramIds={top3.map((r) => r.programId)}
        />

        {/* Full ranking */}
        <RankingFull
          results={data.rankedResults}
          modalityRecommendation={data.modalityResult.recommendation}
        />

        {/* Disclaimer */}
        <div className="text-center text-xs text-white/20 pt-4 pb-8">
          <p>
            Los resultados son una guía basada en auto-percepción y no
            constituyen un diagnóstico psicológico certificado.
          </p>
        </div>
      </main>
    </div>
  );
}
