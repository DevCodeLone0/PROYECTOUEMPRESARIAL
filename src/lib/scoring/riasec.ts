/**
 * RIASEC Scoring Engine — core pure functions for the 4-layer scoring system.
 *
 * Functions:
 *   - normalizeProfile: raw RIASEC scores → [0, 1] per dimension
 *   - cosineSimilarity: two vectors → similarity in [0, 1]
 *   - computeFitBreakdown: student + program → per-layer fit scores (0-100)
 *   - computeOverallScore: weighted cosine → 0-100
 *   - rankPrograms: student profile → sorted programs
 */

import type {
  RIASECProfile,
  FitBreakdown,
  ScoringResult,
  ProgramProfile,
} from "./types";
import { RIASEC_DIMENSIONS } from "./types";

// ═══════════════════════════════════════════════════════════
// normalizeProfile
// ═══════════════════════════════════════════════════════════

/**
 * Normalize raw RIASEC scores to [0, 1] per dimension.
 *
 * @param rawScores - Accumulated weights per dimension from answered questions
 * @param maxPossible - Max possible score per dimension across answered questions
 * @returns Normalized RIASECProfile with each dimension in [0, 1]
 *
 * Algorithm (from design.md):
 *   normalized[d] = clamp(raw[d] / maxPossible[d], 0, 1)
 *
 * maxPossible[d] is the sum of the maximum weight for dimension d across
 * all answered Layer 1 questions. The caller must compute this from the
 * question bank's riasecWeights.
 */
export function normalizeProfile(
  rawScores: RIASECProfile,
  maxPossible: Partial<RIASECProfile> = {}
): RIASECProfile {
  const result = {} as RIASECProfile;

  for (const dim of RIASEC_DIMENSIONS) {
    const raw = rawScores[dim] ?? 0;
    const max = maxPossible[dim] ?? 0;
    result[dim] = max > 0 ? clamp01(raw / max) : 0;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════
// cosineSimilarity
// ═══════════════════════════════════════════════════════════

/**
 * Compute cosine similarity between two numeric vectors.
 *
 * Returns 0 when either vector is all-zero (avoids NaN).
 * For non-negative vectors, result is in [0, 1].
 *
 * @param a - First vector
 * @param b - Second vector (must be same length as a)
 * @returns Cosine similarity score
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector length mismatch: a has ${a.length}, b has ${b.length}`
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  // Clamp to [0, 1] to handle floating-point drift for non-negative vectors
  return clamp01(dotProduct / denominator);
}

// ═══════════════════════════════════════════════════════════
// computeFitBreakdown
// ═══════════════════════════════════════════════════════════

/**
  * Compute per-layer fit scores between a student's profile and a program.
  *
  * @param studentProfile - Normalized RIASEC profile [0, 1] per dimension
  * @param program - Program requirement vectors
  * @param aptitudeVec - Student's aptitude vector (4 elements)
  * @param valuesVec - Student's values/lifestyle vector (4 elements)
  * @returns FitBreakdown with personality (0-100), technical (0-100), lifestyle (0-100)
  */
export function computeFitBreakdown(
  studentProfile: RIASECProfile,
  program: ProgramProfile,
  aptitudeVec: number[],
  valuesVec: number[]
): FitBreakdown {
  const riasecVec = Object.values(studentProfile);
  const programRiasecVec = Object.values(program.riasec);

  const personality = cosineSimilarity(riasecVec, programRiasecVec) * 100;
  const technical = cosineSimilarity(aptitudeVec, program.aptitude) * 100;
  const lifestyle = cosineSimilarity(valuesVec, program.values) * 100;

  return { personality, technical, lifestyle };
}

// ═══════════════════════════════════════════════════════════
// computeOverallScore
// ═══════════════════════════════════════════════════════════

/**
 * Compute weighted overall score: 0.4 × riasec + 0.3 × aptitude + 0.3 × values.
 *
 * @param studentProfile - Normalized RIASEC profile
 * @param program - Program requirement vectors
 * @param aptitudeVec - Student's aptitude vector (4 elements)
 * @param valuesVec - Student's values/lifestyle vector (4 elements)
 * @returns Score in [0, 100]
 */
export function computeOverallScore(
  studentProfile: RIASECProfile,
  program: ProgramProfile,
  aptitudeVec: number[],
  valuesVec: number[]
): number {
  const riasecVec = Object.values(studentProfile);
  const programRiasecVec = Object.values(program.riasec);

  const riasecSim = cosineSimilarity(riasecVec, programRiasecVec);
  const aptSim = cosineSimilarity(aptitudeVec, program.aptitude);
  const valSim = cosineSimilarity(valuesVec, program.values);

  return (0.4 * riasecSim + 0.3 * aptSim + 0.3 * valSim) * 100;
}

// ═══════════════════════════════════════════════════════════
// rankPrograms
// ═══════════════════════════════════════════════════════════

/**
 * Rank programs by overall fit score (descending).
 *
 * @param studentProfile - Normalized RIASEC profile
 * @param aptitudeVec - Student's aptitude vector (4 elements)
 * @param valuesVec - Student's values/lifestyle vector (4 elements)
 * @param programs - Array of program profiles to rank
 * @returns Sorted array of ScoringResult (highest score first)
 */
export function rankPrograms(
  studentProfile: RIASECProfile,
  aptitudeVec: number[],
  valuesVec: number[],
  programs: ProgramProfile[]
): ScoringResult[] {
  const results: ScoringResult[] = programs.map((program) => {
    const overallScore = computeOverallScore(
      studentProfile,
      program,
      aptitudeVec,
      valuesVec
    );

    const fitBreakdown = computeFitBreakdown(
      studentProfile,
      program,
      aptitudeVec,
      valuesVec
    );

    return {
      programId: program.id,
      overallScore,
      fitBreakdown,
    };
  });

  // Sort descending by overallScore; stable sort keeps original order for ties
  return results.sort((a, b) => b.overallScore - a.overallScore);
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

/** Clamp a number to [0, 1]. */
function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
