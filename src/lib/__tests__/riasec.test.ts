import { describe, it, expect } from "vitest";
import {
  normalizeProfile,
  cosineSimilarity,
  computeFitBreakdown,
  computeOverallScore,
  rankPrograms,
} from "../scoring/riasec";
import { PROGRAM_PROFILES } from "../scoring/programs-matrix";
import type { RIASECProfile } from "../scoring/types";

// ── Test Fixtures ──

/** All-zero RIASEC profile (no answers at all). */
const ALL_ZERO: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

/** All-max RIASEC profile (maximum on every dimension). */
const ALL_MAX: RIASECProfile = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 };

/** Profile heavily skewed toward R and I (engineer-type). */
const ENGINEER_PROFILE: RIASECProfile = {
  R: 0.9,
  I: 0.8,
  A: 0.2,
  S: 0.1,
  E: 0.3,
  C: 0.4,
};

/** Profile heavily skewed toward S and E (business/social type). */
const SOCIAL_PROFILE: RIASECProfile = {
  R: 0.1,
  I: 0.2,
  A: 0.4,
  S: 0.9,
  E: 0.7,
  C: 0.3,
};

const ALL_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;

// ═══════════════════════════════════════════════════════════
// T4: normalizeProfile
// ═══════════════════════════════════════════════════════════

describe("normalizeProfile", () => {
  it("returns all zeros when no maxPossible is provided", () => {
    const result = normalizeProfile(
      { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    );
    for (const dim of ALL_DIMENSIONS) {
      expect(result[dim]).toBe(0);
    }
  });

  it("normalizes a single answered question correctly", () => {
    // Q1: max R weight across options is 0.5
    const rawScores = { R: 0.5, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const maxPossible = { R: 0.5, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const result = normalizeProfile(rawScores, maxPossible);
    expect(result.R).toBeCloseTo(1.0, 1);
    // Other dimensions should be 0
    expect(result.I).toBe(0);
    expect(result.A).toBe(0);
  });

  it("clamps values to [0, 1] range", () => {
    // Simulate raw scores exceeding max possible
    const rawScores = { R: 1.5, I: 0.3, A: 0, S: 0, E: 0, C: 0 };
    const maxPossible = { R: 1.0, I: 1.0, A: 0, S: 0, E: 0, C: 0 };
    const result = normalizeProfile(rawScores, maxPossible);
    expect(result.R).toBeLessThanOrEqual(1.0);
    expect(result.R).toBeGreaterThanOrEqual(0);
  });

  it("handles all dimensions returning values in [0, 1]", () => {
    const rawScores = { R: 0.8, I: 0.6, A: 0.4, S: 0.3, E: 0.5, C: 0.7 };
    const maxPossible = { R: 1.0, I: 1.0, A: 1.0, S: 1.0, E: 1.0, C: 1.0 };
    const result = normalizeProfile(rawScores, maxPossible);
    for (const dim of ALL_DIMENSIONS) {
      expect(result[dim]).toBeGreaterThanOrEqual(0);
      expect(result[dim]).toBeLessThanOrEqual(1);
    }
  });

  it("preserves relative proportions when all dimensions have the same max", () => {
    const rawScores = { R: 0.6, I: 0.3, A: 0.9, S: 0.1, E: 0.4, C: 0.7 };
    const maxPossible = { R: 1.0, I: 1.0, A: 1.0, S: 1.0, E: 1.0, C: 1.0 };
    const result = normalizeProfile(rawScores, maxPossible);
    // Highest raw should still be highest normalized
    const maxDim = ALL_DIMENSIONS.reduce((a, b) =>
      result[a] > result[b] ? a : b
    );
    expect(maxDim).toBe("A");
  });
});

// ═══════════════════════════════════════════════════════════
// T4: cosineSimilarity
// ═══════════════════════════════════════════════════════════

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const a = [0.5, 0.3, 0.7];
    const b = [0.5, 0.3, 0.7];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 6);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.0, 6);
  });

  it("returns 0 for all-zero vectors (avoids NaN)", () => {
    const a = [0, 0, 0];
    const b = [0, 0, 0];
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("handles one all-zero vector gracefully", () => {
    const a = [1, 0, 0];
    const b = [0, 0, 0];
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it("returns value in [0, 1] for non-negative vectors", () => {
    const a = [0.9, 0.1, 0.3];
    const b = [0.2, 0.8, 0.5];
    const result = cosineSimilarity(a, b);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it("returns ~0.974 for similar RIASEC-shaped vectors", () => {
    const a = [0.9, 0.8, 0.2, 0.1, 0.3, 0.4];
    const b = [0.85, 0.75, 0.25, 0.15, 0.35, 0.45];
    const result = cosineSimilarity(a, b);
    expect(result).toBeGreaterThan(0.95);
  });
});

// ═══════════════════════════════════════════════════════════
// T4: computeFitBreakdown
// ═══════════════════════════════════════════════════════════

describe("computeFitBreakdown", () => {
  const ingSoftware = PROGRAM_PROFILES[0]; // id: "ing-software"
  const aptitudeVec = [0.9, 0.5, 0.3, 0.2];
  const valuesVec = [0.6, 0.5, 0.4, 0.1];

  it("returns { personality, technical, lifestyle } with values 0-100", () => {
    const breakdown = computeFitBreakdown(ENGINEER_PROFILE, ingSoftware, aptitudeVec, valuesVec);
    expect(breakdown).toHaveProperty("personality");
    expect(breakdown).toHaveProperty("technical");
    expect(breakdown).toHaveProperty("lifestyle");
    expect(breakdown.personality).toBeGreaterThanOrEqual(0);
    expect(breakdown.personality).toBeLessThanOrEqual(100);
    expect(breakdown.technical).toBeGreaterThanOrEqual(0);
    expect(breakdown.technical).toBeLessThanOrEqual(100);
    expect(breakdown.lifestyle).toBeGreaterThanOrEqual(0);
    expect(breakdown.lifestyle).toBeLessThanOrEqual(100);
  });

  it("engineer profile + matching aptitude matches software engineering well", () => {
    const breakdown = computeFitBreakdown(ENGINEER_PROFILE, ingSoftware, aptitudeVec, valuesVec);
    expect(breakdown.personality).toBeGreaterThan(70);
    // aptitudeVec [0.9, 0.5, 0.3, 0.2] closely matches ing-software aptitude [0.9, 0.5, 0.3, 0.2]
    expect(breakdown.technical).toBeGreaterThan(70);
  });

  it("social profile has lower personality fit for software engineering", () => {
    const breakdown = computeFitBreakdown(SOCIAL_PROFILE, ingSoftware, aptitudeVec, valuesVec);
    expect(breakdown.personality).toBeLessThan(70);
  });

  it("identical profiles and vectors produce all scores of 100", () => {
    const breakdown = computeFitBreakdown(
      ingSoftware.riasec,
      ingSoftware,
      ingSoftware.aptitude,
      ingSoftware.values
    );
    expect(breakdown.personality).toBeCloseTo(100, 0);
    expect(breakdown.technical).toBeCloseTo(100, 0);
    expect(breakdown.lifestyle).toBeCloseTo(100, 0);
  });

  it("all-zero student profile and vectors produce all-zero fit scores", () => {
    const breakdown = computeFitBreakdown(ALL_ZERO, ingSoftware, [0, 0, 0, 0], [0, 0, 0, 0]);
    expect(breakdown.personality).toBe(0);
    expect(breakdown.technical).toBe(0);
    expect(breakdown.lifestyle).toBe(0);
  });

  it("matching aptitude but mismatched values still reflects technical fit", () => {
    const matchingApt = ingSoftware.aptitude; // [0.9, 0.5, 0.3, 0.2]
    const mismatchedVals = [0.1, 0.1, 0.1, 0.9]; // almost opposite of ing-software values
    const breakdown = computeFitBreakdown(
      ENGINEER_PROFILE,
      ingSoftware,
      matchingApt,
      mismatchedVals
    );
    expect(breakdown.technical).toBeCloseTo(100, 0); // perfect aptitude match
    expect(breakdown.lifestyle).toBeLessThan(60); // poor values match
  });
});

// ═══════════════════════════════════════════════════════════
// T4: computeOverallScore
// ═══════════════════════════════════════════════════════════

describe("computeOverallScore", () => {
  const ingSoftware = PROGRAM_PROFILES[0];
  const aptitudeVec = [0.9, 0.5, 0.3, 0.2];
  const valuesVec = [0.6, 0.5, 0.4, 0.1];

  it("returns a number between 0 and 100", () => {
    const score = computeOverallScore(
      ENGINEER_PROFILE,
      ingSoftware,
      aptitudeVec,
      valuesVec
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns 0 for all-zero student vectors", () => {
    const zeroApt = [0, 0, 0, 0];
    const zeroVal = [0, 0, 0, 0];
    const score = computeOverallScore(ALL_ZERO, ingSoftware, zeroApt, zeroVal);
    expect(score).toBe(0);
  });

  it("returns 100 when student matches program perfectly", () => {
    const score = computeOverallScore(
      ingSoftware.riasec,
      ingSoftware,
      ingSoftware.aptitude,
      ingSoftware.values
    );
    expect(score).toBeCloseTo(100, 0);
  });

  it("engineer profile scores higher on software than social profile", () => {
    const engineerScore = computeOverallScore(
      ENGINEER_PROFILE,
      ingSoftware,
      aptitudeVec,
      valuesVec
    );
    const socialScore = computeOverallScore(
      SOCIAL_PROFILE,
      ingSoftware,
      aptitudeVec,
      valuesVec
    );
    expect(engineerScore).toBeGreaterThan(socialScore);
  });

  it("uses correct weights: 0.4 riasec + 0.3 aptitude + 0.3 values", () => {
    // Manually compute expected score
    const riasecSim = cosineSimilarity(
      Object.values(ENGINEER_PROFILE),
      Object.values(ingSoftware.riasec)
    );
    const aptSim = cosineSimilarity(aptitudeVec, ingSoftware.aptitude);
    const valSim = cosineSimilarity(valuesVec, ingSoftware.values);
    const expected = (0.4 * riasecSim + 0.3 * aptSim + 0.3 * valSim) * 100;

    const actual = computeOverallScore(
      ENGINEER_PROFILE,
      ingSoftware,
      aptitudeVec,
      valuesVec
    );
    expect(actual).toBeCloseTo(expected, 2);
  });
});

// ═══════════════════════════════════════════════════════════
// T4: rankPrograms
// ═══════════════════════════════════════════════════════════

describe("rankPrograms", () => {
  const aptitudeVec = [0.9, 0.5, 0.3, 0.2];
  const valuesVec = [0.6, 0.5, 0.4, 0.1];

  it("returns all 12 programs", () => {
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, PROGRAM_PROFILES);
    expect(results).toHaveLength(12);
  });

  it("results are sorted by overallScore descending", () => {
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, PROGRAM_PROFILES);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].overallScore).toBeLessThanOrEqual(results[i - 1].overallScore);
    }
  });

  it("each result has programId, overallScore, and fitBreakdown", () => {
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, PROGRAM_PROFILES);
    for (const r of results) {
      expect(r).toHaveProperty("programId");
      expect(r).toHaveProperty("overallScore");
      expect(r).toHaveProperty("fitBreakdown");
      expect(r.fitBreakdown).toHaveProperty("personality");
      expect(r.fitBreakdown).toHaveProperty("technical");
      expect(r.fitBreakdown).toHaveProperty("lifestyle");
    }
  });

  it("engineer profile ranks ing-software in top 3", () => {
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, PROGRAM_PROFILES);
    const top3Ids = results.slice(0, 3).map((r) => r.programId);
    expect(top3Ids).toContain("ing-software");
  });

  it("social profile ranks negocios-turisticos higher than ing-software", () => {
    const socialApt = [0.3, 0.4, 0.3, 0.9];
    const socialVal = [0.3, 0.4, 0.5, 0.9];
    const results = rankPrograms(SOCIAL_PROFILE, socialApt, socialVal, PROGRAM_PROFILES);
    const socialRank = results.findIndex((r) => r.programId === "negocios-turisticos");
    const engRank = results.findIndex((r) => r.programId === "ing-software");
    expect(socialRank).toBeLessThan(engRank);
  });

  it("all scores are in [0, 100]", () => {
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, PROGRAM_PROFILES);
    for (const r of results) {
      expect(r.overallScore).toBeGreaterThanOrEqual(0);
      expect(r.overallScore).toBeLessThanOrEqual(100);
    }
  });

  it("handles empty programs array gracefully", () => {
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, []);
    expect(results).toHaveLength(0);
  });

  it("tied scores maintain stable order (alphabetical by programId)", () => {
    // Create two identical programs with different IDs
    const identicalPrograms = [
      { ...PROGRAM_PROFILES[0], id: "aaa-identical", name: "AAA" },
      { ...PROGRAM_PROFILES[0], id: "zzz-identical", name: "ZZZ" },
    ];
    const results = rankPrograms(ENGINEER_PROFILE, aptitudeVec, valuesVec, identicalPrograms);
    // Both have identical scores, but order should be deterministic
    expect(results).toHaveLength(2);
    expect(results[0].programId).toBe("aaa-identical");
  });
});
