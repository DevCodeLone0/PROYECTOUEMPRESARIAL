# Modality Recommendation Specification

## Purpose

Determine whether a student should study presencial or virtual based on direct questions, lifestyle values, and access constraints.

## Requirements

### Requirement: Dual-Signal Architecture

The system SHALL compute modality from two independent signals:

1. **Direct signal** (Layer 4, Q23-Q25): Explicit preference and access
2. **Derived signal** (Layer 3, Q18-Q22): Lifestyle values that correlate with modality preference

The final recommendation combines both signals with confidence scoring.

#### Scenario: Both signals agree on presencial

- GIVEN direct signal = "presencial" and derived signal = "presencial"
- WHEN recommendation is computed
- THEN modality = "presencial"
- AND confidence = "high"

#### Scenario: Signals disagree

- GIVEN direct signal = "virtual" and derived signal = "presencial"
- WHEN recommendation is computed
- THEN modality = "virtual" (direct wins)
- AND confidence = "low"

### Requirement: Direct Signal Computation

The direct signal is derived from Layer 4 questions:

| Question | Contribution | Weight |
|----------|-------------|--------|
| Q23 (preference) | Primary: "presencial" = +2 presencial, "virtual" = +2 virtual, "no preference" = 0 | 0.5 |
| Q24 (comfort online) | Score 1-5: 1-2 = +1 presencial, 3 = 0, 4-5 = +1 virtual | 0.3 |
| Q25 (access) | "Sí" = +0.5 virtual, "No internet" = +1 presencial, "No space" = +0.5 presencial, "No ambos" = +1 presencial | 0.2 |

Final direct score: `presencial_direct - virtual_direct`. Positive = presencial, negative = virtual.

#### Scenario: Strong presencial preference

- GIVEN Q23 = "Presencial", Q24 = 2, Q25 = "No tengo internet estable"
- WHEN direct signal is computed
- THEN presencial_direct > virtual_direct by >= 3 points
- AND direct recommendation = "presencial"

#### Scenario: Strong virtual preference

- GIVEN Q23 = "Virtual", Q24 = 5, Q25 = "Sí, tengo todo"
- WHEN direct signal is computed
- THEN virtual_direct > presencial_direct by >= 3 points
- AND direct recommendation = "virtual"

### Requirement: Derived Signal Computation

The derived signal correlates Layer 3 lifestyle values with modality:

| Value Dimension | Presencial Indicator | Virtual Indicator |
|----------------|---------------------|-------------------|
| Q18: Security preference | High security → presencial | High creativity → virtual |
| Q19: Work style | Team/clients → presencial | Solo/concentrated → virtual |
| Q20: Work-life balance importance | Low importance → presencial | High importance → virtual |
| Q21: Overtime willingness | High willingness → presencial | Low willingness → virtual |
| Q22: Uncertainty comfort | Low comfort → presencial | High comfort → virtual |

Each lifestyle answer contributes a presencial or virtual weight. Final derived score: `presencial_derived - virtual_derived`.

#### Scenario: Independent learner profile

- GIVEN Q18 = "Creatividad y libertad", Q19 = "Solo y concentrado", Q20 = 5, Q21 = 2, Q22 = 5
- WHEN derived signal is computed
- THEN virtual_derived > presencial_derived
- AND derived recommendation = "virtual"

#### Scenario: Social learner profile

- GIVEN Q18 = "Poder y status", Q19 = "Liderando un grupo", Q20 = 2, Q21 = 5, Q22 = 2
- WHEN derived signal is computed
- THEN presencial_derived > virtual_derived
- AND derived recommendation = "presencial"

### Requirement: Confidence Levels

The system SHALL assign confidence based on signal agreement:

| Direct | Derived | Confidence | Explanation Key |
|--------|---------|------------|-----------------|
| presencial | presencial | high | "both signals" |
| virtual | virtual | high | "both signals" |
| presencial | virtual | low | "direct preference" |
| virtual | presencial | low | "direct preference" |
| presencial | neutral | medium | "direct preference + no conflict" |
| virtual | neutral | medium | "direct preference + no conflict" |
| neutral | presencial | medium | "lifestyle alignment" |
| neutral | virtual | medium | "lifestyle alignment" |
| neutral | neutral | medium | "no strong signal" |

Where "neutral" means the derived score difference is < 1.0.

#### Scenario: High confidence with both aligned

- GIVEN direct = presencial, derived = presencial
- WHEN confidence is computed
- THEN confidence = "high"
- AND the explanation mentions both preference and lifestyle

#### Scenario: Low confidence with conflict

- GIVEN direct = virtual, derived = presencial
- WHEN confidence is computed
- THEN confidence = "low"
- AND the explanation notes the conflict

### Requirement: Explanation Generation

The system SHALL generate a Spanish explanation string for the modality recommendation. Explanations MUST reference specific student answers.

Template structure:
```
{modality_label}: {reason_based_on_direct}. {reason_based_on_derived_if_aligned}. {caveat_if_low_confidence}
```

Examples:
- High confidence presencial: "Recomendamos presencial porque prefieres ir a un campus y tu estilo de vida se adapta mejor al entorno presencial."
- Low confidence virtual: "Tu respuesta directa indica preferencia virtual, pero tu estilo de vida podría funcionar en modalidad presencial. Considera ambos opciones."
- Medium confidence: "Basado en tu estilo de vida, la modalidad virtual podría funcionar bien para ti."

#### Scenario: Explanation is in Spanish

- GIVEN any modality recommendation
- WHEN explanation is generated
- THEN the text is in Colombian Spanish
- AND it is 1-2 sentences maximum

#### Scenario: Low confidence includes caveat

- GIVEN confidence = "low"
- WHEN explanation is generated
- THEN it includes a phrase like "Considera explorar ambas opciones"
- AND it does NOT use definitive language like "debes"

### Requirement: Modality Score for Program Ranking

The modality recommendation SHALL NOT affect the program compatibility score. Programs are ranked purely by RIASEC + aptitude + values fit. The modality card is a separate, additive recommendation.

However, programs whose modality matches the recommendation SHALL be visually highlighted in the results.

#### Scenario: Modality does not change ranking

- GIVEN program A (presencial, score 90) and program B (virtual, score 88)
- AND student recommendation = "virtual"
- WHEN results are sorted
- THEN A still ranks above B
- AND B is visually highlighted as matching the modality preference

#### Scenario: Matching programs get visual indicator

- GIVEN a student recommended "presencial"
- WHEN results display
- THEN presencial programs show a "Recomendado" badge
- AND virtual programs do not show the badge

## Acceptance Criteria

1. Modality recommendation produces exactly "presencial" or "virtual"
2. Confidence is one of "high", "medium", "low"
3. Direct signal (Q23-Q25) is the primary determinant
4. Derived signal (Q18-Q22) provides secondary validation
5. Explanation is in Spanish and references student answers
6. Modality does not affect program score ranking
7. Matching programs are visually highlighted
8. When all Layer 4 answers are missing, recommendation defaults to "presencial" with "low" confidence
