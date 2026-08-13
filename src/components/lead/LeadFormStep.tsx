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

export default function LeadFormStep({ esPrueba = false }: { esPrueba?: boolean }) {
  const router = useRouter();
  const { isCompleted, resetTest } = useTestStore();
  const [data, setData] = useState<ResultsData | null>(null);

  // Lee sessionStorage tras la hidratación, no en el initializer del estado:
  // leerlo durante el primer render del cliente genera hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura post-hidratación para evitar hydration mismatch
    setData(loadResults());
  }, []);

  useEffect(() => {
    if (!data && !isCompleted) {
      router.push("/test");
    }
  }, [data, isCompleted, router]);

  if (!data) {
    if (isCompleted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF3F0] via-white to-[#E8EEFF] flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-2xl brand-gradient flex items-center justify-center shadow-[0_0_30px_rgba(213,25,51,0.3)]">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v4" />
                <path d="M11 15.5h.01" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              No encontramos tus resultados
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Cerraste la pestaña y perdimos el resultado de tu test.
            </p>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  resetTest();
                  router.push("/test");
                }}
                className="inline-flex items-center gap-3 bg-white text-[#0a0a0a] font-bold text-lg px-8 py-4 rounded-2xl border border-slate-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-[#D51933] hover:to-[#0033A5] hover:text-white hover:scale-105 hover:border-transparent"
              >
                Hacer el test de nuevo
              </button>
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-[#0033A5] transition-colors font-medium"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF3F0] via-white to-[#E8EEFF] flex items-center justify-center">
        <div className="text-slate-400 font-medium">Cargando...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3F0] via-white to-[#E8EEFF] flex flex-col relative overflow-hidden">
      {/* Fondo degradado de marca (sutil — el formulario es una tarjeta clara) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#D51933]/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-[#0033A5]/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[440px] h-[440px] rounded-full bg-[#D51933]/6 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-[#0033A5]/8 blur-[100px]" />
      </div>

      {/* Header */}
      <Header />

      {/* Content — centered, glass card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pt-44 pb-16">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Hero text */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              <span className="gradient-text">Casi listo</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium">
              Déjanos tus datos para recibir tu resultado personalizado
            </p>
          </div>

          {/* Glass form card */}
          <div className="glass-light rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgba(0,51,165,0.10)]">
            <LeadForm
              scores={scores}
              riasecProfile={riasecProfile}
              arquetipo={data.archetype.id}
              top3={top3ForLead}
              respuestas={data.answers}
              esPrueba={esPrueba}
              modality={data.modalityResult.recommendation}
              confidence={data.modalityResult.confidence}
              aptitudeVec={data.aptitudeVec}
              valuesVec={data.valuesVec}
              ranking={(data.rankedResults ?? []).map((r) => ({
                programId: r.programId,
                compatibility: Math.round(r.overallScore),
              }))}
            />
          </div>

          {/* Skip link */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/resultados")}
              className="text-sm text-slate-500 hover:text-[#0033A5] transition-colors font-medium"
            >
              Omitir por ahora →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
