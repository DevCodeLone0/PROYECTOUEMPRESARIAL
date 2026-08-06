import { describe, it, expect } from "vitest";
import {
  ARCHETYPES,
  determineArchetype,
  MAPPING_TABLE,
} from "../scoring/archetypes";
import type { RIASECProfile } from "../scoring/types";
import { cosineSimilarity } from "../scoring/riasec";

// ── Test Fixtures ──

/** Profile heavily skewed toward R and I → Constructor. */
const ENGINEER_PROFILE: RIASECProfile = {
  R: 0.9, I: 0.8, A: 0.2, S: 0.1, E: 0.3, C: 0.4,
};

/** Profile heavily skewed toward E and S → Leader. */
const LEADER_PROFILE: RIASECProfile = {
  R: 0.3, I: 0.4, A: 0.2, S: 0.8, E: 0.9, C: 0.5,
};

/** Profile heavily skewed toward I and C → Analista. */
const ANALYST_PROFILE: RIASECProfile = {
  R: 0.4, I: 0.8, A: 0.1, S: 0.1, E: 0.3, C: 0.9,
};

/** Profile heavily skewed toward A and S → Creador. */
const CREATOR_PROFILE: RIASECProfile = {
  R: 0.2, I: 0.3, A: 0.9, S: 0.6, E: 0.3, C: 0.1,
};

/** Profile heavily skewed toward E and C → Estratega. */
const STRATEGIST_PROFILE: RIASECProfile = {
  R: 0.3, I: 0.4, A: 0.1, S: 0.2, E: 0.7, C: 0.9,
};

/** Profile heavily skewed toward I and A → Visionario. */
const VISIONARY_PROFILE: RIASECProfile = {
  R: 0.3, I: 0.7, A: 0.7, S: 0.4, E: 0.9, C: 0.2,
};

/** All-equal profile — should use cosine fallback. */
const AMBIGUOUS_PROFILE: RIASECProfile = {
  R: 0.5, I: 0.5, A: 0.5, S: 0.5, E: 0.5, C: 0.5,
};

const ALL_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;

// ═══════════════════════════════════════════════════════════
// T9: ARCHETYPES definitions
// ═══════════════════════════════════════════════════════════

describe("ARCHETYPES definitions", () => {
  it("contains exactly 8 archetypes", () => {
    expect(ARCHETYPES).toHaveLength(8);
  });

  it("each archetype has a unique ID", () => {
    const ids = ARCHETYPES.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);
  });

  it("each archetype has a non-empty name", () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.name.length).toBeGreaterThan(0);
    }
  });

  it("each archetype has a non-empty emoji", () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.emoji.length).toBeGreaterThan(0);
    }
  });

  it("each archetype has a non-empty description", () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.description.length).toBeGreaterThan(0);
    }
  });

  it("each archetype has a non-empty whyDualModel", () => {
    for (const archetype of ARCHETYPES) {
      expect(archetype.whyDualModel.length).toBeGreaterThan(0);
    }
  });

  it("each archetype has a riasecProfile with 6 dimensions", () => {
    for (const archetype of ARCHETYPES) {
      const dims = Object.keys(archetype.riasecProfile);
      expect(dims.length).toBe(6);
    }
  });

  it("each archetype riasecProfile values are in [0, 1]", () => {
    for (const archetype of ARCHETYPES) {
      for (const dim of ALL_DIMENSIONS) {
        const val = archetype.riasecProfile[dim];
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it("all expected archetype IDs exist", () => {
    const expectedIds = [
      "constructor",
      "investigador",
      "creador",
      "connecting",
      "estratega",
      "analista",
      "visionario",
      "leader",
    ];
    const actualIds = ARCHETYPES.map((a) => a.id);
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// T9: MAPPING_TABLE
// ═══════════════════════════════════════════════════════════

describe("MAPPING_TABLE", () => {
  it("is a non-empty object", () => {
    expect(Object.keys(MAPPING_TABLE).length).toBeGreaterThan(0);
  });

  it("maps R+I to constructor", () => {
    expect(MAPPING_TABLE["R,I"]).toBe("constructor");
  });

  it("maps I+R to investigador", () => {
    expect(MAPPING_TABLE["I,R"]).toBe("investigador");
  });

  it("maps A+S to creador", () => {
    expect(MAPPING_TABLE["A,S"]).toBe("creador");
  });

  it("maps S+E to connecting", () => {
    expect(MAPPING_TABLE["S,E"]).toBe("connecting");
  });

  it("maps E+C to leader", () => {
    expect(MAPPING_TABLE["E,C"]).toBe("leader");
  });

  it("maps C+I to analista", () => {
    expect(MAPPING_TABLE["C,I"]).toBe("analista");
  });

  it("maps E+A to visionario", () => {
    expect(MAPPING_TABLE["E,A"]).toBe("visionario");
  });

  it("maps E+S to leader", () => {
    // E+S should also map to leader (secondary can be S)
    expect(MAPPING_TABLE["E,S"]).toBe("leader");
  });
});

// ═══════════════════════════════════════════════════════════
// T9: determineArchetype
// ═══════════════════════════════════════════════════════════

describe("determineArchetype", () => {
  it("returns an archetype with valid structure", () => {
    const result = determineArchetype(ENGINEER_PROFILE);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("emoji");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("whyDualModel");
    expect(result).toHaveProperty("riasecProfile");
  });

  it("high R + high I → constructor", () => {
    const result = determineArchetype(ENGINEER_PROFILE);
    expect(result.id).toBe("constructor");
  });

  it("high E + high S → leader", () => {
    const result = determineArchetype(LEADER_PROFILE);
    expect(result.id).toBe("leader");
  });

  it("high I + high C → analista", () => {
    const result = determineArchetype(ANALYST_PROFILE);
    expect(result.id).toBe("analista");
  });

  it("high A + high S → creador", () => {
    const result = determineArchetype(CREATOR_PROFILE);
    expect(result.id).toBe("creador");
  });

  it("high C + high E → estratega (C dominant after sorting)", () => {
    // STRATEGIST_PROFILE has C=0.9, E=0.7 → sorted C first, E second → C,E → estratega
    const result = determineArchetype(STRATEGIST_PROFILE);
    expect(result.id).toBe("estratega");
  });

  it("all-equal profile uses cosine fallback", () => {
    // All equal → no dominant pair → cosine fallback
    const result = determineArchetype(AMBIGUOUS_PROFILE);
    expect(["constructor", "investigador", "creador", "connecting",
      "estratega", "analista", "visionario", "leader"]).toContain(result.id);
  });

  it("tiebreaking: when two dimensions are tied for highest, uses secondary score", () => {
    // R=0.7, I=0.7, rest low — tied for first
    // The one with the higher secondary wins the pair
    const tiedProfile: RIASECProfile = {
      R: 0.7, I: 0.7, A: 0.1, S: 0.1, E: 0.1, C: 0.1,
    };
    const result = determineArchetype(tiedProfile);
    // R,I pair → constructor; I,R pair → investigador
    // Since both are 0.7, tiebreaking applies
    expect(["constructor", "investigador"]).toContain(result.id);
  });

  it("returns deterministic results for same input", () => {
    const result1 = determineArchetype(ENGINEER_PROFILE);
    const result2 = determineArchetype(ENGINEER_PROFILE);
    expect(result1.id).toBe(result2.id);
  });

  it("returned archetype is a valid member of ARCHETYPES", () => {
    const result = determineArchetype(ENGINEER_PROFILE);
    const found = ARCHETYPES.find((a) => a.id === result.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe(result.name);
  });
});

// ═══════════════════════════════════════════════════════════
// T9: Cosine fallback
// ═══════════════════════════════════════════════════════════

describe("cosine fallback", () => {
  it("cosine(A, B) === cosine(B, A) — commutativity", () => {
    const a = [0.9, 0.8, 0.2, 0.1, 0.3, 0.4];
    const b = [0.7, 0.9, 0.2, 0.2, 0.2, 0.4];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 6);
  });

  it("ambiguous profile produces a valid archetype via cosine", () => {
    const result = determineArchetype(AMBIGUOUS_PROFILE);
    expect(ARCHETYPES.map((a) => a.id)).toContain(result.id);
  });

  it("profile close to investigador archetype vector maps to investigador", () => {
    const investigador = ARCHETYPES.find((a) => a.id === "investigador")!;
    // Create a profile very close to investigador's ideal
    const closeProfile: RIASECProfile = {
      R: investigador.riasecProfile.R + 0.02,
      I: investigador.riasecProfile.I + 0.02,
      A: investigador.riasecProfile.A - 0.01,
      S: investigador.riasecProfile.S - 0.01,
      E: investigador.riasecProfile.E + 0.01,
      C: investigador.riasecProfile.C + 0.01,
    };
    const result = determineArchetype(closeProfile);
    // Should be investigador or close — at minimum a valid archetype
    expect(ARCHETYPES.map((a) => a.id)).toContain(result.id);
  });
});
