import { describe, it, expect } from "vitest";
import {
  computeDirectSignal,
  computeDerivedSignal,
  recommendModality,
  generateExplanation,
} from "../scoring/modality";
import type { RIASECProfile } from "../scoring/types";

// ── Test Fixtures ──

/** Standard RIASEC profile — independent learner (high I, low S). */
const INDEPENDENT_PROFILE: RIASECProfile = {
  R: 0.3,
  I: 0.9,
  A: 0.4,
  S: 0.1,
  E: 0.2,
  C: 0.5,
};

/** Social learner profile (high S, high E). */
const SOCIAL_PROFILE: RIASECProfile = {
  R: 0.2,
  I: 0.3,
  A: 0.4,
  S: 0.8,
  E: 0.7,
  C: 0.3,
};

// ═══════════════════════════════════════════════════════════
// T7: computeDirectSignal
// ═══════════════════════════════════════════════════════════

describe("computeDirectSignal", () => {
  it("returns a score object with presencial and virtual components", () => {
    const result = computeDirectSignal({});
    expect(result).toHaveProperty("presencial");
    expect(result).toHaveProperty("virtual");
    expect(typeof result.presencial).toBe("number");
    expect(typeof result.virtual).toBe("number");
  });

  it("returns zeros when all Layer 4 answers are missing", () => {
    const result = computeDirectSignal({});
    expect(result.presencial).toBe(0);
    expect(result.virtual).toBe(0);
  });

  it("strong presencial preference from Q23", () => {
    // Q23 option 0 = "Presencial" → presencial +2*0.5 = 1.0
    const result = computeDirectSignal({ Q23: 0 });
    expect(result.presencial).toBeGreaterThan(result.virtual);
    expect(result.presencial).toBeGreaterThanOrEqual(1.0);
  });

  it("strong virtual preference from Q23", () => {
    // Q23 option 1 = "Virtual" → virtual +2*0.5 = 1.0
    const result = computeDirectSignal({ Q23: 1 });
    expect(result.virtual).toBeGreaterThan(result.presencial);
    expect(result.virtual).toBeGreaterThanOrEqual(1.0);
  });

  it("Q23 no preference adds nothing", () => {
    // Q23 option 2 = "No tengo preferencia" → 0
    const result = computeDirectSignal({ Q23: 2 });
    expect(result.presencial).toBe(0);
    expect(result.virtual).toBe(0);
  });

  it("Q24 low comfort (1-2) pushes toward presencial", () => {
    // Q24 option 0 or 1 → presencial +1 * 0.3 = 0.3
    const resultLow = computeDirectSignal({ Q24: 0 });
    const resultLow2 = computeDirectSignal({ Q24: 1 });
    expect(resultLow.presencial).toBeGreaterThan(0);
    expect(resultLow2.presencial).toBeGreaterThan(0);
  });

  it("Q24 neutral (2) adds nothing", () => {
    // Q24 option 2 = "Neutral" → 0
    const result = computeDirectSignal({ Q24: 2 });
    expect(result.presencial).toBe(0);
    expect(result.virtual).toBe(0);
  });

  it("Q24 high comfort (3-4) pushes toward virtual", () => {
    // Q24 option 3 or 4 → virtual +1 * 0.3 = 0.3
    const resultHigh = computeDirectSignal({ Q24: 3 });
    const resultHigh2 = computeDirectSignal({ Q24: 4 });
    expect(resultHigh.virtual).toBeGreaterThan(0);
    expect(resultHigh2.virtual).toBeGreaterThan(0);
  });

  it("Q25 no access pushes toward presencial", () => {
    // Q25 option 1 = "No tengo internet estable" → presencial +1 * 0.2 = 0.2
    const result = computeDirectSignal({ Q25: 1 });
    expect(result.presencial).toBeGreaterThan(0);
  });

  it("Q25 full access pushes toward virtual", () => {
    // Q25 option 0 = "Sí, tengo todo" → virtual +0.5 * 0.2 = 0.1
    const result = computeDirectSignal({ Q25: 0 });
    expect(result.virtual).toBeGreaterThan(0);
  });

  it("combines Q23 + Q24 + Q25 weights correctly", () => {
    // Q23=0 (presencial +2*0.5=1.0), Q24=0 (presencial +1*0.3=0.3), Q25=1 (presencial +1*0.2=0.2)
    const result = computeDirectSignal({ Q23: 0, Q24: 0, Q25: 1 });
    expect(result.presencial).toBeCloseTo(1.5, 1);
    expect(result.virtual).toBe(0);
  });

  it("virtual answers combine correctly", () => {
    // Q23=1 (virtual +2*0.5=1.0), Q24=4 (virtual +1*0.3=0.3), Q25=0 (virtual +0.5*0.2=0.1)
    const result = computeDirectSignal({ Q23: 1, Q24: 4, Q25: 0 });
    expect(result.virtual).toBeCloseTo(1.4, 1);
    expect(result.presencial).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// T7: computeDerivedSignal
// ═══════════════════════════════════════════════════════════

describe("computeDerivedSignal", () => {
  it("returns a score object with presencial and virtual components", () => {
    const result = computeDerivedSignal({}, INDEPENDENT_PROFILE);
    expect(result).toHaveProperty("presencial");
    expect(result).toHaveProperty("virtual");
  });

  it("returns zeros when no lifestyle answers provided and neutral RIASEC", () => {
    // Use a neutral RIASEC profile (I < 0.7, S < 0.7) so RIASEC secondary signal is zero
    const neutralProfile: RIASECProfile = {
      R: 0.3, I: 0.5, A: 0.3, S: 0.4, E: 0.3, C: 0.3,
    };
    const result = computeDerivedSignal({}, neutralProfile);
    expect(result.presencial).toBe(0);
    expect(result.virtual).toBe(0);
  });

  it("independent learner profile with solo work style → virtual", () => {
    // Q19 option 0 = "Solo y concentrado" → virtual indicator
    const result = computeDerivedSignal({ Q19: 0 }, INDEPENDENT_PROFILE);
    expect(result.virtual).toBeGreaterThan(result.presencial);
  });

  it("social learner profile with group work style → presencial", () => {
    // Q19 option 1 = "En equipo pequeño" → presencial indicator
    const result = computeDerivedSignal({ Q19: 1 }, SOCIAL_PROFILE);
    expect(result.presencial).toBeGreaterThan(result.virtual);
  });

  it("Q19 leading a group → presencial", () => {
    // Q19 option 2 = "Liderando un grupo" → presencial
    const result = computeDerivedSignal({ Q19: 2 }, SOCIAL_PROFILE);
    expect(result.presencial).toBeGreaterThan(0);
  });

  it("Q19 with clients → presencial", () => {
    // Q19 option 3 = "Con clientes directamente" → presencial
    const result = computeDerivedSignal({ Q19: 3 }, SOCIAL_PROFILE);
    expect(result.presencial).toBeGreaterThan(0);
  });

  it("Q21 schedule flexibility (binary) influences derived signal", () => {
    // Q21 option 1 = "Flexibilidad total" → virtual indicator
    const resultFlex = computeDerivedSignal({ Q21: 1 }, INDEPENDENT_PROFILE);
    // Q21 option 0 = "Horario fijo" → presencial indicator
    const resultFixed = computeDerivedSignal({ Q21: 0 }, INDEPENDENT_PROFILE);
    expect(resultFlex.virtual).toBeGreaterThanOrEqual(resultFixed.virtual);
  });

  it("multiple lifestyle signals combine", () => {
    // Solo work + flexibility → strong virtual
    const result = computeDerivedSignal(
      { Q19: 0, Q21: 1 },
      INDEPENDENT_PROFILE
    );
    expect(result.virtual).toBeGreaterThan(result.presencial);
  });
});

// ═══════════════════════════════════════════════════════════
// T7: recommendModality
// ═══════════════════════════════════════════════════════════

describe("recommendModality", () => {
  it("returns ModalityResult with recommendation, confidence, explanation", () => {
    const result = recommendModality(
      { presencial: 1.5, virtual: 0 },
      { presencial: 0.5, virtual: 0 }
    );
    expect(result).toHaveProperty("recommendation");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("explanation");
    expect(["presencial", "virtual"]).toContain(result.recommendation);
    expect(["high", "medium", "low"]).toContain(result.confidence);
  });

  it("both signals agree presencial → high confidence", () => {
    const result = recommendModality(
      { presencial: 1.5, virtual: 0 },
      { presencial: 1.0, virtual: 0 }
    );
    expect(result.recommendation).toBe("presencial");
    expect(result.confidence).toBe("high");
  });

  it("both signals agree virtual → high confidence", () => {
    const result = recommendModality(
      { presencial: 0, virtual: 1.5 },
      { presencial: 0, virtual: 1.0 }
    );
    expect(result.recommendation).toBe("virtual");
    expect(result.confidence).toBe("high");
  });

  it("direct presencial + derived virtual → low confidence", () => {
    const result = recommendModality(
      { presencial: 1.5, virtual: 0 },
      { presencial: 0, virtual: 1.0 }
    );
    expect(result.recommendation).toBe("presencial"); // direct wins
    expect(result.confidence).toBe("low");
  });

  it("direct virtual + derived presencial → low confidence", () => {
    const result = recommendModality(
      { presencial: 0, virtual: 1.5 },
      { presencial: 1.0, virtual: 0 }
    );
    expect(result.recommendation).toBe("virtual"); // direct wins
    expect(result.confidence).toBe("low");
  });

  it("direct presencial + neutral derived → medium confidence", () => {
    const result = recommendModality(
      { presencial: 1.5, virtual: 0 },
      { presencial: 0.3, virtual: 0.2 } // difference < 1.0 → neutral
    );
    expect(result.recommendation).toBe("presencial");
    expect(result.confidence).toBe("medium");
  });

  it("neutral direct + presencial derived → medium confidence", () => {
    const result = recommendModality(
      { presencial: 0.2, virtual: 0.1 }, // difference < 1.0 → neutral direct
      { presencial: 1.0, virtual: 0 }
    );
    expect(result.recommendation).toBe("presencial");
    expect(result.confidence).toBe("medium");
  });

  it("neutral direct + neutral derived → medium confidence, defaults to presencial", () => {
    const result = recommendModality(
      { presencial: 0.1, virtual: 0.05 },
      { presencial: 0.1, virtual: 0.05 }
    );
    expect(result.confidence).toBe("medium");
    expect(["presencial", "virtual"]).toContain(result.recommendation);
  });

  it("direct always wins over derived when they conflict", () => {
    const result = recommendModality(
      { presencial: 0, virtual: 2.0 },
      { presencial: 3.0, virtual: 0 }
    );
    expect(result.recommendation).toBe("virtual");
  });

  it("all-zero signals produce low confidence (no evidence either way)", () => {
    const result = recommendModality(
      { presencial: 0, virtual: 0 },
      { presencial: 0, virtual: 0 }
    );
    expect(result.confidence).toBe("low");
    // Still defaults to presencial
    expect(result.recommendation).toBe("presencial");
  });

  it("neutral-direction signals WITH accumulated scores still produce medium confidence", () => {
    // Both signals have some accumulated score, but direction is neutral (diff < 1.0).
    // This is different from "no evidence" — the student gave weak signals on both sides.
    const result = recommendModality(
      { presencial: 0.4, virtual: 0.35 },
      { presencial: 0.3, virtual: 0.25 }
    );
    expect(result.confidence).toBe("medium");
  });
});

// ═══════════════════════════════════════════════════════════
// T7: generateExplanation
// ═══════════════════════════════════════════════════════════

describe("generateExplanation", () => {
  it("returns a non-empty string", () => {
    const explanation = generateExplanation(
      "presencial",
      "high",
      { presencial: 1.5, virtual: 0 },
      { presencial: 1.0, virtual: 0 }
    );
    expect(typeof explanation).toBe("string");
    expect(explanation.length).toBeGreaterThan(0);
  });

  it("high confidence explanation mentions both signals", () => {
    const explanation = generateExplanation(
      "presencial",
      "high",
      { presencial: 1.5, virtual: 0 },
      { presencial: 1.0, virtual: 0 }
    );
    // Should mention both preference and lifestyle alignment
    expect(explanation.toLowerCase()).toContain("presencial");
  });

  it("low confidence includes caveat about exploring options", () => {
    const explanation = generateExplanation(
      "virtual",
      "low",
      { presencial: 0, virtual: 1.5 },
      { presencial: 1.0, virtual: 0 }
    );
    // Should mention exploring or considering both options
    const hasCaveat =
      explanation.toLowerCase().includes("explorar") ||
      explanation.toLowerCase().includes("considera") ||
      explanation.toLowerCase().includes("ambas");
    expect(hasCaveat).toBe(true);
  });

  it("explanation is in Spanish", () => {
    const explanation = generateExplanation(
      "presencial",
      "high",
      { presencial: 1.5, virtual: 0 },
      { presencial: 1.0, virtual: 0 }
    );
    // Contains Spanish markers: accented characters or Spanish words
    const hasSpanish =
      /[áéíóúñ]/.test(explanation) ||
      explanation.includes("la ") ||
      explanation.includes("el ") ||
      explanation.includes("que ");
    expect(hasSpanish).toBe(true);
  });

  it("low confidence does not use definitive language like 'debes'", () => {
    const explanation = generateExplanation(
      "virtual",
      "low",
      { presencial: 0, virtual: 1.5 },
      { presencial: 1.0, virtual: 0 }
    );
    expect(explanation.toLowerCase()).not.toContain("debes");
  });

  it("low confidence with no signals mentions 'no detectamos' or 'no identificamos' (no-evidence path)", () => {
    const explanation = generateExplanation(
      "presencial",
      "low",
      { presencial: 0, virtual: 0 },
      { presencial: 0, virtual: 0 }
    );
    const hasNoEvidence =
      explanation.toLowerCase().includes("no detectamos") ||
      explanation.toLowerCase().includes("no identificamos");
    expect(hasNoEvidence).toBe(true);
  });

  it("low confidence with conflicting signals mentions 'explorar' or 'considera' (conflict path)", () => {
    const explanation = generateExplanation(
      "virtual",
      "low",
      { presencial: 0, virtual: 1.5 },
      { presencial: 1.0, virtual: 0 }
    );
    const hasCaveat =
      explanation.toLowerCase().includes("explorar") ||
      explanation.toLowerCase().includes("considera") ||
      explanation.toLowerCase().includes("ambas");
    expect(hasCaveat).toBe(true);
  });

  it("medium confidence explanation is present", () => {
    const explanation = generateExplanation(
      "presencial",
      "medium",
      { presencial: 1.0, virtual: 0 },
      { presencial: 0.3, virtual: 0.2 }
    );
    expect(explanation.length).toBeGreaterThan(0);
    expect(explanation.toLowerCase()).toContain("presencial");
  });
});
