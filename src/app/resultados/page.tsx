"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTestStore } from "@/stores/test-store";
import { programs } from "@/lib/programs";
import type { Archetype } from "@/lib/archetypes";
import type { ScoringResult } from "@/lib/scoring";
import Confetti from "@/components/ui/Confetti";
import ArchetypeCard from "@/components/results/ArchetypeCard";
import ProgramCard from "@/components/results/ProgramCard";
import RankingFull from "@/components/results/RankingFull";
import LeadForm from "@/components/lead/LeadForm";

interface ResultsData {
  results: ScoringResult[];
  archetype: Archetype;
  scores: {
    intereses: number;
    personalidad: number;
    habilidades: number;
    motivacion: number;
  };
  answers: Record<string, string | number>;
}

export default function ResultadosPage() {
  const router = useRouter();
  const { isCompleted } = useTestStore();
  const [data, setData] = useState<ResultsData | null>(null);

  useEffect(() => {
    // Try to load results from sessionStorage
    const stored = sessionStorage.getItem("tufuturo-results");
    if (stored) {
      setData(JSON.parse(stored));
    } else if (!isCompleted) {
      // No results and test not completed — redirect to test
      router.push("/test");
    }
  }, [isCompleted, router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40">Cargando resultados...</div>
      </div>
    );
  }

  const top3 = data.results.slice(0, 3);
  const top3WithProgram = top3.map((r) => ({
    ...r,
    program: programs.find((p) => p.id === r.programId)!,
  }));

  const top3ForLead = top3.map((r) => {
    const prog = programs.find((p) => p.id === r.programId);
    return {
      carrera: prog?.name || "",
      compatibilidad: r.compatibility,
    };
  });

  return (
    <div className="min-h-screen bg-black">
      <Confetti />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold text-lg">
              UF
            </div>
            <span className="text-lg font-bold tracking-tight">
              Tu Futuro Dual
            </span>
          </Link>
          <Link
            href="/test"
            onClick={() => useTestStore.getState().resetTest()}
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Repetir test
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Archetype */}
        <ArchetypeCard archetype={data.archetype} />

        {/* Top 3 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Tus 3 carreras ideales
          </h3>
          <div className="space-y-3">
            {top3WithProgram.map((r, index) => (
              <ProgramCard
                key={r.programId}
                program={r.program}
                compatibility={r.compatibility}
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Full ranking */}
        <RankingFull results={data.results} />

        {/* CTA to lead form */}
        <div className="bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-2xl p-6 md:p-8">
          <LeadForm
            scores={data.scores}
            arquetipo={data.archetype.id}
            top3={top3ForLead}
            respuestas={data.answers}
          />
        </div>

        {/* Disclaimer reminder */}
        <div className="text-center text-xs text-white/30 pb-8">
          <p>
            Los resultados son una guía basada en auto-percepción y no
            constituyen un diagnóstico psicológico certificado.
          </p>
        </div>
      </main>
    </div>
  );
}
