"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTestStore } from "@/stores/test-store";
import { programs } from "@/lib/programs";
import { cosineSimilarity } from "@/lib/scoring/riasec";
import { ARCHETYPES } from "@/lib/scoring/archetypes";
import {
  RIASEC_DIMENSIONS,
  type RIASECDimension,
} from "@/lib/scoring/types";
import Header from "@/components/layout/Header";
import type {
  RIASECProfile,
  ModalityResult,
  Archetype,
  ScoringResult,
} from "@/lib/scoring/types";
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

const DIMENSION_LABELS: Record<RIASECDimension, string> = {
  R: "Realista",
  I: "Investigativo",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

function loadResults(): ResultsData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem("tufuturo-results");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function MissingResults() {
  const router = useRouter();
  const { resetTest } = useTestStore();
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo degradado de marca: rojo → blanco → azul */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Degradado diagonal principal */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D51933]/75 via-white/15 to-[#0033A5]/75" />
        {/* Glows de profundidad */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#D51933]/40 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-[#0033A5]/45 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[440px] h-[440px] rounded-full bg-[#00ff88]/15 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-[#4da6ff]/20 blur-[100px]" />
        {/* Velo oscuro para legibilidad del texto */}
        <div className="absolute inset-0 bg-[#0a0a0a]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]" />
      </div>
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

export default function ResultadosPage() {
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
      return <MissingResults />;
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        {/* Fondo degradado de marca: rojo → blanco → azul */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D51933]/75 via-white/15 to-[#0033A5]/75" />
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#D51933]/40 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-[#0033A5]/45 blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 w-[440px] h-[440px] rounded-full bg-[#00ff88]/15 blur-[110px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-[#4da6ff]/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[#0a0a0a]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]" />
        </div>
        <div className="text-white/40">Cargando resultados...</div>
      </div>
    );
  }

  const recommendation = data.modalityResult.recommendation;
  const confidence = data.modalityResult.confidence;

  const dedupedLowResults = (() => {
    const byBase = new Map<string, ScoringResult>();
    for (const r of data.rankedResults) {
      const baseId = r.programId.replace(/-virtual$/, "");
      const existing = byBase.get(baseId);
      if (!existing || r.overallScore > existing.overallScore) {
        byBase.set(baseId, r);
      }
    }
    return [...byBase.values()];
  })();

  const filteredResults =
    confidence === "low"
      ? dedupedLowResults
      : data.rankedResults.filter((r) => {
          const p = programs.find((x) => x.id === r.programId);
          return p?.modality === recommendation;
        });

  const wasFiltered =
    confidence !== "low" &&
    filteredResults.length < data.rankedResults.length;
  const top3 = filteredResults.slice(0, 3);
  const top3WithProgram = top3.map((r) => ({
    ...r,
    program: programs.find((p) => p.id === r.programId)!,
  }));

  const affinity = Math.round(
    cosineSimilarity(
      Object.values(data.riasecProfile),
      Object.values(data.archetype.riasecProfile)
    ) * 100
  );

  const relatedArchetypes = ARCHETYPES.filter(
    (a) => a.id !== data.archetype.id
  )
    .map((archetype) => ({
      archetype,
      similarity: cosineSimilarity(
        Object.values(data.riasecProfile),
        Object.values(archetype.riasecProfile)
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 2);

  const topDimensions = [...RIASEC_DIMENSIONS]
    .map((dim) => ({
      dim,
      label: DIMENSION_LABELS[dim],
      value: data.riasecProfile[dim],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const modalityLabel =
    recommendation === "presencial" ? "Presencial" : "Virtual";

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Fondo degradado de marca: rojo → blanco → azul */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D51933]/75 via-white/15 to-[#0033A5]/75" />
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#D51933]/40 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-[#0033A5]/45 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[440px] h-[440px] rounded-full bg-[#00ff88]/15 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full bg-[#4da6ff]/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[#0a0a0a]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]" />
      </div>

      <Confetti />

      {/* Header */}
      <Header />

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-12">
        {/* Hero result */}
        <div className="relative text-center space-y-5 animate-fade-in">
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#00ff88]/5 rounded-full blur-3xl" />
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight relative z-10">
            <span className="gradient-text">Tu resultado</span>
          </h1>
          <p className="text-white/60 text-lg relative z-10">
            Descubriste tu arquetipo:{" "}
            <span className="font-bold text-white">
              {data.archetype.name}
            </span>
          </p>
          <p className="text-white/40 relative z-10">
            Modalidad recomendada:{" "}
            <span className="font-semibold text-[#00ff88]">
              {modalityLabel}
            </span>
          </p>
        </div>

        {/* Archetype */}
        <ArchetypeCard
          archetype={data.archetype}
          affinity={affinity}
          relatedArchetypes={relatedArchetypes}
          topDimensions={topDimensions}
        />

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
          <p className="text-sm text-white/40 leading-relaxed">
            Ordenamos los programas por afinidad con tu personalidad, tus
            aptitudes y tu estilo de vida. El primero es tu mejor
            coincidencia.
          </p>
          {wasFiltered && (
            <p className="text-xs text-white/30">
              Mostramos solo programas{" "}
              {recommendation === "presencial" ? "presenciales" : "virtuales"}{" "}
              según tu recomendación.
            </p>
          )}
          {confidence === "low" && (
            <div className="border border-orange-500/25 bg-orange-500/5 rounded-xl px-4 py-3">
              <p className="text-sm text-orange-200/80 leading-relaxed">
                No detectamos una señal clara sobre tu modalidad ideal, por
                eso te mostramos las 7 carreras con sus modalidades.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {top3WithProgram.map((r, index) => (
              <ProgramCard
                key={r.programId}
                program={r.program}
                result={r}
                rank={index + 1}
                isExpanded={true}
                modalityRecommendation={
                  confidence === "low" ? undefined : recommendation
                }
              />
            ))}
          </div>
        </div>

        {/* Gap Analysis */}
        <GapAnalysis
          riasecProfile={data.riasecProfile}
          topProgramIds={filteredResults
            .slice(0, 3)
            .map((r) => r.programId)}
        />

        {/* Full ranking */}
        <RankingFull
          results={filteredResults}
          modalityRecommendation={confidence === "low" ? undefined : recommendation}
        />

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/test"
            onClick={resetTest}
            className="inline-flex items-center gap-3 bg-white text-[#0a0a0a] font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-105"
          >
            Repetir el test
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-3 border border-white/20 text-white/60 font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:border-[#0033A5] hover:text-[#0033A5]"
          >
            Volver al inicio
          </Link>
        </div>

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
