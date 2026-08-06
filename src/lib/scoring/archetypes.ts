/**
 * Archetype Mapper — maps RIASEC profiles to Jung-inspired professional archetypes.
 *
 * 8 archetypes, each with a dominant RIASEC pair pattern.
 * Uses dominant/secondary mapping first, cosine fallback for ambiguous profiles.
 *
 * All functions are pure — no side effects, no external dependencies.
 */

import type { RIASECDimension, RIASECProfile, Archetype } from "./types";
import { RIASEC_DIMENSIONS } from "./types";
import { cosineSimilarity } from "./riasec";

// ═══════════════════════════════════════════════════════════
// Archetype Definitions
// ═══════════════════════════════════════════════════════════

/**
 * The 8 Jung-inspired professional archetypes.
 *
 * Each has a name, emoji, description, WhyDualModel text (Spanish),
 * and an ideal RIASEC profile vector for cosine fallback matching.
 */
export const ARCHETYPES: readonly Archetype[] = [
  {
    id: "constructor",
    name: "El Constructor",
    emoji: "⚙️",
    description:
      "Optimizas todo lo que tocas. Procesos, recursos, tiempo — encuentras la forma más inteligente de hacer las cosas.",
    whyDualModel:
      "El Modelo Dual te permite combinar el aprendizaje práctico en empresa con formación técnica sólida, ideal para quienes aprenden haciendo.",
    riasecProfile: { R: 0.9, I: 0.7, A: 0.1, S: 0.1, E: 0.3, C: 0.5 },
  },
  {
    id: "investigador",
    name: "El Investigador",
    emoji: "🔬",
    description:
      "Tu curiosidad no tiene límites. Analizas, experimentas y descubres patrones que otros pasan por alto.",
    whyDualModel:
      "El Modelo Dual te da acceso a proyectos reales de investigación y desarrollo mientras completas tu formación académica.",
    riasecProfile: { R: 0.7, I: 0.9, A: 0.2, S: 0.2, E: 0.2, C: 0.4 },
  },
  {
    id: "creador",
    name: "El Creador",
    emoji: "🎨",
    description:
      "Transformas ideas en experiencias. Tu creatividad es tu lenguaje natural y tu mayor ventaja.",
    whyDualModel:
      "El Modelo Dual te permite desarrollar tu talento creativo en proyectos reales mientras adquieres habilidades de gestión.",
    riasecProfile: { R: 0.2, I: 0.3, A: 0.9, S: 0.6, E: 0.3, C: 0.1 },
  },
  {
    id: "connecting",
    name: "El Conector",
    emoji: "🤝",
    description:
      "Entiendes a las personas como nadie. Empatía, comunicación y habilidades sociales son tu superpoder.",
    whyDualModel:
      "El Modelo Dual te prepara para liderar equipos y gestionar relaciones en entornos profesionales desde el primer día.",
    riasecProfile: { R: 0.1, I: 0.2, A: 0.4, S: 0.9, E: 0.7, C: 0.2 },
  },
  {
    id: "estratega",
    name: "El Estratega",
    emoji: "♟️",
    description:
      "Planificas, organizas y ejecutas con precisión. Ves el panorama completo donde otros ven caos.",
    whyDualModel:
      "El Modelo Dual te permite aplicar tus habilidades de planificación en contextos empresariales reales desde el inicio.",
    riasecProfile: { R: 0.3, I: 0.4, A: 0.1, S: 0.2, E: 0.7, C: 0.9 },
  },
  {
    id: "analista",
    name: "El Analista",
    emoji: "📊",
    description:
      "Los datos cuentan historias para ti. Metódico, preciso y orientado a la excelencia.",
    whyDualModel:
      "El Modelo Dual combina el análisis riguroso con la experiencia práctica, ideal para quienes buscan precisión y resultados.",
    riasecProfile: { R: 0.4, I: 0.8, A: 0.1, S: 0.1, E: 0.3, C: 0.9 },
  },
  {
    id: "visionario",
    name: "El Visionario",
    emoji: "🚀",
    description:
      "Conectas creatividad con negocio. Ves oportunidades donde otros ven problemas.",
    whyDualModel:
      "El Modelo Dual te da las herramientas para convertir tus ideas innovadoras en proyectos con impacto real.",
    riasecProfile: { R: 0.3, I: 0.3, A: 0.7, S: 0.4, E: 0.9, C: 0.2 },
  },
  {
    id: "leader",
    name: "El Líder",
    emoji: "👑",
    description:
      "Inspiras, motivas y llevas equipos a resultados extraordinarios. Tu energía es contagiosa.",
    whyDualModel:
      "El Modelo Dual te prepara para liderar desde el primer día, combinando formación con responsabilidad real en empresa.",
    riasecProfile: { R: 0.2, I: 0.3, A: 0.3, S: 0.7, E: 0.9, C: 0.4 },
  },
] as const;

// ═══════════════════════════════════════════════════════════
// Mapping Table
// ═══════════════════════════════════════════════════════════

/**
 * Mapping from dominant+secondary RIASEC pair to archetype ID.
 *
 * Key format: "Dominant,Secondary" (e.g., "R,I" → "constructor").
 * Only direct mappings are listed — unmatched pairs fall back to cosine.
 */
export const MAPPING_TABLE: Record<string, string> = {
  "R,I": "constructor",
  "R,A": "constructor",
  "I,R": "investigador",
  "I,C": "investigador",
  "A,S": "creador",
  "A,I": "creador",
  "S,E": "connecting",
  "S,A": "connecting",
  "E,C": "leader",
  "E,S": "leader",
  "C,I": "analista",
  "C,E": "estratega",
  "E,A": "visionario",
  "E,R": "visionario",
};

// ═══════════════════════════════════════════════════════════
// Archetype Determination
// ═══════════════════════════════════════════════════════════

/**
 * Sort RIASEC dimensions by score (descending) and return the top two.
 *
 * Tiebreaking: when two dimensions have the same score, use alphabetical order
 * (I before R, A before S, etc.) to ensure deterministic output.
 *
 * @param profile - Normalized RIASEC profile
 * @returns Tuple of [dominant, secondary] dimensions
 */
function getTopTwoDimensions(
  profile: RIASECProfile
): [RIASECDimension, RIASECDimension] {
  const sorted = [...RIASEC_DIMENSIONS].sort((a, b) => {
    const diff = profile[b] - profile[a];
    if (diff !== 0) return diff;
    // Tiebreak: alphabetical
    return a.localeCompare(b);
  });
  return [sorted[0], sorted[1]];
}

/**
 * Find the closest archetype by cosine similarity to archetype profile vectors.
 *
 * @param profile - Student's normalized RIASEC profile
 * @returns The archetype with highest cosine similarity
 */
function findClosestByCosine(profile: RIASECProfile): Archetype {
  const studentVec = Object.values(profile);
  let bestSimilarity = -1;
  let bestArchetype = ARCHETYPES[0];

  for (const archetype of ARCHETYPES) {
    const archetypeVec = Object.values(archetype.riasecProfile);
    const similarity = cosineSimilarity(studentVec, archetypeVec);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestArchetype = archetype;
    }
  }

  return bestArchetype;
}

/**
 * Determine the archetype from a student's normalized RIASEC profile.
 *
 * Algorithm:
 * 1. Find the two highest RIASEC dimensions (dominant + secondary)
 * 2. Check the mapping table for (dominant, secondary) → archetype ID
 * 3. If no direct mapping, fall back to cosine similarity against archetype vectors
 *
 * @param riasecProfile - Student's normalized RIASEC profile (6 values in [0, 1])
 * @returns The matching Archetype object
 */
export function determineArchetype(
  riasecProfile: RIASECProfile
): Archetype {
  const [dominant, secondary] = getTopTwoDimensions(riasecProfile);
  const key = `${dominant},${secondary}`;

  // Direct mapping
  const mappedId = MAPPING_TABLE[key];
  if (mappedId) {
    const archetype = ARCHETYPES.find((a) => a.id === mappedId);
    if (archetype) return archetype;
  }

  // Cosine fallback
  return findClosestByCosine(riasecProfile);
}
