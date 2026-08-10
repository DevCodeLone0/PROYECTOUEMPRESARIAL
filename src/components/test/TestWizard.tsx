"use client";

import {
  useTestStore,
  TOTAL_STEPS,
  LAYER_NAMES,
  LAYER_DESCRIPTIONS,
  getLayerForPosition,
} from "@/stores/test-store";
import { QUESTION_BANK } from "@/lib/questions/question-bank";
import { runScoringPipeline } from "@/lib/scoring/pipeline";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import { useRouter } from "next/navigation";
import { useRef, useCallback, useEffect, useState } from "react";

const photos = [
  "/images/DSC_0191.JPG",
  "/images/DSC_0294.JPG",
  "/images/DSC_0228.JPG",
  "/images/DSC_0299.JPG",
];

/** Layer transition screen displayed between layers */
function LayerTransition({
  layer,
  onContinue,
}: {
  layer: 1 | 2 | 3 | 4;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
          {layer === 1 && "🎯"}
          {layer === 2 && "🧠"}
          {layer === 3 && "💎"}
          {layer === 4 && "🏫"}
        </div>
        <div>
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-2">
            Capa {layer} de 4
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {LAYER_NAMES[layer]}
          </h2>
        </div>
        <p className="text-white/70 text-lg leading-relaxed max-w-md mx-auto">
          {LAYER_DESCRIPTIONS[layer]}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-white text-[#111] font-bold py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
      >
        Continuar
      </button>
    </div>
  );
}

/** Layer indicator badge shown in the header */
function LayerIndicator({ layer }: { layer: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((l) => (
        <div
          key={l}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            l <= layer ? "bg-white/80" : "bg-white/15"
          } ${l === layer ? "w-8" : "w-4"}`}
        />
      ))}
      <span className="text-white/50 text-xs font-medium ml-1">
        {LAYER_NAMES[layer]}
      </span>
    </div>
  );
}

export default function TestWizard() {
  const router = useRouter();
  const {
    step,
    answers,
    disclaimerAccepted,
    currentLayer,
    setStep,
    nextStep,
    prevStep,
    setAnswer,
    setRiasecProfile,
    setModalityResult,
    setArchetypeId,
    completeTest,
    acceptDisclaimer,
  } = useTestStore();

  // Track which layer transitions have been dismissed so we don't re-show them
  // when the user navigates back and forth.
  const [dismissedTransitions, setDismissedTransitions] = useState<Set<number>>(new Set());

  const currentQuestion = step >= 1 && step <= TOTAL_STEPS
    ? QUESTION_BANK[step - 1]
    : undefined;

  const isDisclaimer = !disclaimerAccepted && step === 1 && Object.keys(answers).length === 0;

  // ── Layer transitions ──
  // After completing the last question of a layer (Q12, Q17, Q22), show a
  // transition screen before the first question of the next layer (Q13, Q18, Q23).
  // We use a local "pending transition" state that is set when we land on the
  // first step of a new layer WITHOUT having answered that step yet, and cleared
  // when the user clicks "Continuar".
  // The first step of layers 2/3/4 is 13/18/23. We show the transition only if
  // the user has answered the previous boundary question (Q12/Q17/Q22) but has
  // NOT yet answered the current question (Q13/Q18/Q23).
  const isFirstStepOfLayer = step === 13 || step === 18 || step === 23;
  const boundaryQuestionId =
    step === 13 ? "Q12" :
    step === 18 ? "Q17" :
    step === 23 ? "Q22" :
    null;
  const boundaryAnswered = boundaryQuestionId
    ? answers[boundaryQuestionId] !== undefined
    : false;
  const currentAnswered = currentQuestion
    ? answers[currentQuestion.id] !== undefined
    : false;

  // Show transition only on first step of a layer, when boundary is answered,
  // current question is not yet answered, AND the user hasn't already dismissed
  // this transition (so navigating back doesn't re-show it).
  const transitionLayer =
    isFirstStepOfLayer && boundaryAnswered && !currentAnswered && !dismissedTransitions.has(step)
      ? (step === 13 ? (2 as const) : step === 18 ? (3 as const) : (4 as const))
      : null;

  const showTransition = transitionLayer !== null && !isDisclaimer;

  // Carousel state
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  // Audio for test (Route 66)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStarted = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio("/audio/Route 66.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.15;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Carousel auto-slide (every 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const startTestAudio = useCallback(() => {
    if (!audioStarted.current && audioRef.current) {
      audioRef.current.play().catch(() => {});
      audioStarted.current = true;
    }
  }, []);

  /** Run all scoring engines and store results */
  const runScoring = useCallback(() => {
    const state = useTestStore.getState();
    const { answers } = state;

    // Run the pure scoring pipeline
    const result = runScoringPipeline(answers);

    // Persist to Zustand store for cross-component access
    setRiasecProfile(result.riasecProfile);
    setModalityResult(result.modalityResult);
    setArchetypeId(result.archetype.id);

    // Store results in sessionStorage for results page
    sessionStorage.setItem(
      "tufuturo-results",
      JSON.stringify({
        riasecProfile: result.riasecProfile,
        modalityResult: result.modalityResult,
        archetype: result.archetype,
        aptitudeVec: result.aptitudeVec,
        valuesVec: result.valuesVec,
        rankedResults: result.rankedResults,
        answers,
      })
    );

    completeTest();
    router.push("/test?step=form");
  }, [
    setRiasecProfile,
    setModalityResult,
    setArchetypeId,
    completeTest,
    router,
  ]);

  const handleNext = () => {
    if (isDisclaimer) {
      acceptDisclaimer();
      setStep(1);
      startTestAudio();
      return;
    }

    // If on a layer transition screen, dismiss it and stay on the same step
    // so the user can answer the first question of the new layer.
    if (showTransition && transitionLayer !== null) {
      setDismissedTransitions((prev) => new Set(prev).add(step));
      return;
    }

    // Validate current question is answered
    if (currentQuestion) {
      const answer = answers[currentQuestion.id];
      if (answer === undefined) {
        return; // Don't advance if unanswered
      }
    }

    if (step < TOTAL_STEPS) {
      setSlideDirection("next");
      nextStep();
    } else {
      // Test complete — stop audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Validate minimum answers (allow up to 2 unanswered)
      const answered = Object.keys(answers).length;
      const missing = TOTAL_STEPS - answered;
      if (missing >= 3) {
        alert(
          `Faltan ${missing} preguntas por responder. Por favor completa al menos todas menos 2.`
        );
        return;
      }

      // Layer 4 (Q23-Q25) is critical for modality recommendation.
      // If any of these is missing, warn the user before continuing.
      const layer4Missing = ["Q23", "Q24", "Q25"].filter(
        (id) => answers[id] === undefined
      );
      if (layer4Missing.length > 0) {
        const msg =
          layer4Missing.length === 1
            ? "Te falta responder 1 pregunta de modalidad (Q23-Q25). Estas preguntas son clave para recomendar presencial o virtual. ¿Querés completarla antes de finalizar?"
            : `Te faltan responder ${layer4Missing.length} preguntas de modalidad (Q23-Q25). Estas preguntas son clave para recomendar presencial o virtual. ¿Querés completarlas antes de finalizar?`;
        // confirm() returns true if user clicks "OK" (wants to go back and complete),
        // false if user clicks "Cancel" (wants to proceed anyway).
        if (confirm(msg)) {
          // User wants to go back and complete — don't run scoring, stay on test
          return;
        }
        // User chose to proceed anyway — fall through to runScoring
      }

      // Run scoring
      runScoring();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setSlideDirection("prev");
      prevStep();
    }
  };

  const canGoBack = step > 1 && !isDisclaimer;
  const canGoNext =
    isDisclaimer ||
    showTransition ||
    (currentQuestion && answers[currentQuestion.id] !== undefined);

  // Determine display step for progress bar
  const displayStep = isDisclaimer ? 0 : step;

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col relative overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0 z-0">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: currentPhoto === i ? 1 : 0 }}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${photo})`,
                filter: "brightness(0.85) saturate(1.15)",
                transform: currentPhoto === i ? "scale(1)" : "scale(1.05)",
                transition: "transform 4s ease-out",
              }}
            />
          </div>
        ))}
        {/* Darker overlays — text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/85 via-[#111111]/75 to-[#111111]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/60 via-transparent to-[#111111]/60" />
      </div>

      {/* Header with progress */}
      <div className="sticky top-0 z-40 glass">
        <div className="w-full px-6 py-4 space-y-2">
          <ProgressBar
            currentStep={displayStep}
            totalSteps={TOTAL_STEPS}
            dimension={currentQuestion?.dimension}
          />
          {!isDisclaimer && (
            <LayerIndicator layer={currentLayer} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-4xl">
          {/* Disclaimer */}
          {isDisclaimer && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                    ⚖️
                  </span>
                  Descargo de Responsabilidad
                </h2>
                <div className="space-y-3 text-white/80 text-sm leading-relaxed">
                  <p>
                    El test vocacional es una herramienta de orientación{" "}
                    <strong className="text-white">
                      informativa y complementaria
                    </strong>
                    . Los resultados NO constituyen:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 ml-2">
                    <li>Diagnóstico psicológico o psicométrico certificado</li>
                    <li>Garantía de admisión a Uniempresarial</li>
                    <li>Promesa de empleabilidad o resultado profesional</li>
                    <li>Sustitución de orientación vocacional profesional</li>
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
                className="w-full bg-white text-[#111] font-bold py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
              >
                Entendido, empezar
              </button>
            </div>
          )}

          {/* Layer Transition Screen */}
          {!isDisclaimer && showTransition && transitionLayer && (
            <LayerTransition
              layer={transitionLayer}
              onContinue={handleNext}
            />
          )}

          {/* Questions */}
          {!isDisclaimer && !showTransition && currentQuestion && (
            <div className="space-y-8">
              <div
                key={currentQuestion.id}
                className={
                  slideDirection === "next"
                    ? "animate-slide-in-right"
                    : "animate-slide-in-left"
                }
              >
                <QuestionCard
                  question={currentQuestion as any}
                  value={answers[currentQuestion.id]}
                  onChange={(value) => setAnswer(currentQuestion.id, value as number)}
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                {canGoBack && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/15 text-white/70 hover:border-[#0033A5] hover:text-[#0033A5] transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Anterior
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                    canGoNext
                      ? "bg-white text-[#111] hover:bg-[#0033A5] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {step === TOTAL_STEPS ? "Finalizar" : "Siguiente"}
                  {step < TOTAL_STEPS && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
