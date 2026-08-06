# Proposal: Scoring Algorithm Rewrite

## Intent

The current vocational test engine (16 questions, 4 dimensions) produces flat percentage scores with no fit breakdown, zero modality awareness, and non-Jungian archetypes. Students receive a single number per program without understanding WHY it matches. The rewrite replaces the scoring backbone with a RIASEC-based multi-layer architecture that produces actionable, interpretable results.

## Scope

### In Scope
- 25-question layered architecture (RIASEC interests, aptitudes, values/lifestyle, modality)
- 6-coordinate RIASEC profile per student
- Weighted cosine similarity scoring (interest 0.4 + aptitude 0.3 + values 0.3)
- Per-program fit breakdown (technical/personality/lifestyle)
- Presencial/virtual modality recommendation with explanation
- Jung + professional archetype derivation from RIASEC profile
- Radar chart visualization (6 RIASEC dimensions)
- Gap analysis (skills to develop)
- Unit tests for scoring logic BEFORE algorithm changes

### Out of Scope
- Adaptive testing (CAT) — deferred
- New UI framework or design system changes
- Program catalog changes (12 programs stay)
- Admin panel modifications
- Database schema changes beyond scoring fields
- ML-based scoring (needs historical data)

## Capabilities

### New Capabilities
- `riasec-scoring`: 6-dimensional RIASEC profile generation, cosine similarity matching, fit breakdown computation
- `modality-recommendation`: Presencial/virtual axis derived from lifestyle values + direct questions

### Modified Capabilities
- `test-engine`: Question count 16→25, dimension structure 4→layered (4 layers), scoring algorithm replacement, archetype system swap
- `results-display`: Add radar chart, fit breakdown per program, modality card, gap analysis section

## Approach

4-layer question architecture producing independent scoring signals:
1. RIASEC Interests (12Q, 2 per dimension) → 6-coordinate vector
2. Aptitudes (5Q, behavioral scenarios) → aptitude vector
3. Values & Lifestyle (5Q) → values vector
3. Modality (3Q) → preference signal

Scoring: cosine similarity between student vector and per-program requirement vector, weighted by layer importance. Separate modality axis determines presencial/virtual recommendation. Archetypes derived from dominant RIASEC codes (e.g., R+I = El Constructor, E+C = El Estratega).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/scoring/` | New/Rewrite | RIASEC engine, cosine similarity, archetype mapper |
| `src/lib/questions/` | Rewrite | 25-question bank, 4-layer structure |
| `src/components/Results/` | Modified | Radar chart, fit breakdown, modality card, gap analysis |
| `src/app/test/` | Modified | Wizard adapts to 25 steps, layer transitions |
| `src/stores/test.ts` | Modified | Zustand store schema update for new answer format |
| `src/lib/__tests__/` | New | Scoring unit tests (TDD) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| RIASEC weights need expert validation | High | Configurable matrix, easy to tune post-deploy |
| 25Q increases drop-off rate | Medium | Progress bar + gamification per layer |
| Cosine similarity unfamiliar to users | Low | Explain as "fit percentage", not raw math |
| Backward compat with existing test data | Medium | Migration script for in-flight sessions |

## Rollback Plan

Revert to previous scoring engine via git. Old question bank preserved in version control. In-flight sessions: reset to question 1 if schema mismatch detected. No data loss — previous results stored as flat percentages.

## Dependencies

- RIASEC dimension definitions validated by vocational guidance expert
- Per-program requirement vectors (12 programs × 6 RIASEC dimensions) from user
- Radar chart library (recharts or visx — zero cost)

## Success Criteria

- [ ] 25 questions render correctly across all 4 layers
- [ ] RIASEC profile produces 6 normalized coordinates (0-1)
- [ ] Cosine similarity produces distinct rankings vs. old algorithm
- [ ] Radar chart renders with 6 dimensions
- [ ] Modality recommendation differs from presencial/virtual program counts
- [ ] Fit breakdown shows technical/personality/lifestyle scores per program
- [ ] All scoring unit tests pass
- [ ] Test completion time remains under 5 minutes
