"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TestScores } from "@/lib/scoring";

export interface Question {
  id: string;
  dimension: "intereses" | "personalidad" | "habilidades" | "motivacion" | "cierre";
  type: "single-choice" | "likert-5" | "likert-4" | "binary" | "free-text";
  text: string;
  options?: string[];
  points?: number;
}

export const questions: Question[] = [
  // Intereses (Q1-Q3): Multiple choice
  {
    id: "Q1",
    dimension: "intereses",
    type: "single-choice",
    text: "¿Qué actividad te gustaría hacer en tu trabajo ideal?",
    options: [
      "Crear y desarrollar soluciones tecnológicas",
      "Liderar equipos y tomar decisiones estratégicas",
      "Conectar con personas de diferentes culturas",
      "Diseñar experiencias visuales que impacten",
      "Analizar datos para encontrar oportunidades",
    ],
  },
  {
    id: "Q2",
    dimension: "intereses",
    type: "single-choice",
    text: "Si pudieras elegir un lugar para trabajar, ¿cuál sería?",
    options: [
      "Una empresa de tecnología o startup",
      "Un hotel o resort de lujo",
      "Una multinacional con oficinas en varios países",
      "Un banco o empresa financiera",
      "Una agencia de marketing o publicidad",
    ],
  },
  {
    id: "Q3",
    dimension: "intereses",
    type: "single-choice",
    text: "¿Qué te motiva más a la hora de estudiar?",
    options: [
      "Resolver problemas complejos con lógica",
      "Generar ideas creativas y nuevas",
      "Trabajar en equipo y alcanzar metas juntos",
      "Aprender sobre cómo funcionan los negocios",
      "Impactar positivamente a las personas",
    ],
  },

  // Personalidad (Q4-Q8): Likert 5 points
  {
    id: "Q4",
    dimension: "personalidad",
    type: "likert-5",
    text: "¿Qué tan organizado/a eres en tus tareas diarias?",
    options: [
      "Nada en absoluto",
      "Poco",
      "Moderadamente",
      "Bastante",
      "Totalmente",
    ],
  },
  {
    id: "Q5",
    dimension: "personalidad",
    type: "likert-5",
    text: "¿Qué tan cómodo/a te sientes liderando un grupo?",
    options: [
      "Nada en absoluto",
      "Poco",
      "Moderadamente",
      "Bastante",
      "Totalmente",
    ],
  },
  {
    id: "Q6",
    dimension: "personalidad",
    type: "likert-5",
    text: "¿Qué tan creativo/a te consideras para resolver problemas?",
    options: [
      "Nada en absoluto",
      "Poco",
      "Moderadamente",
      "Bastante",
      "Totalmente",
    ],
  },
  {
    id: "Q7",
    dimension: "personalidad",
    type: "likert-5",
    text: "¿Qué tan paciente eres cuando algo no sale como esperabas?",
    options: [
      "Nada en absoluto",
      "Poco",
      "Moderadamente",
      "Bastante",
      "Totalmente",
    ],
  },
  {
    id: "Q8",
    dimension: "personalidad",
    type: "likert-5",
    text: "¿Qué tan disperso/a te sientes cuando hay muchas opciones?",
    options: [
      "Nada en absoluto",
      "Poco",
      "Moderadamente",
      "Bastante",
      "Totalmente",
    ],
  },

  // Habilidades (Q9-Q12): 4 levels
  {
    id: "Q9",
    dimension: "habilidades",
    type: "likert-4",
    text: "¿Cómo calificarías tu nivel de manejo de computador?",
    options: ["Nivel 1 — Básico", "Nivel 2 — Intermedio", "Nivel 3 — Avanzado", "Nivel 4 — Experto"],
  },
  {
    id: "Q10",
    dimension: "habilidades",
    type: "likert-4",
    text: "¿Qué tan bien te comunicas al escribir (ensayos, correos, informes)?",
    options: ["Nivel 1 — Básico", "Nivel 2 — Intermedio", "Nivel 3 — Avanzado", "Nivel 4 — Experto"],
  },
  {
    id: "Q11",
    dimension: "habilidades",
    type: "likert-4",
    text: "¿Qué tan bien manejas números y cálculos matemáticos?",
    options: ["Nivel 1 — Básico", "Nivel 2 — Intermedio", "Nivel 3 — Avanzado", "Nivel 4 — Experto"],
  },
  {
    id: "Q12",
    dimension: "habilidades",
    type: "likert-4",
    text: "¿Qué tan bien organizas tu tiempo y priorizas tareas?",
    options: ["Nivel 1 — Básico", "Nivel 2 — Intermedio", "Nivel 3 — Avanzado", "Nivel 4 — Experto"],
  },

  // Motivación (Q13-Q15): Binary
  {
    id: "Q13",
    dimension: "motivacion",
    type: "binary",
    text: "¿Prefieres trabajar con cosas (máquinas, código, datos) o con personas?",
    options: ["Cosas y tecnologías", "Personas y equipos"],
  },
  {
    id: "Q14",
    dimension: "motivacion",
    type: "binary",
    text: "¿Te gustaría trabajar en una empresa grande y establecida o en una startup en crecimiento?",
    options: ["Empresa grande y establecida", "Startup en crecimiento"],
  },
  {
    id: "Q15",
    dimension: "motivacion",
    type: "binary",
    text: "¿Preferirías un trabajo con rutina predecible o uno con retos diferentes cada día?",
    options: ["Rutina predecible", "Retos diferentes cada día"],
  },

  // Cierre (Q16): Free text, optional
  {
    id: "Q16",
    dimension: "cierre",
    type: "free-text",
    text: "¿Hay algo más que quieras contarnos sobre tus intereses o tu futuro profesional?",
  },
];

interface TestState {
  // Current step (0-indexed, 0 = disclaimer)
  step: number;
  // Answers keyed by question ID
  answers: Record<string, string | number>;
  // Computed scores after test completion
  scores: TestScores | null;
  // Archetype ID after test completion
  archetypeId: string | null;
  // Whether test is completed
  isCompleted: boolean;
  // Disclaimer accepted
  disclaimerAccepted: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnswer: (questionId: string, value: string | number) => void;
  setScores: (scores: TestScores) => void;
  setArchetypeId: (id: string) => void;
  completeTest: () => void;
  acceptDisclaimer: () => void;
  resetTest: () => void;
}

const TOTAL_STEPS = questions.length; // 16 questions
const DISCLAIMER_STEP = 0;

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      step: DISCLAIMER_STEP,
      answers: {},
      scores: null,
      archetypeId: null,
      isCompleted: false,
      disclaimerAccepted: false,

      setStep: (step) => set({ step }),
      nextStep: () => {
        const { step } = get();
        if (step < TOTAL_STEPS) {
          set({ step: step + 1 });
        }
      },
      prevStep: () => {
        const { step } = get();
        if (step > DISCLAIMER_STEP) {
          set({ step: step - 1 });
        }
      },
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      setScores: (scores) => set({ scores }),
      setArchetypeId: (id) => set({ archetypeId: id }),
      completeTest: () => set({ isCompleted: true }),
      acceptDisclaimer: () => set({ disclaimerAccepted: true }),
      resetTest: () =>
        set({
          step: DISCLAIMER_STEP,
          answers: {},
          scores: null,
          archetypeId: null,
          isCompleted: false,
          disclaimerAccepted: false,
        }),
    }),
    {
      name: "tu-futuro-dual-test",
      partialize: (state) => ({
        step: state.step,
        answers: state.answers,
        disclaimerAccepted: state.disclaimerAccepted,
        scores: state.scores,
        archetypeId: state.archetypeId,
        isCompleted: state.isCompleted,
      }),
    }
  )
);
