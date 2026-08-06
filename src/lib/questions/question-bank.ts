/**
 * Question Bank — 25 questions across 4 layers.
 *
 * Layer 1 (Q1-Q12): RIASEC Interests — 12 questions, 2 per dimension,
 *   single-choice with 5 options. Each option has per-dimension RIASEC weights.
 *
 * Layer 2 (Q13-Q17): Aptitudes — 5 behavioral scenario questions,
 *   single-choice with 4 options.
 *
 * Layer 3 (Q18-Q22): Values & Lifestyle — mix of single-choice, likert-5,
 *   and binary questions.
 *
 * Layer 4 (Q23-Q25): Modality — presencial vs. virtual preference signal.
 *
 * All text is in Colombian Spanish.
 */

import type { Question } from "../scoring/types";

// ── Layer 1: RIASEC Interests (Q1-Q12) ──
//
// Each option's riasecWeights array maps to the 5 options (index 0-4).
// For each option, the object maps each RIASEC dimension to a weight.
// Weights for a given dimension across all 5 options sum to 1.0.

const layer1Questions: Question[] = [
  // ── Q1: Realistic (Doers) ──
  {
    id: "Q1",
    layer: 1,
    dimension: "R",
    type: "single-choice",
    text: "¿Qué actividad te gustaría hacer en tu trabajo ideal?",
    options: [
      "Crear soluciones tecnológicas",
      "Liderar equipos y tomar decisiones",
      "Conectar con personas de diferentes culturas",
      "Diseñar experiencias visuales",
      "Analizar datos para encontrar oportunidades",
    ],
    riasecWeights: [
      { R: 0.5, I: 0.2, A: 0.0, S: 0.0, E: 0.2, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.0, E: 0.7, C: 0.2 },
      { R: 0.0, I: 0.1, A: 0.2, S: 0.6, E: 0.1, C: 0.0 },
      { R: 0.1, I: 0.0, A: 0.7, S: 0.1, E: 0.1, C: 0.0 },
      { R: 0.1, I: 0.5, A: 0.0, S: 0.0, E: 0.0, C: 0.4 },
    ],
  },

  // ── Q2: Realistic (Doers) ──
  {
    id: "Q2",
    layer: 1,
    dimension: "R",
    type: "single-choice",
    text: "¿Qué tipo de empresa te gustaría liderar?",
    options: [
      "Empresa de tecnología o startup",
      "Hotel o resort de lujo",
      "Multinacional con oficinas en varios países",
      "Agencia de marketing o publicidad",
      "Banco o empresa financiera",
    ],
    riasecWeights: [
      { R: 0.4, I: 0.3, A: 0.0, S: 0.0, E: 0.2, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.4, E: 0.4, C: 0.1 },
      { R: 0.0, I: 0.1, A: 0.0, S: 0.2, E: 0.5, C: 0.2 },
      { R: 0.1, I: 0.0, A: 0.5, S: 0.1, E: 0.2, C: 0.1 },
      { R: 0.1, I: 0.2, A: 0.0, S: 0.0, E: 0.1, C: 0.6 },
    ],
  },

  // ── Q3: Investigative (Thinkers) ──
  {
    id: "Q3",
    layer: 1,
    dimension: "I",
    type: "single-choice",
    text: "¿Qué te motiva más a la hora de estudiar?",
    options: [
      "Resolver problemas complejos con lógica",
      "Generar ideas creativas y nuevas",
      "Trabajar en equipo y alcanzar metas juntos",
      "Aprender sobre cómo funcionan los negocios",
      "Impactar positivamente a las personas",
    ],
    riasecWeights: [
      { R: 0.2, I: 0.6, A: 0.0, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.1, A: 0.7, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.7, E: 0.2, C: 0.1 },
      { R: 0.0, I: 0.2, A: 0.0, S: 0.0, E: 0.6, C: 0.2 },
      { R: 0.0, I: 0.1, A: 0.1, S: 0.7, E: 0.0, C: 0.1 },
    ],
  },

  // ── Q4: Investigative (Thinkers) ──
  {
    id: "Q4",
    layer: 1,
    dimension: "I",
    type: "single-choice",
    text: "¿En qué tipo de proyecto te gustaría trabajar?",
    options: [
      "Construir algo tangible (máquinas, productos)",
      "Investigar y descubrir cosas nuevas",
      "Crear arte, diseño o contenido visual",
      "Ayudar a personas directamente",
      "Liderar un equipo hacia una meta",
    ],
    riasecWeights: [
      { R: 0.7, I: 0.1, A: 0.0, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.8, S: 0.1, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.8, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.1, E: 0.8, C: 0.1 },
    ],
  },

  // ── Q5: Artistic (Creators) ──
  {
    id: "Q5",
    layer: 1,
    dimension: "A",
    type: "single-choice",
    text: "¿Qué entorno de trabajo prefieres?",
    options: [
      "Taller, laboratorio o campo",
      "Oficina con libertad creativa",
      "Estudio de diseño o espacio flexible",
      "Hospital, escuela o centro comunitario",
      "Sala de juntas o oficina ejecutiva",
    ],
    riasecWeights: [
      { R: 0.7, I: 0.1, A: 0.0, S: 0.1, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.1, A: 0.5, S: 0.0, E: 0.3, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.8, S: 0.1, E: 0.1, C: 0.0 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.7, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.0, E: 0.6, C: 0.4 },
    ],
  },

  // ── Q6: Artistic (Creators) ──
  {
    id: "Q6",
    layer: 1,
    dimension: "A",
    type: "single-choice",
    text: "¿Qué habilidad quieres desarrollar más?",
    options: [
      "Manejar herramientas y tecnología",
      "Pensamiento crítico y análisis",
      "Expresión artística y creativa",
      "Comunicación y empatía",
      "Negociación y persuasión",
    ],
    riasecWeights: [
      { R: 0.6, I: 0.1, A: 0.1, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.8, S: 0.1, E: 0.1, C: 0.0 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.7, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.1, E: 0.7, C: 0.2 },
    ],
  },

  // ── Q7: Social (Helpers) ──
  {
    id: "Q7",
    layer: 1,
    dimension: "S",
    type: "single-choice",
    text: "¿Cómo te describes en un equipo?",
    options: [
      "El que construye y arregla cosas",
      "El que investiga y propone soluciones",
      "El que aporta ideas originales",
      "El que apoya y motiva a otros",
      "El que organiza y lidera",
    ],
    riasecWeights: [
      { R: 0.7, I: 0.1, A: 0.0, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.7, S: 0.1, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.7, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.1, E: 0.6, C: 0.3 },
    ],
  },

  // ── Q8: Social (Helpers) ──
  {
    id: "Q8",
    layer: 1,
    dimension: "S",
    type: "single-choice",
    text: "¿Qué te da más satisfacción?",
    options: [
      "Ver un resultado tangible de tu trabajo",
      "Descubrir algo que nadie sabía",
      "Crear algo que emocione a otros",
      'Que alguien diga "gracias a ti"',
      "Lograr un objetivo ambicioso",
    ],
    riasecWeights: [
      { R: 0.6, I: 0.1, A: 0.1, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.7, S: 0.2, E: 0.1, C: 0.0 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.8, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.0, E: 0.8, C: 0.2 },
    ],
  },

  // ── Q9: Enterprising (Persuaders) ──
  {
    id: "Q9",
    layer: 1,
    dimension: "E",
    type: "single-choice",
    text: "¿Qué tipo de problema te atrae más?",
    options: [
      "Un defecto técnico que hay que arreglar",
      "Un misterio sin resolver",
      "Un diseño que necesita mejorar",
      "Un conflicto interpersonal",
      "Una meta que requiere estrategia",
    ],
    riasecWeights: [
      { R: 0.6, I: 0.1, A: 0.1, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.7, S: 0.1, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.7, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.1, A: 0.0, S: 0.0, E: 0.7, C: 0.2 },
    ],
  },

  // ── Q10: Enterprising (Persuaders) ──
  {
    id: "Q10",
    layer: 1,
    dimension: "E",
    type: "single-choice",
    text: "¿Cuál es tu idea de éxito profesional?",
    options: [
      "Construir productos que la gente use",
      "Hacer un descubrimiento importante",
      "Que mi trabajo sea reconocido por su arte",
      "Que mi trabajo mejore la vida de otros",
      "Liderar una empresa exitosa",
    ],
    riasecWeights: [
      { R: 0.5, I: 0.1, A: 0.1, S: 0.0, E: 0.2, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.8, S: 0.1, E: 0.1, C: 0.0 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.8, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.0, E: 0.8, C: 0.2 },
    ],
  },

  // ── Q11: Conventional (Organizers) ──
  {
    id: "Q11",
    layer: 1,
    dimension: "C",
    type: "single-choice",
    text: "¿Qué materia elegirías si solo pudieras tomar una?",
    options: [
      "Física o ingeniería",
      "Biología o química",
      "Arte o diseño",
      "Psicología o trabajo social",
      "Economía o mercadeo",
    ],
    riasecWeights: [
      { R: 0.5, I: 0.3, A: 0.0, S: 0.0, E: 0.1, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.1, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.8, S: 0.1, E: 0.1, C: 0.0 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.7, E: 0.1, C: 0.1 },
      { R: 0.0, I: 0.1, A: 0.0, S: 0.0, E: 0.3, C: 0.6 },
    ],
  },

  // ── Q12: Conventional (Organizers) ──
  {
    id: "Q12",
    layer: 1,
    dimension: "C",
    type: "single-choice",
    text: "¿Qué superpoder profesional elegirías?",
    options: [
      "Construir cualquier cosa con las manos",
      "Resolver cualquier misterio",
      "Crear obras maestras",
      "Curar a cualquier persona",
      "Convencer a cualquier persona",
    ],
    riasecWeights: [
      { R: 0.7, I: 0.1, A: 0.0, S: 0.1, E: 0.0, C: 0.1 },
      { R: 0.1, I: 0.7, A: 0.0, S: 0.0, E: 0.0, C: 0.2 },
      { R: 0.0, I: 0.0, A: 0.8, S: 0.1, E: 0.1, C: 0.0 },
      { R: 0.0, I: 0.0, A: 0.1, S: 0.8, E: 0.0, C: 0.1 },
      { R: 0.0, I: 0.0, A: 0.0, S: 0.0, E: 0.7, C: 0.3 },
    ],
  },
];

// ── Layer 2: Aptitudes (Q13-Q17) ──
//
// Behavioral scenario questions. Each has 4 options mapping to
// aptitude vector dimensions: [logical, communication, creative, social].

const layer2Questions: Question[] = [
  {
    id: "Q13",
    layer: 2,
    dimension: "aptitude-logical",
    type: "single-choice",
    text: "En un examen, ¿qué tipo de pregunta te sale mejor?",
    options: [
      "La que requiere cálculos y fórmulas",
      "La de análisis de textos largos",
      "La de crear algo original",
      "La de trabajar en equipo",
    ],
  },
  {
    id: "Q14",
    layer: 2,
    dimension: "aptitude-planning",
    type: "single-choice",
    text: "Si tienes un proyecto grande, ¿qué haces primero?",
    options: [
      "Hago un plan detallado paso a paso",
      "Investigo todo lo posible antes",
      "Empiezo a crear algo y ajusto después",
      "Organizo al grupo y asigno tareas",
    ],
  },
  {
    id: "Q15",
    layer: 2,
    dimension: "aptitude-learning",
    type: "single-choice",
    text: "¿Cómo aprendes algo nuevo más rápido?",
    options: [
      "Practicando con mis manos",
      "Leyendo y investigando a fondo",
      "Observando ejemplos e imitando",
      "Explicándolo a otros",
    ],
  },
  {
    id: "Q16",
    layer: 2,
    dimension: "aptitude-pressure",
    type: "single-choice",
    text: "¿En qué situación rindes mejor bajo presión?",
    options: [
      "Cuando debo entregar algo concreto",
      "Cuando debo analizar y decidir",
      "Cuando debo ser creativo bajo presión",
      "Cuando debo trabajar con otros",
    ],
  },
  {
    id: "Q17",
    layer: 2,
    dimension: "aptitude-focus",
    type: "single-choice",
    text: "¿Qué tipo de tarea te mantienes más concentrado?",
    options: [
      "Tareas mecánicas y repetitivas",
      "Tareas que requieren lógica profunda",
      "Tareas que requieren imaginación",
      "Tareas que involucran interacción social",
    ],
  },
];

// ── Layer 3: Values & Lifestyle (Q18-Q22) ──
//
// Mix of single-choice (3) and likert-5 (2) questions.

const layer3Questions: Question[] = [
  {
    id: "Q18",
    layer: 3,
    dimension: "autonomy",
    type: "likert-5",
    text: "¿Qué tan importante es para ti la autonomía en tu trabajo?",
    options: [
      "Nada importante",
      "Poco importante",
      "Moderadamente importante",
      "Muy importante",
      "Extremadamente importante",
    ],
  },
  {
    id: "Q19",
    layer: 3,
    dimension: "work-style",
    type: "single-choice",
    text: "¿Cómo prefieres trabajar?",
    options: [
      "Solo y concentrado",
      "En equipo pequeño",
      "Liderando un grupo",
      "Con clientes directamente",
    ],
  },
  {
    id: "Q20",
    layer: 3,
    dimension: "risk-tolerance",
    type: "likert-5",
    text: "¿Qué tan dispuesto/a estás a asumir riesgos en tu carrera?",
    options: [
      "Nada dispuesto",
      "Poco dispuesto",
      "Moderadamente dispuesto",
      "Muy dispuesto",
      "Totalmente dispuesto",
    ],
  },
  {
    id: "Q21",
    layer: 3,
    dimension: "schedule",
    type: "binary",
    text: "¿Prefieres un horario fijo o flexibilidad para organizar tu tiempo?",
    options: ["Horario fijo y predecible", "Flexibilidad total"],
  },
  {
    id: "Q22",
    layer: 3,
    dimension: "orientation",
    type: "single-choice",
    text: "¿Qué es más importante para ti en un trabajo?",
    options: [
      "Seguridad y estabilidad",
      "Creatividad y libertad",
      "Poder y estatus",
      "Ayudar a otros",
      "Aprendizaje continuo",
    ],
  },
];

// ── Layer 4: Modality (Q23-Q25) ──
//
// Direct preference questions for presencial vs. virtual recommendation.

const layer4Questions: Question[] = [
  {
    id: "Q23",
    layer: 4,
    dimension: "modality",
    type: "single-choice",
    text: "¿Cómo prefieres tomar tus clases?",
    options: [
      "Presencial (ir a un campus)",
      "Virtual (desde cualquier lugar)",
      "No tengo preferencia",
    ],
  },
  {
    id: "Q24",
    layer: 4,
    dimension: "modality-discipline",
    type: "likert-5",
    text: "¿Qué tan cómodo/a te sientes aprendiendo en línea?",
    options: [
      "Muy incómodo",
      "Algo incómodo",
      "Neutral",
      "Cómodo",
      "Muy cómodo",
    ],
  },
  {
    id: "Q25",
    layer: 4,
    dimension: "modality-access",
    type: "binary",
    text: "¿Tienes acceso estable a internet y un espacio de estudio en casa?",
    options: [
      "Sí, tengo todo",
      "No tengo internet estable o espacio dedicado",
    ],
  },
];

// ── Combined Question Bank ──

export const QUESTION_BANK: Question[] = [
  ...layer1Questions,
  ...layer2Questions,
  ...layer3Questions,
  ...layer4Questions,
];

// ── Accessors ──

/** Get questions for a specific layer (1-4). */
export function getQuestionsByLayer(layer: 1 | 2 | 3 | 4): Question[] {
  return QUESTION_BANK.filter((q) => q.layer === layer);
}

/** Get a single question by its ID. */
export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

/** Get all Layer 1 questions (RIASEC). */
export function getRIASECQuestions(): Question[] {
  return getQuestionsByLayer(1);
}

/** Get total question count. */
export function getQuestionCount(): number {
  return QUESTION_BANK.length;
}
