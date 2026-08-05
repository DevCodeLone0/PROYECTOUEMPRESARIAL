import { WEIGHTS, type Dimension, DIMENSIONS } from "./scoring-matrix";
import { programs, type Program } from "./programs";
import { archetypes, type Archetype } from "./archetypes";

export interface ScoringResult {
  programId: string;
  compatibility: number; // 0-100
  dimensionScores: Record<Dimension, number>;
}

export interface TestScores {
  intereses: number;
  personalidad: number;
  habilidades: number;
  motivacion: number;
}

// Max possible raw scores per dimension
const MAX_SCORES: Record<Dimension, number> = {
  intereses: 3 * 4, // 3 questions × 4 options (0-indexed)
  personalidad: 5 * 5, // 5 questions × Likert max 5
  habilidades: 4 * 4, // 4 questions × level max 4
  motivacion: 3 * 1, // 3 questions × binary max 1
};

/**
 * Calculate raw dimension scores from test answers
 */
export function calculateDimensionScores(
  answers: Record<string, string | number>
): TestScores {
  const scores: TestScores = {
    intereses: 0,
    personalidad: 0,
    habilidades: 0,
    motivacion: 0,
  };

  // Intereses Q1-Q3: single choice, option index (0-4)
  for (let i = 1; i <= 3; i++) {
    const val = answers[`Q${i}`];
    if (val !== undefined && val !== "") {
      scores.intereses += Number(val);
    }
  }

  // Personalidad Q4-Q8: Likert 1-5
  for (let i = 4; i <= 8; i++) {
    const val = answers[`Q${i}`];
    if (val !== undefined && val !== "") {
      scores.personalidad += Number(val);
    }
  }

  // Habilidades Q9-Q12: level 1-4
  for (let i = 9; i <= 12; i++) {
    const val = answers[`Q${i}`];
    if (val !== undefined && val !== "") {
      scores.habilidades += Number(val);
    }
  }

  // Motivación Q13-Q15: binary (0 or 1)
  for (let i = 13; i <= 15; i++) {
    const val = answers[`Q${i}`];
    if (val !== undefined && val !== "") {
      scores.motivacion += Number(val);
    }
  }

  return scores;
}

/**
 * Normalize a dimension score to 0-1
 */
export function normalizeScore(raw: number, dimension: Dimension): number {
  const max = MAX_SCORES[dimension];
  if (max === 0) return 0;
  return Math.min(raw / max, 1);
}

/**
 * Calculate compatibility for each program and return sorted results
 */
export function calculateCompatibility(
  answers: Record<string, string | number>
): ScoringResult[] {
  const rawScores = calculateDimensionScores(answers);

  const normalizedScores: Record<Dimension, number> = {
    intereses: normalizeScore(rawScores.intereses, "intereses"),
    personalidad: normalizeScore(rawScores.personalidad, "personalidad"),
    habilidades: normalizeScore(rawScores.habilidades, "habilidades"),
    motivacion: normalizeScore(rawScores.motivacion, "motivacion"),
  };

  const results: ScoringResult[] = programs.map((program: Program) => {
    let compatibility = 0;

    for (const dim of DIMENSIONS) {
      compatibility += normalizedScores[dim] * WEIGHTS[dim][program.id];
    }

    // Convert to percentage (0-100)
    const percentage = Math.round(Math.min(compatibility * 100, 100));

    return {
      programId: program.id,
      compatibility: percentage,
      dimensionScores: { ...normalizedScores },
    };
  });

  // Sort by compatibility descending, then alphabetically for ties
  results.sort((a, b) => {
    if (b.compatibility !== a.compatibility) {
      return b.compatibility - a.compatibility;
    }
    const progA = programs.find((p) => p.id === a.programId);
    const progB = programs.find((p) => p.id === b.programId);
    return (progA?.name ?? "").localeCompare(progB?.name ?? "");
  });

  return results;
}

/**
 * Determine archetype based on dominant dimension and answer patterns
 */
export function determineArchetype(
  answers: Record<string, string | number>
): Archetype {
  const rawScores = calculateDimensionScores(answers);
  const normalizedScores: Record<Dimension, number> = {
    intereses: normalizeScore(rawScores.intereses, "intereses"),
    personalidad: normalizeScore(rawScores.personalidad, "personalidad"),
    habilidades: normalizeScore(rawScores.habilidades, "habilidades"),
    motivacion: normalizeScore(rawScores.motivacion, "motivacion"),
  };

  // Find dominant dimension
  let dominantDim: Dimension = "intereses";
  let maxScore = 0;
  for (const dim of DIMENSIONS) {
    if (normalizedScores[dim] > maxScore) {
      maxScore = normalizedScores[dim];
      dominantDim = dim;
    }
  }

  // Filter archetypes by dominant dimension
  const candidates = archetypes.filter(
    (a) => a.dominantDimension === dominantDim
  );

  // Use a simple heuristic based on specific answer patterns to pick the best archetype
  // Q1-Q3 map to different interest areas
  const q1 = Number(answers.Q1 ?? 0);
  const q4 = Number(answers.Q4 ?? 3);
  const q5 = Number(answers.Q5 ?? 3);

  let index = 0;
  if (dominantDim === "intereses") {
    index = q1 % candidates.length;
  } else if (dominantDim === "personalidad") {
    index = (q4 + q5) % candidates.length;
  } else {
    index = Math.floor(Math.random() * candidates.length);
  }

  return candidates[index] ?? archetypes[0];
}

/**
 * Get top N results with program details
 */
export function getTopPrograms(
  results: ScoringResult[],
  n: number
): Array<ScoringResult & { program: Program }> {
  return results.slice(0, n).map((r) => ({
    ...r,
    program: programs.find((p) => p.id === r.programId)!,
  }));
}

/**
 * Count missing answers (Q1-Q15 only)
 */
export function countMissingAnswers(
  answers: Record<string, string | number>
): number {
  let missing = 0;
  for (let i = 1; i <= 15; i++) {
    const val = answers[`Q${i}`];
    if (val === undefined || val === "") {
      missing++;
    }
  }
  return missing;
}
