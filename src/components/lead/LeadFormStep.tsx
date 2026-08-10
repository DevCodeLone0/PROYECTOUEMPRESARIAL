"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const { isCompleted, resetTest } = useTestStore();
  const [data] = useState<ResultsData | null>(loadResults);

  useEffect(() => {
    if (!data && !isCompleted) {
      router.push("/test");
    }
  }, [data, isCompleted, router]);

  if (!data) {
    if (isCompleted) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-5xl">🔍</div>
            <h1 className="text-2xl font-bold text-white">
              No encontramos tus resultados
            </h1>
            <p className="text-white/50 leading-relaxed">
              Cerraste la pestaña y perdimos el resultado de tu test.
            </p>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  resetTest();
                  router.push("/test");
                }}
                className="inline-flex items-center gap-3 bg-white text-[#0a0a0a] font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-105"
              >
                Hacer el test de nuevo
              </button>
              <Link
                href="/"
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      );
    }
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

  // Columnas legacy de la hoja (puntaje_intereses/personalidad/habilidades/motivacion), conservadas por compatibilidad con filas existentes.
  const scores = {
    intereses: Math.round(data.riasecProfile.R * 100),
    personalidad: Math.round(data.riasecProfile.I * 100),
    habilidades: Math.round(data.riasecProfile.A * 100),
    motivacion: Math.round(data.riasecProfile.S * 100),
  };

  const riasecProfile = {
    R: Math.round(data.riasecProfile.R * 100),
    I: Math.round(data.riasecProfile.I * 100),
    A: Math.round(data.riasecProfile.A * 100),
    S: Math.round(data.riasecProfile.S * 100),
    E: Math.round(data.riasecProfile.E * 100),
    C: Math.round(data.riasecProfile.C * 100),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      {/* Fondo degradado de marca (sutil — el formulario es una tarjeta clara) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#D51933]/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-[#0033A5]/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[440px] h-[440px] rounded-full bg-[#00ff88]/6 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-[#4da6ff]/8 blur-[100px]" />
      </div>

      {/* Header */}
      <Header />

      {/* Content — Chaptr-style centered, light card on dark */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
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
              riasecProfile={riasecProfile}
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
