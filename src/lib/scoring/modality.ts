/**
 * Modality Advisor — presencial vs. virtual recommendation.
 *
 * Uses a dual-signal architecture:
 *   1. Direct signal (Q23-Q25): explicit preference and access
 *   2. Derived signal (Q18-Q22): lifestyle values correlated with modality
 *
 * All functions are pure — no side effects, no external dependencies.
 */

import type { RIASECProfile } from "./types";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

/** Contribution breakdown for a modality signal. */
export interface ModalityScore {
  presencial: number;
  virtual: number;
}

// ═══════════════════════════════════════════════════════════
// Direct Signal
// ═══════════════════════════════════════════════════════════

/**
 * Compute the direct modality signal from Layer 4 questions (Q23-Q25).
 *
 * Q23 (preference): 0=Presencial(+2p), 1=Virtual(+2v), 2=No pref(0). Weight: 0.5
 * Q24 (comfort):    0-1=Presencial(+1p), 2=Neutral(0), 3-4=Virtual(+1v). Weight: 0.3
 * Q25 (access):     0=Yes(+0.5v), 1=No(+1p). Weight: 0.2
 *
 * @param answers - Record of question ID → selected option index
 * @returns ModalityScore with presencial and virtual components
 */
export function computeDirectSignal(
  answers: Record<string, number>
): ModalityScore {
  let presencial = 0;
  let virtual = 0;

  // Q23: Primary preference question
  const q23 = answers["Q23"];
  if (q23 !== undefined) {
    if (q23 === 0) {
      // "Presencial (ir a un campus)"
      presencial += 2 * 0.5;
    } else if (q23 === 1) {
      // "Virtual (desde cualquier lugar)"
      virtual += 2 * 0.5;
    }
    // q23 === 2 → "No tengo preferencia" → no contribution
  }

  // Q24: Comfort learning online (likert 0-4)
  const q24 = answers["Q24"];
  if (q24 !== undefined) {
    if (q24 <= 1) {
      // "Muy incómodo" or "Algo incómodo" → presencial
      presencial += 1 * 0.3;
    } else if (q24 >= 3) {
      // "Cómodo" or "Muy cómodo" → virtual
      virtual += 1 * 0.3;
    }
    // q24 === 2 → "Neutral" → no contribution
  }

  // Q25: Access to internet and study space
  const q25 = answers["Q25"];
  if (q25 !== undefined) {
    if (q25 === 0) {
      // "Sí, tengo todo" → virtual indicator
      virtual += 0.5 * 0.2;
    } else {
      // "No tengo internet estable o espacio dedicado" → presencial
      presencial += 1 * 0.2;
    }
  }

  return { presencial, virtual };
}

// ═══════════════════════════════════════════════════════════
// Derived Signal
// ═══════════════════════════════════════════════════════════

/**
 * Compute the derived modality signal from Layer 3 lifestyle values (Q18-Q22).
 *
 * Each lifestyle dimension correlates with either presencial or virtual:
 *   Q18 (autonomy): High → virtual, Low → presencial
 *   Q19 (work-style): Solo→virtual, Team/Leaders/Clients→presencial
 *   Q20 (risk-tolerance): High→virtual, Low→presencial
 *   Q21 (schedule): Flexibility→virtual, Fixed→presencial
 *   Q22 (orientation): Learning/Creativity→virtual, Security→presencial
 *
 * @param answers - Record of question ID → selected option index
 * @param riasecProfile - Student's RIASEC profile (used for secondary signals)
 * @returns ModalityScore with presencial and virtual components
 */
export function computeDerivedSignal(
  answers: Record<string, number>,
  riasecProfile: RIASECProfile
): ModalityScore {
  let presencial = 0;
  let virtual = 0;

  // Q18: Autonomy preference (likert 0-4)
  const q18 = answers["Q18"];
  if (q18 !== undefined) {
    if (q18 >= 3) {
      // High autonomy → virtual
      virtual += 0.3;
    } else if (q18 <= 1) {
      // Low autonomy → presencial
      presencial += 0.3;
    }
  }

  // Q19: Work style preference
  const q19 = answers["Q19"];
  if (q19 !== undefined) {
    if (q19 === 0) {
      // "Solo y concentrado" → virtual
      virtual += 0.4;
    } else {
      // "En equipo", "Liderando", "Con clientes" → presencial
      presencial += 0.3;
    }
  }

  // Q20: Risk tolerance (likert 0-4)
  const q20 = answers["Q20"];
  if (q20 !== undefined) {
    if (q20 >= 3) {
      // High risk tolerance → virtual (more flexibility)
      virtual += 0.2;
    } else if (q20 <= 1) {
      // Low risk tolerance → presencial (more structure)
      presencial += 0.2;
    }
  }

  // Q21: Schedule preference (binary)
  const q21 = answers["Q21"];
  if (q21 !== undefined) {
    if (q21 === 1) {
      // "Flexibilidad total" → virtual
      virtual += 0.3;
    } else {
      // "Horario fijo y predecible" → presencial
      presencial += 0.3;
    }
  }

  // Q22: Work orientation
  const q22 = answers["Q22"];
  if (q22 !== undefined) {
    if (q22 === 1 || q22 === 4) {
      // "Creatividad y libertad" or "Aprendizaje continuo" → virtual
      virtual += 0.2;
    } else if (q22 === 0) {
      // "Seguridad y estabilidad" → presencial
      presencial += 0.3;
    }
  }

  // Secondary signal from RIASEC: high I (investigative) → more independent → virtual
  if (riasecProfile.I >= 0.7) {
    virtual += 0.1;
  }
  // High S (social) → more people-oriented → presencial
  if (riasecProfile.S >= 0.7) {
    presencial += 0.1;
  }

  return { presencial, virtual };
}

// ═══════════════════════════════════════════════════════════
// Recommendation + Confidence
// ═══════════════════════════════════════════════════════════

/**
 * Determine modality direction from a single signal score.
 *
 * @param score - ModalityScore
 * @returns "presencial", "virtual", or "neutral"
 */
function signalDirection(
  score: ModalityScore
): "presencial" | "virtual" | "neutral" {
  const diff = score.presencial - score.virtual;
  if (diff >= 1.0) return "presencial";
  if (diff <= -1.0) return "virtual";
  return "neutral";
}

/**
 * Combine direct and derived signals into a modality recommendation.
 *
 * Confidence logic:
 *   - high:   both signals agree on the same direction
 *   - medium: only one signal is decisive, no conflict
 *   - low:    signals conflict (direct still wins)
 *
 * @param directScore - Direct signal from Q23-Q25
 * @param derivedScore - Derived signal from Q18-Q22 + RIASEC
 * @returns ModalityResult with recommendation, confidence, explanation
 */
export function recommendModality(
  directScore: ModalityScore,
  derivedScore: ModalityScore
): {
  recommendation: "presencial" | "virtual";
  confidence: "high" | "medium" | "low";
  explanation: string;
} {
  const directDir = signalDirection(directScore);
  const derivedDir = signalDirection(derivedScore);

  // Determine recommendation: direct wins over derived
  let recommendation: "presencial" | "virtual";
  if (directDir === "neutral" && derivedDir === "neutral") {
    // Both neutral — default to presencial
    recommendation = "presencial";
  } else if (directDir !== "neutral") {
    recommendation = directDir;
  } else {
    // Only derived is decisive
    recommendation = derivedDir as "presencial" | "virtual";
  }

  // Determine confidence
  let confidence: "high" | "medium" | "low";
  if (directDir !== "neutral" && derivedDir !== "neutral") {
    if (directDir === derivedDir) {
      confidence = "high";
    } else {
      // Conflict — direct wins but confidence is low
      confidence = "low";
    }
  } else {
    // One or both neutral — no conflict
    confidence = "medium";
  }

  const explanation = generateExplanation(
    recommendation,
    confidence,
    directScore,
    derivedScore
  );

  return { recommendation, confidence, explanation };
}

// ═══════════════════════════════════════════════════════════
// Explanation Generation
// ═══════════════════════════════════════════════════════════

/**
 * Generate a Spanish (Colombiano) explanation for the modality recommendation.
 *
 * @param recommendation - "presencial" or "virtual"
 * @param confidence - "high", "medium", or "low"
 * @param directScore - Direct signal score
 * @param derivedScore - Derived signal score
 * @returns 1-2 sentence Spanish explanation
 */
export function generateExplanation(
  recommendation: "presencial" | "virtual",
  confidence: "high" | "medium" | "low",
  directScore: ModalityScore,
  derivedScore: ModalityScore
): string {
  const label = recommendation === "presencial" ? "presencial" : "virtual";
  const directDir = signalDirection(directScore);
  const derivedDir = signalDirection(derivedScore);

  if (confidence === "high") {
    if (recommendation === "presencial") {
      return `Recomendamos modalidad ${label} porque tus respuestas indican preferencia por el entorno presencial y tu estilo de vida se alinea mejor con esta modalidad.`;
    }
    return `Recomendamos modalidad ${label} porque tus respuestas indican preferencia por la modalidad virtual y tu estilo de vida se alinea mejor con esta modalidad.`;
  }

  if (confidence === "low") {
    if (recommendation === "presencial") {
      return `Tu respuesta directa indica preferencia presencial, pero tu estilo de vida podría funcionar en modalidad virtual. Considera explorar ambas opciones.`;
    }
    return `Tu respuesta directa indica preferencia virtual, pero tu estilo de vida podría funcionar en modalidad presencial. Considera explorar ambas opciones.`;
  }

  // Medium confidence
  if (directDir !== "neutral") {
    if (recommendation === "presencial") {
      return `Basado en tu preferencia directa, la modalidad presencial parece ser la mejor opción para ti.`;
    }
    return `Basado en tu preferencia directa, la modalidad virtual parece ser la mejor opción para ti.`;
  }

  if (derivedDir !== "neutral") {
    if (recommendation === "presencial") {
      return `Basado en tu estilo de vida, la modalidad presencial podría funcionar bien para ti.`;
    }
    return `Basado en tu estilo de vida, la modalidad virtual podría funcionar bien para ti.`;
  }

  // Both neutral
  return `No identificamos una señal fuerte en tus respuestas. La modalidad ${label} es una opción válida para ti.`;
}
