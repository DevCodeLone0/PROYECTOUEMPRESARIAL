# RIASEC Scoring Specification

## Purpose

6-dimensional RIASEC profile generation, cosine similarity matching against per-program requirement vectors, and per-program fit breakdown computation.

## Requirements

### Requirement: RIASEC Dimension Definitions

The system SHALL define 6 RIASEC dimensions: Realistic (R), Investigative (I), Artistic (A), Social (S), Enterprising (E), Conventional (C).

Each dimension MUST have:
- A unique ID (`R`, `I`, `A`, `S`, `E`, `C`)
- A Spanish name and 1-sentence definition
- A canonical vector direction in the 6D space

#### Scenario: Dimension metadata is complete

- GIVEN the scoring engine initializes
- WHEN dimensions are loaded
- THEN all 6 dimensions exist with id, name, definition
- AND no dimension ID is duplicated

### Requirement: Question-to-Dimension Mapping

Each Layer 1 question (Q1-Q12) MUST map to exactly 2 RIASEC dimensions with configurable weights. A single answer can contribute to both dimensions proportionally.

The mapping table:

| Question | Primary (0.7) | Secondary (0.3) |
|----------|---------------|-----------------|
| Q1-Q2    | R, I, A, S, E, C (per option) | — |
| Q3-Q4    | Same | Same |
| Q5-Q6    | R, I, A, S, E, C (per option) | — |
| Q7-Q8    | Same | Same |
| Q9-Q10   | R, I, A, S, E, C (per option) | — |
| Q11-Q12  | Same | Same |

Each option index (0-4) on a question contributes a specific RIASEC weight. The system MUST use a `QUESTION_RIASEC_WEIGHTS` matrix: `Record<questionId, Record<dimension, number>>`.

#### Scenario: Option 0 on Q1 contributes to R dimension

- GIVEN question Q1 with option index 0 ("Crear soluciones tecnológicas")
- WHEN the scoring engine processes this answer
- THEN the R dimension receives a weight contribution from Q1
- AND the contribution is proportional to the configured weight for that option-dimension pair

#### Scenario: Every option has non-zero contribution to at least one dimension

- GIVEN any question Q1-Q12 with any option index 0-4
- WHEN weights are looked up in `QUESTION_RIASEC_WEIGHTS`
- THEN at least one dimension has a non-zero weight for that option

### Requirement: Raw Vector Accumulation

The system SHALL accumulate a raw 6-element vector from Layer 1 answers. Each dimension's raw value is the sum of weighted contributions from all questions mapped to it.

```
raw[R] = sum(option_weight[R] for each answered Q in Layer 1)
```

#### Scenario: All 12 Layer 1 questions answered

- GIVEN answers for Q1-Q12 exist
- WHEN raw vector is computed
- THEN the vector has exactly 6 elements
- AND each element is > 0

#### Scenario: Some Layer 1 questions missing

- GIVEN answers for Q1-Q8 exist but Q9-Q12 are missing
- WHEN raw vector is computed
- THEN missing questions contribute 0 to their mapped dimensions
- AND the vector is still 6 elements

### Requirement: Normalization to 0-1

The system SHALL normalize each RIASEC dimension independently to the range [0, 1].

Formula: `normalized[d] = raw[d] / maxPossible[d]`

Where `maxPossible[d]` is the sum of maximum possible weights for dimension `d` across all 12 questions (assuming the highest-weight option per question).

Clamp: `Math.min(Math.max(normalized[d], 0), 1)`

#### Scenario: Perfect alignment yields 1.0

- GIVEN a student whose answers maximize every dimension
- WHEN normalization runs
- THEN at least one dimension = 1.0

#### Scenario: All zeros yields 0.0

- GIVEN a student with all Layer 1 answers missing
- WHEN normalization runs
- THEN all 6 dimensions = 0.0

### Requirement: Per-Program RIASEC Requirement Profiles

The system SHALL store a 6-element RIASEC requirement vector for each of the 12 programs. Each value is in [0, 1].

Programs:
| Program ID | R | I | A | S | E | C |
|------------|---|---|---|---|---|---|
| ing-software | 0.9 | 0.8 | 0.2 | 0.1 | 0.3 | 0.4 |
| negocios-turisticos | 0.2 | 0.2 | 0.4 | 0.9 | 0.7 | 0.3 |
| admin-empresas | 0.3 | 0.4 | 0.2 | 0.5 | 0.9 | 0.7 |
| negocios-internacionales | 0.2 | 0.3 | 0.3 | 0.8 | 0.8 | 0.5 |
| finanzas | 0.4 | 0.7 | 0.1 | 0.2 | 0.5 | 0.9 |
| ing-industrial | 0.8 | 0.7 | 0.2 | 0.3 | 0.4 | 0.8 |
| marketing | 0.3 | 0.3 | 0.9 | 0.6 | 0.7 | 0.3 |
| ing-software-virtual | 0.9 | 0.8 | 0.2 | 0.1 | 0.3 | 0.4 |
| admin-empresas-virtual | 0.3 | 0.4 | 0.2 | 0.5 | 0.9 | 0.7 |
| negocios-turisticos-virtual | 0.2 | 0.2 | 0.4 | 0.9 | 0.7 | 0.3 |
| ing-industrial-virtual | 0.8 | 0.7 | 0.2 | 0.3 | 0.4 | 0.8 |
| marketing-virtual | 0.3 | 0.3 | 0.9 | 0.6 | 0.7 | 0.3 |

#### Scenario: All 12 programs have profiles

- GIVEN the program profile matrix is loaded
- WHEN scoring begins
- THEN every program ID from the programs catalog has a 6-element vector
- AND all values are in [0, 1]

### Requirement: Weighted Cosine Similarity

The system SHALL compute program match as weighted cosine similarity across 3 layers:

```
finalScore = w_interest * cosine(student_interest, program_riasec)
           + w_aptitude * cosine(student_aptitude, program_aptitude)
           + w_values   * cosine(student_values, program_values)
```

Weights: `w_interest = 0.4`, `w_aptitude = 0.3`, `w_values = 0.3`.

Cosine similarity formula:
```
cosine(a, b) = (a · b) / (||a|| * ||b||)
```

Result is in [0, 1], multiplied by 100 for display as percentage.

#### Scenario: Perfect match yields 100%

- GIVEN a student whose RIASEC, aptitude, and values vectors are identical to a program's vectors
- WHEN cosine similarity is computed per layer
- THEN each layer cosine = 1.0
- AND final score = 100%

#### Scenario: Zero vectors yield 0%

- GIVEN a student with all zero vectors (no answers)
- WHEN cosine similarity is computed
- THEN the result is 0 (denominator is 0, handled as special case)

#### Scenario: Partial match produces intermediate score

- GIVEN a student with RIASEC vector [0.8, 0.6, 0.2, 0.1, 0.3, 0.4]
- AND a program with RIASEC vector [0.9, 0.8, 0.2, 0.1, 0.3, 0.4]
- WHEN cosine similarity is computed
- THEN the RIASEC layer score is between 0.9 and 1.0
- AND the final score reflects the weighted combination

### Requirement: Fit Breakdown Computation

The system SHALL produce 3 sub-scores per program:

1. **Technical fit** (0-100): Cosine similarity of Layer 2 (aptitudes) vectors only
2. **Personality fit** (0-100): Cosine similarity of Layer 1 (RIASEC) vectors only
3. **Lifestyle fit** (0-100): Cosine similarity of Layer 3 (values) vectors only

The overall score is the weighted combination. The breakdown explains WHICH layer drives the match.

#### Scenario: Program with high technical fit but low lifestyle

- GIVEN a student with strong aptitudes but weak value alignment
- WHEN fit breakdown is computed for a technical program
- THEN technical fit > 70
- AND lifestyle fit < 40
- AND overall score is between the two

#### Scenario: Breakdown values are independent

- GIVEN any student-program pair
- WHEN fit breakdown is computed
- THEN technical fit + personality fit + lifestyle fit is NOT required to sum to anything specific
- AND each is independently in [0, 100]

### Requirement: Ranking and Tiebreaking

The system SHALL sort programs by final score descending. When two programs have the same score (within 0.5%), sort alphabetically by program name.

#### Scenario: Clear ranking

- GIVEN programs with scores 92, 87, 85, 80
- WHEN results are sorted
- THEN order is 92, 87, 85, 80

#### Scenario: Tiebreaking

- GIVEN programs A and B both scoring 85.0
- WHEN results are sorted
- THEN A appears before B if A's name is alphabetically earlier

### Requirement: Edge Case Handling

The system MUST handle:
1. **All zeros**: Student with no Layer 1 answers → all RIASEC = 0, cosine = 0 for all programs
2. **All max**: Student maximizing every dimension → highest scores for programs with broad requirements
3. **Ties**: Handled by alphabetical tiebreak (see Ranking requirement)
4. **Missing answers**: Missing questions contribute 0 to their dimensions; normalization uses actual max (not theoretical)

#### Scenario: Missing answers reduce max possible

- GIVEN a student missing Q1-Q3
- WHEN normalization runs
- THEN maxPossible[d] excludes contributions from Q1-Q3
- AND the student can still reach 1.0 on dimensions not affected by Q1-Q3

## Acceptance Criteria

1. RIASEC profile produces exactly 6 normalized coordinates in [0, 1]
2. Cosine similarity is commutative: `cosine(A, B) == cosine(B, A)`
3. Final scores range from 0 to 100
4. All 12 programs have distinct requirement vectors
5. Fit breakdown sub-scores are independently computable
6. Missing answers produce graceful degradation, not crashes
7. All scoring logic is unit-testable with no UI dependencies
