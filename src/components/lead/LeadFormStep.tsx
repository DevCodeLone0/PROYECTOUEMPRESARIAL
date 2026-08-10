"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTestStore } from "@/stores/test-store";
import { programs } from "@/lib/programs";
import type { RIASECProfile, ModalityResult, Archetype, ScoringResult } from "@/lib/scoring/types";
import LeadForm from "./LeadForm";
import Header from "@/components/layout/Header";

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

export default function LeadFormStep() {
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
        <div className="text-white/40">Cargando...</div>
      </div>
    );
  }

  const top3 = data.rankedResults.slice(0, 3);
  const top3ForLead = top3.map((r) => {
    const prog = programs.find((p) => p.id === r.programId);
    return {
      carrera: prog?.name || "",
      compatibilidad: Math.round(r.overallScore),
    };
  });

  // Map new RIASEC profile to legacy scores format for LeadForm compatibility
  const scores = {
    intereses: Math.round(data.riasecProfile.R * 100),
    personalidad: Math.round(data.riasecProfile.I * 100),
    habilidades: Math.round(data.riasecProfile.A * 100),
    motivacion: Math.round(data.riasecProfile.S * 100),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <Header />

      {/* Content — Chaptr-style centered, light card on dark */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Hero text */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              <span className="gradient-text">Casi listo</span>
            </h1>
            <p className="text-white/50 text-lg">
              Déjanos tus datos para recibir tu resultado personalizado
            </p>
          </div>

          {/* Light form card (Chaptr editorial feel) */}
          <div className="bg-[#fafafa] rounded-3xl p-6 md:p-8 shadow-2xl">
            <LeadForm
              scores={scores}
              arquetipo={data.archetype.id}
              top3={top3ForLead}
              respuestas={data.answers}
            />
          </div>

          {/* Skip link */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/resultados")}
              className="text-sm text-white/30 hover:text-[#0033A5] transition-colors"
            >
              Omitir por ahora →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
