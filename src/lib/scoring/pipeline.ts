/**
 * Scoring Pipeline — pure function that orchestrates the full scoring flow.
 *
 * Given an answers record (from the Zustand test store), produces:
 *   - RIASEC profile (normalized)
 *   - Aptitude vector (4 elements, normalized to [0, 1])
 *   - Values vector (4 elements, normalized to [0, 1])
 *   - Modality result (presencial/virtual + confidence + explanation)
 *   - Archetype (Jung-inspired, from RIASEC profile)
 *   - Ranked programs (sorted by overall score)
 *
 * Vector slot semantics (must match programs-matrix.ts):
 *   aptitude: [logical, planning, creative, social]
 *   values:   [autonomy, risk-tolerance, flexibility, helping]
 *
 * Layer 2 normalization: each option carries its own per-slot aptitude
 * weights (aptitudeWeights[answer][slot]); the answer's weights are added
 * element-wise to the aptitude vector, so a question signals the traits
 * its scenario actually describes instead of an ordinal intensity scale.
 *
 * After per-question contributions are accumulated, each vector is
 * divided by its own max (max(vec, 1)) — this rescales the highest slot
 * to 1.0 while keeping the relative shape. This makes cosine similarity
 * well-behaved and compares only the *direction* of the student's vector
 * vs the program's requirement vector, which is what we want.
 */

import type {
  RIASECDimension,
  RIASECProfile,
  Archetype,
  ModalityResult,
  ScoringResult,
} from "./types";
import { RIASEC_DIMENSIONS } from "./types";
import { QUESTION_BANK } from "../questions/question-bank";
import { PROGRAM_PROFILES } from "./programs-matrix";
import { normalizeProfile, rankPrograms } from "./riasec";
import {
  computeDirectSignal,
  computeDerivedSignal,
  recommendModality,
} from "./modality";
import { determineArchetype } from "./archetypes";

// ── Values dimension mapping ──
// programs-matrix.ts declares values vector as [autonomy, risk-tolerance, flexibility, helping].
// Each Layer 3 question contributes to one slot.
//
//   Q18 (autonomy likert)        → 0 (autonomy)
//   Q19 (work-style single)       → 3 (helping — team/leaders/clients are people-oriented)
//                                  Q19 opt 0 ("Solo") is one-hot only in flexibility (see helper)
//   Q20 (risk-tolerance likert)   → 1 (risk-tolerance)
//   Q21 (schedule binary)         → 2 (flexibility — "Flexibilidad total" is the flexibility signal)
//   Q22 (orientation single)      → 3 (helping — "Ayudar a otros" maps directly; other options
//                                            contribute their own one-hot encoding)
//
// Q19 and Q22 both feed the "helping" slot (Q19 in its team/leader/client options, Q22 only
// when "Ayudar a otros" is selected). The "flexibility" slot is dominated by Q21 (schedule).
const VALUES_DIMENSION_INDEX: Record<string, number> = {
  autonomy: 0,
  "risk-tolerance": 1,
  schedule: 2,
  "work-style": 3,
  orientation: 3,
};

// ── Final output type ──

export interface ScoringPipelineResult {
  riasecProfile: RIASECProfile;
  aptitudeVec: number[];
  valuesVec: number[];
  modalityResult: ModalityResult;
  archetype: Archetype;
  rankedResults: ScoringResult[];
}

// ═══════════════════════════════════════════════════════════
// RIASEC Profile (Layer 1)
// ═══════════════════════════════════════════════════════════

function computeRiasecProfile(
  answers: Record<string, number>
): RIASECProfile {
  const rawScores: Record<RIASECDimension, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0,
  };
  const maxPossible: Record<RIASECDimension, number> = {
    R: 0, I: 0, A: 0, S: 0, E: 0, C: 0,
  };

  for (const q of QUESTION_BANK.filter((q) => q.layer === 1)) {
    const answer = answers[q.id];
    if (answer === undefined || !q.riasecWeights) continue;

    const weights = q.riasecWeights[answer];
    if (weights) {
      for (const dim of RIASEC_DIMENSIONS) {
        rawScores[dim] += weights[dim] ?? 0;
      }
    }

    // Track max possible per dimension (max weight across all options for this question)
    for (const dim of RIASEC_DIMENSIONS) {
      let maxW = 0;
      for (const optWeights of q.riasecWeights) {
        maxW = Math.max(maxW, optWeights[dim] ?? 0);
      }
      maxPossible[dim] += maxW;
    }
  }

  return normalizeProfile(rawScores as RIASECProfile, maxPossible);
}

// ═══════════════════════════════════════════════════════════
// Aptitude Vector (Layer 2)
// ═══════════════════════════════════════════════════════════

function computeAptitudeVector(
  answers: Record<string, number>
): number[] {
  const vec = [0, 0, 0, 0];

  for (const q of QUESTION_BANK.filter((q) => q.layer === 2)) {
    const answer = answers[q.id];
    if (answer === undefined || !q.aptitudeWeights) continue;

    const weights = q.aptitudeWeights[answer];
    if (!weights) continue;
    for (let i = 0; i < vec.length; i++) {
      vec[i] += weights[i] ?? 0;
    }
  }

  // Divide by max so the highest slot becomes 1.0 (only direction matters for cosine)
  const max = Math.max(...vec, 1);
  for (let i = 0; i < vec.length; i++) {
    vec[i] = vec[i] / max;
  }

  return vec;
}

// ═══════════════════════════════════════════════════════════
// Values Vector (Layer 3)
// ═══════════════════════════════════════════════════════════

/**
 * For single-choice questions where ONE option maps to a slot, encode the slot
 * as 1.0 if the user selected that option, else 0. We use one-hot at the
 * OPTION level, not the dimension level.
 *
 * Concretely:
 *   Q19 work-style: opt 0 "Solo"               → flexibility slot (1.0)
 *                                            else: helping slot (1.0)
 *   Q21 schedule:    opt 1 "Flexibilidad total" → flexibility slot (1.0)
 *                                            opt 0 "Horario fijo"         → 0 (presencial signal)
 *   Q22 orientation: opt 3 "Ayudar a otros"    → helping slot (1.0)
 *                                            other options → 0
 */
function computeValuesVector(
  answers: Record<string, number>,
  riasecProfile: RIASECProfile
): number[] {
  const vec = [0, 0, 0, 0];

  for (const q of QUESTION_BANK.filter((q) => q.layer === 3)) {
    const answer = answers[q.id];
    if (answer === undefined) continue;

    if (q.type === "likert-5") {
      // Q18 (autonomy), Q20 (risk-tolerance): direct likert linear mapping.
      const idx = VALUES_DIMENSION_INDEX[q.dimension] ?? 0;
      // answer range for likert-5 stored as 1-5 (QuestionCard uses index+1)
      // normalize to [0,1] via (answer-1) / (options-1)
      const numOptions = q.options?.length ?? 5;
      vec[idx] += (answer - 1) / (numOptions - 1);
    } else if (q.type === "binary") {
      // Q21 schedule: opt 0 "Horario fijo" → 0 (no contribution to flexibility)
      //               opt 1 "Flexibilidad total" → 1.0 in flexibility slot
      if (q.dimension === "schedule" && answer === 1) {
        const idx = VALUES_DIMENSION_INDEX["schedule"]; // 2 = flexibility
        vec[idx] += 1.0;
      }
    } else {
      // single-choice: use one-hot at the option level.
      // Q19 work-style: opt 0 "Solo y concentrado" → flexibility (idx 2)
      //                 opt 1/2/3 → helping (idx 3)
      // Q22 orientation: opt 3 "Ayudar a otros" → helping (idx 3)
      //                  other options → no contribution (-focus on this specific trait)
      if (q.dimension === "work-style") {
        if (answer === 0) {
          // "Solo y concentrado" → flexibility signal
          vec[2] += 1.0; // flexibility
        } else {
          // team/leaders/clients → helping signal
          vec[3] += 1.0; // helping
        }
      } else if (q.dimension === "orientation") {
        if (answer === 3) {
          // "Ayudar a otros" → helping
          vec[3] += 1.0;
        }
        // Other orientation options are about security/power/creativity/learning
        // and don't strongly signal either autonomy/flexibility/helping/risk-tolerance.
        // We intentionally leave them neutral so they don't noise up the values vector.
      }
    }
  }

  // Secondary derived signals from RIASEC (mirrors modality.ts approach):
  // high A (artistic) → more autonomy-oriented
  if (riasecProfile.A >= 0.7) {
    vec[0] += 0.2; // autonomy bump
  }

  // Divide by max so the highest slot becomes 1.0
  const max = Math.max(...vec, 1);
  for (let i = 0; i < vec.length; i++) {
    vec[i] = vec[i] / max;
  }

  return vec;
}

// ═══════════════════════════════════════════════════════════
// Main pipeline function
// ═══════════════════════════════════════════════════════════

/**
 * Run the complete scoring pipeline from answers to results.
 *
 * Pure — no side effects. Caller is responsible for persisting results.
 *
 * @param answers - Record of question ID → selected option index (or 1-based likert value)
 * @returns Complete scoring results ready to be rendered or persisted
 */
export function runScoringPipeline(
  answers: Record<string, number>
): ScoringPipelineResult {
  // ── Layer 1: RIASEC Profile ──
  const riasecProfile = computeRiasecProfile(answers);

  // ── Layer 4: Modality ──
  const directSignal = computeDirectSignal(answers);
  const derivedSignal = computeDerivedSignal(answers, riasecProfile);
  const modalityResult = recommendModality(directSignal, derivedSignal);

  // ── Archetype ──
  const archetype = determineArchetype(riasecProfile);

  // ── Layer 2: Aptitude vector ──
  const aptitudeVec = computeAptitudeVector(answers);

  // ── Layer 3: Values vector ──
  const valuesVec = computeValuesVector(answers, riasecProfile);

  // ── Rank programs ──
  const rankedResults = rankPrograms(
    riasecProfile,
    aptitudeVec,
    valuesVec,
    PROGRAM_PROFILES
  );

  return {
    riasecProfile,
    aptitudeVec,
    valuesVec,
    modalityResult,
    archetype,
    rankedResults,
  };
}
