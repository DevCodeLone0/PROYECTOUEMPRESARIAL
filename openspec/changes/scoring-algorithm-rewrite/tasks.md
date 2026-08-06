# Tasks: Scoring Algorithm Rewrite

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1300 additions + ~200 deletions |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Types + question bank foundation | PR 1 | N/A (no runtime behavior) | N/A | `src/lib/scoring/types.ts`, `src/lib/questions/` |
| 2 | RIASEC scoring engine + tests | PR 2 | `npx vitest run src/lib/__tests__/riasec.test.ts` | N/A (pure functions) | `src/lib/scoring/riasec.ts`, `src/lib/scoring/programs-matrix.ts`, tests |
| 3 | Modality + archetype modules + tests | PR 3 | `npx vitest run src/lib/__tests__/modality.test.ts src/lib/__tests__/archetypes.test.ts` | N/A (pure functions) | `src/lib/scoring/modality.ts`, `src/lib/scoring/archetypes.ts`, tests |
| 4 | Store + TestWizard wiring | PR 4 | Manual: complete test flow, verify layer transitions | Real scenario: run test wizard Q1-Q25 | `src/stores/test-store.ts`, `src/app/test/page.tsx` |
| 5 | Results UI + cleanup | PR 5 | Visual: load results page, verify radar/modality/gap | Real scenario: complete test → view results | `src/components/results/*`, `src/app/resultados/*`, old file deletion |

## Phase 1: Foundation — Types + Question Bank

- [x] T1 Create `src/lib/scoring/types.ts` with all shared types: `RIASECDimension`, `RIASECProfile`, `FitBreakdown`, `ScoringResult`, `ModalityResult`, `Archetype`, `Question` (extended with layer + riasecWeights), `ProgramProfile`
- [x] T2 Create `src/lib/questions/question-bank.ts` — 25 questions across 4 layers (12+5+5+3), each with `id`, `layer`, `dimension`, `type`, `text` (Spanish), `options` (Spanish), `riasecWeights` (Layer 1 only)
- [x] T3 Create `src/lib/scoring/programs-matrix.ts` — 12 program profiles with RIASEC vectors (6D), aptitude vectors (4D), values vectors (4D) from spec tables

## Phase 2: RIASEC Scoring Engine (TDD)

- [x] T4 Write `src/lib/__tests__/riasec.test.ts` — RED: failing tests for normalize, cosine, weighted scoring, fit breakdown, ranking, tiebreaking, edge cases (all-zero, all-max, missing answers)
- [x] T5 Create `src/lib/scoring/riasec.ts` — GREEN: implement `normalizeProfile()`, `cosineSimilarity()`, `computeFitBreakdown()`, `rankPrograms()`, `computeOverallScore()`
- [x] T6 Verify all riasec.test.ts tests pass

## Phase 3: Modality + Archetypes (TDD)

- [x] T7 Write `src/lib/__tests__/modality.test.ts` — RED: failing tests for direct signal, derived signal, confidence levels, explanation generation, missing answers default, modality doesn't affect ranking
- [x] T8 Create `src/lib/scoring/modality.ts` — GREEN: implement `computeDirectSignal()`, `computeDerivedSignal()`, `recommendModality()`, `generateExplanation()`
- [x] T9 Write `src/lib/__tests__/archetypes.test.ts` — RED: failing tests for 8 archetypes exist, dominant/secondary mapping, cosine fallback, tiebreaking, all profile vectors normalized
- [x] T10 Create `src/lib/scoring/archetypes.ts` — GREEN: implement `ARCHETYPES` array, `MAPPING_TABLE`, `determineArchetype()`, cosine fallback
- [x] T11 Verify all modality + archetypes tests pass

## Phase 4: Store + Wizard Integration

- [x] T12 Modify `src/stores/test-store.ts` — add layer tracking (`currentLayer: 1-4`), new answer format (`Record<string, number>`), RIASEC profile cache, migration logic (detect old `Q16` key → reset to step 0)
- [x] T13 Modify `src/app/test/page.tsx` (TestWizard) — 25-step wizard, layer transition screens between Q12→Q13, Q17→Q18, Q22→Q23, layer indicator component

## Phase 5: Results UI + Cleanup

- [ ] T14 Create `src/components/results/RadarChart.tsx` — recharts RadarChart wrapper, 6 RIASEC axes with Spanish labels, student profile fill + program overlay on hover
- [ ] T15 Create `src/components/results/ModalityCard.tsx` — presencial/virtual recommendation, confidence indicator (green/yellow/orange), Spanish explanation text, matching programs count
- [ ] T16 Create `src/components/results/GapAnalysis.tsx` — per-dimension student vs. requirement bars, gap indicators, Spanish suggestion text, expandable section
- [ ] T17 Modify `src/components/results/ProgramCard.tsx` — add fit breakdown (3 sub-scores), modality badge with "Recomendado" indicator, expanded top-3 / collapsed rest
- [ ] T18 Modify `src/app/resultados/page.tsx` — new `ResultsData` shape, wire radar chart + modality card + gap analysis + updated archetype card (no old scores)
- [ ] T19 Delete `src/lib/scoring.ts`, `src/lib/scoring-matrix.ts`, `src/lib/archetypes.ts` — old files replaced by `src/lib/scoring/` module
- [ ] T20 Final verification: full test flow Q1-Q25 → results page renders all new components
