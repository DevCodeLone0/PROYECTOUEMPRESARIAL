# Archetype System Specification

## Purpose

Map RIASEC profiles to Jung-inspired professional archetypes with names, descriptions, and WhyDualModel explanations.

## Requirements

### Requirement: Archetype Definitions

The system SHALL define 8 professional archetypes. Each archetype maps to a dominant RIASEC code pattern.

| Archetype ID | Name | Emoji | Dominant RIASEC | Description (Spanish) |
|-------------|------|-------|-----------------|----------------------|
| constructor | El Constructor | ⚙️ | R + I | Optimizas todo lo que tocas. Procesos, recursos, tiempo — encuentras la forma más inteligente de hacer las cosas. |
| investigador | El Investigador | 🔬 | I + R | Tu curiosidad no tiene límites. Analizas, experimentas y descubres patrones que otros pasan por alto. |
| creador | El Creador | 🎨 | A + S | Transformas ideas en experiencias. Tu creatividad es tu lenguaje natural y tu mayor ventaja. |
| connecting | El Conector | 🤝 | S + E | Entiendes a las personas como nadie. Empatía, comunicación y habilidades sociales son tu superpoder. |
| estratega | El Estratega | ♟️ | E + C | Planificas, organizas y ejecutas con precisión. Ves el panorama completo donde otros ven caos. |
| analista | El Analista | 📊 | C + I | Los datos cuentan historias para ti. Metódico, preciso y orientado a la excelencia. |
| visionario | El Visionario | 🚀 | E + A | Conectas creatividad con negocio. Ves oportunidades donde otros ven problemas. |
| leader | El Líder | 👑 | E + S | Inspiras, motivas y llevas equipos a resultados extraordinarios. Tu energía es contagiosa. |

#### Scenario: All 8 archetypes exist

- GIVEN the archetype system initializes
- WHEN archetypes are loaded
- THEN exactly 8 archetypes exist
- AND each has a unique ID, name, emoji, and description

#### Scenario: Each archetype has a WhyDualModel text

- GIVEN any archetype
- WHEN its metadata is loaded
- THEN `whyDualModel` is a 1-2 sentence Spanish text explaining why the Dual Model fits this archetype

### Requirement: RIASEC-to-Archetype Mapping

The system SHALL determine the archetype from the student's normalized RIASEC profile (6 values in [0,1]).

Algorithm:
1. Find the two highest RIASEC dimensions (dominant + secondary)
2. Map the (dominant, secondary) pair to an archetype using the mapping table:

| Dominant | Secondary | Archetype |
|----------|-----------|-----------|
| R | I or A | constructor |
| I | R or C | investigador |
| A | S or I | creador |
| S | E or A | connecting |
| E | C or S | leader |
| C | I or E | estratega |
| E | A or R | visionario |
| any other | any | closest by cosine similarity to archetype vectors |

3. If no direct mapping exists, fall back to cosine similarity against ideal archetype RIASEC vectors.

#### Scenario: High R + high I → Constructor

- GIVEN a student with RIASEC profile R=0.9, I=0.8, A=0.2, S=0.1, E=0.3, C=0.4
- WHEN archetype is determined
- THEN dominant = R, secondary = I
- AND archetype = "constructor"

#### Scenario: High E + high S → Leader

- GIVEN a student with RIASEC profile R=0.3, I=0.4, A=0.2, S=0.8, E=0.9, C=0.5
- WHEN archetype is determined
- THEN dominant = E, secondary = S
- AND archetype = "leader"

#### Scenario: Tie between dimensions

- GIVEN a student with R=0.7, I=0.7 (tied for highest)
- WHEN archetype is determined
- THEN the system uses the dimension with the higher secondary score as tiebreaker
- AND if still tied, defaults to the first alphabetically (I before R → investigador)

### Requirement: Archetype Profile Vectors

Each archetype MUST have a 6-element RIASEC profile vector (normalized 0-1) representing its ideal alignment:

| Archetype | R | I | A | S | E | C |
|-----------|---|---|---|---|---|---|
| constructor | 0.9 | 0.7 | 0.1 | 0.1 | 0.3 | 0.5 |
| investigador | 0.7 | 0.9 | 0.2 | 0.2 | 0.2 | 0.4 |
| creador | 0.2 | 0.3 | 0.9 | 0.6 | 0.3 | 0.1 |
| connecting | 0.1 | 0.2 | 0.4 | 0.9 | 0.7 | 0.2 |
| estratega | 0.3 | 0.4 | 0.1 | 0.2 | 0.7 | 0.9 |
| analista | 0.4 | 0.8 | 0.1 | 0.1 | 0.3 | 0.9 |
| visionario | 0.3 | 0.3 | 0.7 | 0.4 | 0.9 | 0.2 |
| leader | 0.2 | 0.3 | 0.3 | 0.7 | 0.9 | 0.4 |

#### Scenario: Profile vectors are normalized

- GIVEN any archetype profile
- WHEN profile is loaded
- THEN all 6 values are in [0, 1]
- AND no value is negative

### Requirement: Fallback via Cosine Similarity

When the dominant/secondary mapping doesn't match a direct archetype, the system SHALL compute cosine similarity between the student's RIASEC vector and each archetype's profile vector. The closest match wins.

#### Scenario: Ambiguous profile uses cosine fallback

- GIVEN a student with R=0.5, I=0.5, A=0.5, S=0.5, E=0.5, C=0.5 (all equal)
- WHEN archetype is determined
- THEN the direct mapping finds no dominant pair
- AND cosine similarity is computed against all 8 archetype vectors
- AND the archetype with highest cosine similarity wins

#### Scenario: Cosine similarity is commutative

- GIVEN student vector A and archetype vector B
- WHEN cosine(A, B) is computed
- THEN cosine(A, B) == cosine(B, A)

### Requirement: Archetype Display Data

Each archetype MUST provide display data for the results page:

- `name`: Spanish name (e.g., "El Constructor")
- `emoji`: Single emoji character
- `description`: 1-2 sentence Spanish description of the archetype's traits
- `whyDualModel`: 1-2 sentence Spanish text explaining why the Dual Model fits

#### Scenario: Description is concise

- GIVEN any archetype
- WHEN description is displayed
- THEN it is 1-2 sentences (max 40 words)
- AND it is in Colombian Spanish

#### Scenario: WhyDualModel is program-agnostic

- GIVEN any archetype
- WHEN whyDualModel is displayed
- THEN it does NOT mention specific program names
- AND it explains the Dual Model concept generally

## Acceptance Criteria

1. Exactly 8 archetypes exist with unique IDs
2. Every RIASEC profile maps to exactly one archetype
3. Mapping uses dominant/secondary pair first, cosine fallback second
4. Archetype profile vectors are 6-element normalized [0,1]
5. All display text is in Colombian Spanish
6. WhyDualModel text does not reference specific programs
7. No archetype requires external API calls or services
8. Archetype determination is deterministic (same input → same output)
