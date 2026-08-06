# Design: Scoring Algorithm Rewrite

## Technical Approach

Replace the 15-question/4-dimension scoring engine with a 25-question/4-layer RIASEC-based system. Each layer produces an independent vector; cosine similarity between student vectors and per-program requirement vectors produces weighted fit scores. The existing `scoring.ts`, `scoring-matrix.ts`, and `archetypes.ts` are deleted and replaced with a `src/lib/scoring/` module containing four pure-function engines.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Scoring math | Cosine similarity | Dot product, Euclidean distance | Captures vector direction (interest shape) not magnitude; handles variable-length vectors; spec requirement |
| Question storage | Static TS modules | JSON files, database | Zero runtime cost, type-safe, no async loading; matches existing pattern in `test-store.ts` |
| State management | Extend Zustand store | New store, React context | Already used; persist middleware handles session recovery; migration is additive |
| Radar chart | recharts RadarChart | visx, d3, custom SVG | Zero cost, React 19 compatible, minimal bundle, spec requirement |
| Archetype mapping | Dominant/secondary pair + cosine fallback | Pure cosine, rule-based | Deterministic for clear profiles; graceful for ambiguous ones |

## Data Flow

```
Questions (25)
    │
    ▼
Answers: Record<string, number>
    │
    ├─ Layer 1 (Q1-Q12) ──► raw[6] ──► normalize[0,1] ──► riasecProfile[6]
    │
    ├─ Layer 2 (Q13-Q17) ──► aptitudeVector[4]
    │
    ├─ Layer 3 (Q18-Q22) ──► valuesVector[4]
    │
    └─ Layer 4 (Q23-Q25) ──► directSignal + derivedSignal ──► modality
                                │
    ┌───────────────────────────┘
    ▼
For each program (×12):
    cosine(riasecProfile, program.riasec) × 0.4
  + cosine(aptitudeVec,   program.aptitude) × 0.3
  + cosine(valuesVec,     program.values)   × 0.3
    = overallScore (0-100)
    │
    ├─► fitBreakdown: { personality, technical, lifestyle }
    │
    └─► sorted results ──► ResultsPage
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              RadarChart   ProgramCards   ModalityCard
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/scoring/riasec.ts` | Create | RIASEC profile generation, cosine similarity, weighted scoring, program matrix |
| `src/lib/scoring/modality.ts` | Create | Dual-signal modality recommendation with confidence |
| `src/lib/scoring/archetypes.ts` | Create | 8 Jung archetypes, dominant/secondary mapping, cosine fallback |
| `src/lib/scoring/types.ts` | Create | Shared types: RIASECProfile, FitBreakdown, ModalityResult, ScoringResult |
| `src/lib/scoring/programs-matrix.ts` | Create | 12×6 RIASEC + aptitude + values requirement vectors |
| `src/lib/questions/question-bank.ts` | Create | 25 questions with layer assignments and scoring weights |
| `src/lib/scoring.ts` | Delete | Replaced by scoring/riasec.ts |
| `src/lib/scoring-matrix.ts` | Delete | Replaced by scoring/programs-matrix.ts |
| `src/lib/archetypes.ts` | Delete | Replaced by scoring/archetypes.ts |
| `src/stores/test-store.ts` | Modify | Add layer tracking, RIASEC profile, new answer format, migration |
| `src/app/resultados/page.tsx` | Modify | New ResultsData shape, radar chart, modality card, gap analysis |
| `src/components/results/ProgramCard.tsx` | Modify | Add fit breakdown, modality badge, gap analysis expandable |
| `src/components/results/RadarChart.tsx` | Create | recharts RadarChart wrapper, 6 RIASEC axes |
| `src/components/results/ModalityCard.tsx` | Create | Presencial/virtual recommendation card |
| `src/components/results/GapAnalysis.tsx` | Create | Per-program dimension gap visualization |
| `src/components/test/TestWizard.tsx` | Modify | Layer transitions, 25-step wizard, layer indicator |
| `src/lib/__tests__/riasec.test.ts` | Create | RIASEC scoring unit tests |
| `src/lib/__tests__/modality.test.ts` | Create | Modality recommendation unit tests |
| `src/lib/__tests__/archetypes.test.ts` | Create | Archetype mapping unit tests |

## Interfaces

```typescript
// src/lib/scoring/types.ts
type RIASECDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
type RIASECProfile = Record<RIASECDimension, number>  // normalized [0,1]

interface FitBreakdown {
  personality: number   // Layer 1 cosine × 100
  technical: number     // Layer 2 cosine × 100
  lifestyle: number     // Layer 3 cosine × 100
}

interface ScoringResult {
  programId: string
  overallScore: number       // 0-100
  fitBreakdown: FitBreakdown
}

interface ModalityResult {
  recommendation: 'presencial' | 'virtual'
  confidence: 'high' | 'medium' | 'low'
  explanation: string
}

interface Archetype {
  id: string
  name: string
  emoji: string
  description: string
  whyDualModel: string
  riasecProfile: RIASECProfile  // ideal vector for cosine fallback
}
```

## Algorithms

### RIASEC Normalization
```
raw[d] = Σ (answer_weight[d] × question_weight) for Q1-Q12
maxPossible[d] = Σ (max_option_weight[d] × question_weight) for answered questions only
normalized[d] = clamp(raw[d] / maxPossible[d], 0, 1)
```

### Weighted Cosine Scoring
```
finalScore = 0.4 × cosine(student.riasec, program.riasec)
           + 0.3 × cosine(student.aptitude, program.aptitude)
           + 0.3 × cosine(student.values, program.values)
result = finalScore × 100
```

### Modality Decision
```
direct = weighted_score(Q23, Q24, Q25)   // primary signal
derived = lifestyle_correlation(Q18-Q22)  // secondary signal
modality = direct > 0 ? 'presencial' : 'virtual'
confidence = (sign(direct) == sign(derived)) ? 'high' : (direct != 0 ? 'medium' : 'low')
```

### Archetype Mapping
```
sorted = sort(riasecProfile, desc)
dominant = sorted[0].key, secondary = sorted[1].key
archetype = MAPPING_TABLE[dominant][secondary]
if (!archetype) → cosine_fallback(student.riasec, all_archetype_profiles)
```

## Unit Test Strategy

| Layer | What | Fixtures |
|-------|------|----------|
| RIASEC | Normalize, cosine, weighted score | All-zero vector → 0%; all-max → 100%; known partial → exact % |
| Modality | Direct/derived signals, confidence | Q23=Presencial+Q24=1 → presencial/high; Q23=none+Q24=3 → derived wins |
| Archetypes | Pair mapping, cosine fallback | R=0.9+I=0.8 → constructor; equal profile → cosine winner |
| Edge cases | Missing answers, tiebreaking | 0 answered → all 0; tied scores → alphabetical |

TDD order: RIASEC engine → modality → archetypes → integration with store.

## Implementation Order

1. **Types + question bank** (`types.ts`, `question-bank.ts`) — foundation
2. **RIASEC engine** (`riasec.ts`, `programs-matrix.ts`) — core scoring
3. **Unit tests for RIASEC** — validate before proceeding
4. **Modality advisor** (`modality.ts`) — independent module
5. **Unit tests for modality**
6. **Archetype mapper** (`archetypes.ts`) — depends on RIASEC types
7. **Unit tests for archetypes**
8. **Store update** (`test-store.ts`) — wire new answers + layer tracking
9. **TestWizard update** — layer transitions, 25 steps
10. **Results page** — radar chart, modality card, gap analysis, fit breakdown
11. **Delete old files** — scoring.ts, scoring-matrix.ts, archetypes.ts

## Migration

No database migration. In-flight sessions (old format answers in sessionStorage): detect `Q16` key → reset to step 0 with message "El test se actualizó, por favor comienza de nuevo." Previous results stored as flat percentages are preserved read-only.

## Open Questions

- [ ] Exact RIASEC weights per option need vocational expert validation (matrix is configurable post-deploy)
- [ ] recharts bundle impact — verify < 15KB gzipped addition
- [ ] Whether Q16 (free-text closure) is retained or dropped in new system
