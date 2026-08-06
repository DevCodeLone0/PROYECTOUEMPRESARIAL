# Results Display Specification

## Purpose

Enhanced results page with radar chart, fit breakdown, modality card, gap analysis, and redesigned archetype card.

## Requirements

### Requirement: Radar Chart — 6 RIASEC Dimensions

The system SHALL display a radar chart (spider chart) showing the student's 6 RIASEC dimensions.

- **Library**: recharts (RadarChart component) — zero cost, already compatible with React 19
- **Data flow**: `riasecProfile[6]` → recharts RadarChart data format → rendered SVG
- **Dimensions**: R, I, A, S, E, C — labeled with Spanish names
- **Styling**: Dark background (#0a0a0a), accent color gradient fill, white labels
- **Position**: Below archetype card, above program ranking

The radar chart MUST show:
- Student profile (filled area, primary color)
- Program requirement overlay (dotted line, secondary color) — shown when a program is selected

#### Scenario: Radar chart renders with 6 axes

- GIVEN a student with RIASEC profile [0.8, 0.6, 0.3, 0.2, 0.4, 0.5]
- WHEN results page loads
- THEN a radar chart with 6 axes is visible
- AND each axis is labeled: Realista, Investigador, Artístico, Social, Emprendedor, Convencional
- AND the filled area covers the student's profile shape

#### Scenario: Radar chart shows program overlay on hover

- GIVEN a student viewing results
- WHEN they hover/click on a program card
- THEN the radar chart shows the program's requirement vector as a dotted overlay
- AND the student's profile remains visible underneath

### Requirement: Fit Breakdown per Program

Each program card SHALL display 3 sub-scores:

1. **Aptitud técnica** (Technical fit) — Layer 2 score
2. **Personalidad** (Personality fit) — Layer 1 RIASEC score
3. **Estilo de vida** (Lifestyle fit) — Layer 3 values score

Format: Horizontal bar or 3-column layout per program card. Values shown as percentage (0-100%).

The overall compatibility score is the weighted combination (0.4 × personality + 0.3 × technical + 0.3 × lifestyle).

#### Scenario: Fit breakdown is visible on program card

- GIVEN a program card for "Ingeniería de Software"
- WHEN displayed in the top 3
- THEN three sub-scores are visible: aptitud técnica, personalidad, estilo de vida
- AND each shows a percentage value

#### Scenario: Fit breakdown explains the match

- GIVEN a program with personality=92, technical=45, lifestyle=78
- WHEN the card is rendered
- THEN the personality bar is highlighted as the strongest match
- AND the technical bar is shown as the weakest

### Requirement: Modality Card

The system SHALL display a modality recommendation card below the archetype card and above the program ranking.

Content:
- Recommended modality: "Presencial" or "Virtual" with emoji (🏫 or 💻)
- Confidence indicator: High (green), Medium (yellow), Low (orange)
- Explanation text: 1-2 sentences in Spanish explaining why
- Matching programs count: "X de tus programas recomendados son {modality}"

#### Scenario: Modality card with high confidence

- GIVEN a student with modality = "presencial", confidence = "high"
- WHEN the modality card renders
- THEN it shows 🏫 Presencial with green confidence indicator
- AND explanation text references their preference and lifestyle

#### Scenario: Modality card with low confidence

- GIVEN a student with modality = "virtual", confidence = "low"
- WHEN the modality card renders
- THEN it shows 💻 Virtual with orange confidence indicator
- AND explanation includes "Considera explorar ambas opciones"

### Requirement: Gap Analysis Section

The system SHALL display a gap analysis for the student's top 3 programs.

For each program, the gap analysis shows:
- The student's RIASEC vs. the program's requirement (per dimension)
- Dimensions where the student is BELOW the program requirement (gaps)
- Suggested areas to develop

Format: Expandable section below each program card. Shows 6 bars (one per RIASEC dimension) with student vs. requirement comparison.

#### Scenario: Gap analysis shows dimension gaps

- GIVEN a program requiring R=0.9 and student has R=0.6
- WHEN gap analysis expands
- THEN dimension R shows a gap indicator
- AND text suggests: "Desarrolla habilidades técnicas y prácticas"

#### Scenario: No gaps for strong match

- GIVEN a program where student meets or exceeds all requirements
- WHEN gap analysis expands
- THEN all dimensions show green checks
- AND text says: "¡Excelente alineación! No hay breaches significativas"

### Requirement: Archetype Card Redesign

The archetype card SHALL be redesigned to show:
- Archetype emoji (large, centered)
- Archetype name (Spanish)
- Archetype description (1-2 sentences)
- WhyDualModel text (1-2 sentences)
- Visual indicator of dominant RIASEC dimension

The card MUST NOT show old dimension scores (intereses/personalidad/habilidades/motivacion). It shows the archetype derived from the new RIASEC system.

#### Scenario: Archetype card shows new system data

- GIVEN a student with archetype = "constructor"
- WHEN the archetype card renders
- THEN it shows ⚙️ El Constructor
- AND description matches the archetype definition
- AND WhyDualModel text is displayed

#### Scenario: No old scoring data visible

- GIVEN the results page loads with new scoring system
- WHEN any element is inspected
- THEN no reference to "intereses", "personalidad", "habilidades", or "motivacion" appears
- AND all scoring references use RIASEC dimension names

### Requirement: Program Card Enhancement

Each program card SHALL show:
- Program name and modality badge (presencial/virtual)
- Overall compatibility score (0-100%)
- Fit breakdown (3 sub-scores)
- Modality match indicator (✓ if matches recommendation)
- Top 3 get expanded cards; rest are collapsed

#### Scenario: Top 3 programs are expanded

- GIVEN 12 program results sorted by score
- WHEN results display
- THEN the top 3 show full fit breakdown
- AND programs 4-12 show name + score only

#### Scenario: Modality match badge

- GIVEN a presencial program and student recommendation = "presencial"
- WHEN the program card renders
- THEN a "Recomendado" badge appears next to the modality label

### Requirement: Responsive Design

The results page MUST be responsive:
- Mobile (< 640px): Single column, radar chart full width, cards stacked
- Tablet (640-1024px): Two-column layout for cards
- Desktop (> 1024px): Full layout with sidebar for radar chart

#### Scenario: Mobile layout renders correctly

- GIVEN a student viewing results on a 375px viewport
- WHEN the page renders
- THEN all content is visible without horizontal scroll
- AND the radar chart is full width
- AND program cards are stacked vertically

### Requirement: Data Flow from Scoring to Display

The results page SHALL receive data in this structure:

```typescript
interface ResultsData {
  riasecProfile: [number, number, number, number, number, number]  // 6 normalized
  archetype: Archetype
  programResults: Array<{
    programId: string
    overallScore: number          // 0-100
    fitBreakdown: {
      technical: number           // 0-100
      personality: number         // 0-100
      lifestyle: number           // 0-100
    }
  }>
  modality: {
    recommendation: 'presencial' | 'virtual'
    confidence: 'high' | 'medium' | 'low'
    explanation: string
  }
}
```

#### Scenario: Results data is complete

- GIVEN scoring engine produces results
- WHEN data is passed to results page
- THEN all fields in ResultsData are present
- AND riasecProfile has exactly 6 elements
- AND all scores are in [0, 100]

#### Scenario: Missing data degrades gracefully

- GIVEN results data with missing modality explanation
- WHEN results page renders
- THEN a default explanation is shown: "Basado en tus respuestas"
- AND no error is thrown

## Acceptance Criteria

1. Radar chart renders with 6 RIASEC axes using recharts
2. Fit breakdown shows 3 sub-scores per program
3. Modality card shows recommendation + confidence + explanation
4. Gap analysis shows per-dimension comparison for top 3 programs
5. Archetype card shows new RIASEC-based archetype (no old scores)
6. Page is responsive at mobile/tablet/desktop breakpoints
7. All UI text is in Colombian Spanish
8. No new paid dependencies introduced (recharts is free)
9. Results page works without JavaScript (graceful fallback message)
