# Results Display Specification

## Purpose

Present test results to the student after completing the vocational assessment. Shows the assigned archetype, Top 3 programs with compatibility percentages, and a full ranking of all 12 programs. Includes personalized explanations and "Por qué Modelo Dual" content.

## Requirements

### Requirement: Results Page Layout

The system SHALL render a dedicated results page after test completion. The page MUST display: (1) archetype card, (2) Top 3 programs section, (3) full ranking expandable section, (4) CTA to lead form. The layout MUST be mobile-first and responsive.

#### Scenario: Student views results after test

- GIVEN a student completed all scored questions
- WHEN results load
- THEN the archetype card is visible at the top with emoji, name, and description

#### Scenario: Results page is shareable

- GIVEN results are computed
- WHEN the student navigates to the results URL directly
- THEN the page renders correctly if they have a valid session; otherwise redirects to test start

### Requirement: Archetype Card

The system MUST display the student's archetype as a prominent card with: emoji (large), archetype name, description paragraph, and "Por qué Modelo Dual" explanation tailored to their profile.

#### Scenario: Archetype card renders with all fields

- GIVEN the student's dominant dimension is Intereses
- WHEN the archetype card renders
- THEN it shows the emoji, name (e.g., "El Líder Estratégico"), a 2-3 sentence description, and a personalized "Por qué Modelo Dual" paragraph

### Requirement: Top 3 Programs

The system SHALL display the top 3 programs as expandible cards. Each card MUST show: program name, campus modality (Presencial/Virtual), compatibility percentage as a visual bar, and an expandable explanation section. Cards MUST be ordered by compatibility descending.

#### Scenario: Top 3 with percentages

- GIVEN the student's top 3 programs are Ing. Software (92%), Negocios Internacionales (87%), Marketing (81%)
- WHEN the Top 3 section renders
- THEN three cards appear in order with percentage bars and program names

#### Scenario: Expand program explanation

- GIVEN a Top 3 program card is collapsed
- WHEN the student taps the expand icon
- THEN the card reveals a paragraph explaining why this program matches their profile, plus "Modelo Dual" benefits

#### Scenario: Tie in compatibility

- GIVEN two programs have the same compatibility percentage
- WHEN the Top 3 is computed
- THEN the tiebreaker is alphabetical order by program name

### Requirement: Full Ranking

The system MUST show an expandable "Ver los 12 programas" section below the Top 3. When expanded, it lists all 12 programs sorted by compatibility with percentage bars. Each entry shows: rank number, program name, modality, and percentage.

#### Scenario: Expand full ranking

- GIVEN the full ranking section is collapsed
- WHEN the student taps "Ver los 12 programas"
- THEN all 12 programs appear in descending compatibility order with visual percentage indicators

### Requirement: Call to Action

The system MUST display a CTA button after results encouraging the student to complete the lead form. The CTA SHALL read something like "¿Te gustó tu resultado? ¡Déjanos tus datos!" and link to the lead form section.

#### Scenario: CTA links to lead form

- GIVEN the student views their results
- WHEN they tap the CTA button
- THEN the page scrolls to or navigates to the lead form with the test results pre-associated

### Requirement: Results Responsive Design

The system MUST render results correctly on mobile (320px-480px), tablet (768px), and desktop (1024px+). Top 3 cards MUST stack vertically on mobile and display in a row on desktop.

#### Scenario: Mobile results layout

- GIVEN the student views results on a 375px viewport
- WHEN the page renders
- THEN archetype card, Top 3, and full ranking stack vertically with full-width cards

## Data Model

```typescript
interface ResultsData {
  archetype: Archetype;
  topPrograms: ProgramResult[];     // Top 3
  fullRanking: ProgramResult[];     // All 12
  completedAt: string;              // ISO timestamp
}

interface ProgramResult {
  programId: string;
  name: string;                     // Spanish program name
  modality: 'presencial' | 'virtual';
  compatibility: number;            // 0-100
  explanation: string;              // Why this matches the profile
  whyDualModel: string;             // Dual model benefits for this program
}

interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  whyDualModel: string;
  dominantDimension: string;
}
```

## Edge Cases

- All programs score below 30%: show Top 3 anyway with "Podrías explorar estas opciones" framing
- Student skips Q16 (free-text): results still display normally
- Results page accessed before test completion: redirect to last answered question
- Screen reader accessibility: all percentage values MUST have aria-label text

## Dependencies

- test-engine: scoring output (ScoringResult array)
- Tailwind CSS 4 for responsive layout
- Framer Motion or CSS transitions for card expand animations
