"use client";

import { useTestStore, questions } from "@/stores/test-store";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import {
  calculateCompatibility,
  determineArchetype,
  countMissingAnswers,
} from "@/lib/scoring";
import { useRouter } from "next/navigation";

export default function TestWizard() {
  const router = useRouter();
  const {
    step,
    answers,
    disclaimerAccepted,
    setStep,
    nextStep,
    prevStep,
    setAnswer,
    setScores,
    setArchetypeId,
    completeTest,
    acceptDisclaimer,
  } = useTestStore();

  const currentQuestion = questions[step - 1]; // step 0 = disclaimer, step 1+ = questions
  const totalQuestions = questions.length;
  const isDisclaimer = step === 0;

  const handleNext = () => {
    if (isDisclaimer) {
      acceptDisclaimer();
      setStep(1);
      return;
    }

    // Validate current question is answered (except Q16 which is optional)
    if (currentQuestion && currentQuestion.id !== "Q16") {
      const answer = answers[currentQuestion.id];
      if (answer === undefined || answer === "") {
        return; // Don't advance if unanswered
      }
    }

    if (step < totalQuestions) {
      nextStep();
    } else {
      // Test complete — run scoring
      const missing = countMissingAnswers(answers);
      if (missing >= 3) {
        alert(
          `Faltan ${missing} preguntas por responder. Por favor completa al menos todas menos 2.`
        );
        return;
      }

      const results = calculateCompatibility(answers);
      const archetype = determineArchetype(answers);

      // Extract scores from results
      const scores = {
        intereses: results[0]?.dimensionScores.intereses || 0,
        personalidad: results[0]?.dimensionScores.personalidad || 0,
        habilidades: results[0]?.dimensionScores.habilidades || 0,
        motivacion: results[0]?.dimensionScores.motivacion || 0,
      };

      setScores(scores);
      setArchetypeId(archetype.id);
      completeTest();

      // Store results in sessionStorage for results page
      sessionStorage.setItem(
        "tufuturo-results",
        JSON.stringify({
          results,
          archetype,
          scores,
          answers,
        })
      );

      router.push("/resultados");
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      prevStep();
    }
  };

  const canGoBack = step > 0;
  const canGoNext =
    isDisclaimer ||
    (currentQuestion &&
      (currentQuestion.id === "Q16" || answers[currentQuestion.id] !== undefined));

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header with progress */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <ProgressBar
            currentStep={isDisclaimer ? 0 : step}
            totalSteps={totalQuestions}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Disclaimer */}
          {isDisclaimer && !disclaimerAccepted && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">⚖️</span>
                  Descargo de Responsabilidad
                </h2>
                <div className="space-y-3 text-white/70 text-sm leading-relaxed">
                  <p>
                    El test vocacional es una herramienta de orientación{" "}
                    <strong className="text-white/90">
                      informativa y complementaria
                    </strong>
                    . Los resultados NO constituyen:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Diagnóstico psicológico o psicométrico certificado</li>
                    <li>Garantía de admisión a Uniempresarial</li>
                    <li>Promesa de empleabilidad o resultado profesional</li>
                    <li>
                      Sustitución de orientación vocacional profesional
                    </li>
                  </ul>
                  <p>
                    Los resultados son una guía basada en auto-percepción. La
                    decisión de carrera es responsabilidad del estudiante y su
                    familia.
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Entendido, empezar
              </button>
            </div>
          )}

          {/* Questions */}
          {!isDisclaimer && currentQuestion && (
            <div className="space-y-8">
              <QuestionCard
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(value) => setAnswer(currentQuestion.id, value)}
              />

              {/* Navigation */}
              <div className="flex items-center gap-4">
                {canGoBack && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/10 text-white/70 hover:border-white/20 hover:text-white transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                      />
                    </svg>
                    Anterior
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 ${
                    canGoNext
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {step === totalQuestions ? "Finalizar" : "Siguiente"}
                  {step < totalQuestions && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
