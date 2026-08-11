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
import BackgroundCarousel, { type BackgroundSlide } from "@/components/ui/BackgroundCarousel";

// Slides del carousel de fondo del test: video primero, luego fotos originales y del moodboard
const backgroundSlides: BackgroundSlide[] = [
  { type: "video", src: "/videos/IMG_0469.mp4", poster: "/images/moodboard-campus-1.jpeg" },
  { type: "image", src: "/images/DSC_0191.JPG" },
  { type: "image", src: "/images/DSC_0228.JPG" },
  { type: "image", src: "/images/DSC_0294.JPG" },
  { type: "image", src: "/images/DSC_0299.JPG" },
  { type: "image", src: "/images/moodboard-campus-1.jpeg" },
  { type: "image", src: "/images/moodboard-campus-2.jpeg" },
  { type: "image", src: "/images/moodboard-campus-3.jpeg" },
];

/** Layer transition screen displayed between layers */
function LayerTransition({
  layer,
  onContinue,
}: {
  layer: 1 | 2 | 3 | 4;
  onContinue: () => void;
}) {
  const icon = (() => {
    const cls = "w-10 h-10 text-white";
    switch (layer) {
      case 1:
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        );
      case 2:
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
        );
      case 3:
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
            <path d="M2 9h20" />
            <path d="M12 21 8 9l4-6 4 6-4 12" />
          </svg>
        );
      case 4:
        return (
          <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V8l7-5 7 5v13" />
            <path d="M9 21v-6h6v6" />
            <path d="M9 11h.01M15 11h.01M9 14h.01M15 14h.01" />
          </svg>
        );
    }
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="brand-border rounded-3xl p-8 md:p-12 space-y-6 text-center shadow-[0_8px_40px_rgba(0,51,165,0.10)]">
        <div className="w-24 h-24 mx-auto rounded-2xl brand-gradient flex items-center justify-center shadow-[0_0_30px_rgba(213,25,51,0.35)]">
          {icon}
        </div>
        <div>
          <p className="text-[#0033A5]/60 text-sm font-bold uppercase tracking-widest mb-2">
            Capa {layer} de 4
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">
            {LAYER_NAMES[layer]}
          </h2>
        </div>
        <p className="text-slate-600 text-xl md:text-2xl leading-relaxed max-w-lg mx-auto">
          {LAYER_DESCRIPTIONS[layer]}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-white text-[#111] font-bold py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#D51933] hover:to-[#0033A5] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
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
            l <= layer
              ? "bg-gradient-to-r from-[#D51933] to-[#0033A5]"
              : "bg-[#0033A5]/15"
          } ${l === layer ? "w-8" : "w-4"}`}
        />
      ))}
      <span className="text-white/50 text-xs font-medium ml-1">
        {LAYER_NAMES[layer]}
      </span>
    </div>
  );
}

export default function TestWizard({ esPrueba = false }: { esPrueba?: boolean }) {
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

  // Slide direction for question animations
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  // Audio for test (Route 66)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStarted = useRef(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

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

  const startTestAudio = useCallback(() => {
    if (!audioStarted.current && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setAudioPlaying(true);
      audioStarted.current = true;
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setAudioPlaying(!audioPlaying);
    }
  }, [audioPlaying]);

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
    // Preserva el modo prueba (?prueba=1) al pasar al formulario
    router.push(esPrueba ? "/test?step=form&prueba=1" : "/test?step=form");
  }, [
    setRiasecProfile,
    setModalityResult,
    setArchetypeId,
    completeTest,
    router,
    esPrueba,
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
      setAudioPlaying(false);

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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3F0] via-white to-[#E8EEFF] flex flex-col relative overflow-hidden">
      {/* Background carousel — visible through a light veil */}
      <div className="absolute inset-0 z-0">
        <BackgroundCarousel slides={backgroundSlides} intervalMs={8000} />
        {/* Light veil — imagery stays alive, text stays readable */}
        <div className="absolute inset-0 bg-white/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/25 to-white/65" />
      </div>

      {/* Header with progress */}
      <div className="sticky top-0 z-40 glass-light">
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

      {/* Audio toggle */}
      <button
        onClick={toggleAudio}
        className="fixed top-4 right-4 z-50 glass-light rounded-full p-3 hover:bg-white/90 transition-all"
        aria-label={audioPlaying ? "Pausar música" : "Reproducir música"}
      >
        {audioPlaying ? (
          <svg className="w-5 h-5 text-[#D51933]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-[#0033A5]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-4xl">
          {/* Disclaimer */}
          {isDisclaimer && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-3xl p-6 md:p-9 space-y-5 shadow-[0_8px_40px_rgba(0,51,165,0.10)]">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center text-xl shadow-[0_0_16px_rgba(213,25,51,0.3)]">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                      <path d="M7 21h10" />
                      <path d="M12 3v18" />
                      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                    </svg>
                  </span>
                  Descargo de Responsabilidad
                </h2>
                <div className="space-y-3 text-slate-600 text-lg md:text-xl leading-relaxed">
                  <p>
                    El test vocacional es una herramienta de orientación{" "}
                    <strong className="text-slate-900">
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
                className="w-full bg-white text-[#111] font-bold py-4 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#D51933] hover:to-[#0033A5] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
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
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/70 bg-white/60 text-slate-600 hover:border-[#0033A5]/50 hover:text-[#0033A5] hover:bg-white/90 transition-all duration-300"
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
                      ? "bg-white text-[#111] hover:bg-gradient-to-r hover:from-[#D51933] hover:to-[#0033A5] hover:text-white hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/50 text-slate-400 cursor-not-allowed"
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
