/**
 * Shared types for the RIASEC-based scoring system.
 *
 * These types are consumed by the scoring engine, question bank,
 * program matrix, modality advisor, and archetype mapper.
 */

// ── RIASEC Dimensions ──

/** The six RIASEC Holland Code dimensions. */
export type RIASECDimension = "R" | "I" | "A" | "S" | "E" | "C";

/** All RIASEC dimensions in canonical order. */
export const RIASEC_DIMENSIONS: readonly RIASECDimension[] = [
  "R",
  "I",
  "A",
  "S",
  "E",
  "C",
] as const;

/** A 6-element RIASEC profile, normalized to [0, 1] per dimension. */
export type RIASECProfile = Record<RIASECDimension, number>;

// ── Scoring Results ──

/** Breakdown of fit by scoring layer. */
export interface FitBreakdown {
  /** Layer 1 — RIASEC personality fit (0-100). */
  personality: number;
  /** Layer 2 — Aptitude fit (0-100). */
  technical: number;
  /** Layer 3 — Values/lifestyle fit (0-100). */
  lifestyle: number;
}

/** Scoring result for a single program. */
export interface ScoringResult {
  programId: string;
  /** Overall weighted score, 0-100. */
  overallScore: number;
  /** Per-layer breakdown for explanation. */
  fitBreakdown: FitBreakdown;
}

// ── Modality ──

/** Modality recommendation produced by the modality advisor. */
export interface ModalityResult {
  recommendation: "presencial" | "virtual";
  confidence: "high" | "medium" | "low";
  explanation: string;
}

// ── Archetypes ──

/** A career archetype mapped from the student's RIASEC profile. */
export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  whyDualModel: string;
  /** Ideal RIASEC profile for cosine fallback matching. */
  riasecProfile: RIASECProfile;
}

// ── Questions ──

/** A single question in the question bank. */
export interface Question {
  /** Unique identifier, e.g. "Q1". */
  id: string;
  /** Layer this question belongs to (1-4). */
  layer: 1 | 2 | 3 | 4;
  /**
   * Primary dimension this question measures.
   * - Layer 1: one of the 6 RIASEC dimension letters.
   * - Layer 2: descriptive key (e.g. 'logical', 'communication').
   * - Layer 3: descriptive key (e.g. 'autonomy', 'values').
   * - Layer 4: 'modality'.
   */
  dimension: string;
  /** Question format. */
  type: "single-choice" | "likert-5" | "binary";
  /** Question text in Spanish (Colombiano). */
  text: string;
  /** Option labels in Spanish (Colombiano). */
  options: string[];
  /**
   * Per-dimension weights for each option. Only present for Layer 1
   * questions where RIASEC scoring applies.
   *
   * Structure: weights[optIndex][dimension] → number.
   * Weights across all options for a question sum to 1.0 per dimension.
   */
  riasecWeights?: Record<RIASECDimension, number>[];
  /**
   * Per-option aptitude weights for Layer 2 questions. Each option maps to
   * the aptitude slots [logical, planning, creative, social]; weights per
   * option typically sum to 1. Only present for Layer 2 questions.
   */
  aptitudeWeights?: number[][];
}

// ── Program Profiles ──

/** Requirement profile for a single university program. */
export interface ProgramProfile {
  /** Program identifier, matches Program.id from programs.ts. */
  id: string;
  /** Human-readable program name. */
  name: string;
  /** 6-element RIASEC requirement vector, values in [0, 1]. */
  riasec: RIASECProfile;
  /** 4-element aptitude requirement vector, values in [0, 1]. */
  aptitude: number[];
  /** 4-element values/lifestyle requirement vector, values in [0, 1]. */
  values: number[];
}
