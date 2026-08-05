# Test Engine Specification

## Purpose

Wizard-based vocational assessment engine that evaluates students across 4 psychometric dimensions (Holland/RIASEC, Big Five, Habilidades, Motivación) with 16 questions total. Produces a weighted compatibility score against 12 university programs and determines the student's archetype.

## Requirements

### Requirement: Wizard Flow

The system SHALL render a step-by-step wizard that presents questions sequentially, one per screen. The wizard MUST support forward/backward navigation. A gamified progress bar MUST display current step out of total with levels and points feedback.

#### Scenario: Student completes test sequentially

- GIVEN a student is on step N of 16
- WHEN they select an answer and tap "Siguiente"
- THEN the wizard advances to step N+1 and the progress bar updates

#### Scenario: Student navigates backward

- GIVEN a student is on step N where N > 1
- WHEN they tap "Anterior"
- THEN the wizard returns to step N-1 with the previously selected answer pre-filled

#### Scenario: Progress bar shows gamified feedback

- GIVEN the student has answered 8 of 16 questions
- WHEN the progress bar renders
- THEN it shows "50%" progress, the current level label (e.g., "Nivel Explorador"), and accumulated points

### Requirement: Question Types

The system MUST support three question types: single-choice (radio), Likert scale, and free-text. Each question type SHALL map to a specific dimension.

#### Scenario: Intereses question (single-choice)

- GIVEN the current question belongs to the Intereses dimension
- WHEN it renders
- THEN it displays 4-5 mutually exclusive options as tappable cards, and exactly one option can be selected

#### Scenario: Personalidad question (Likert 5-point)

- GIVEN the current question belongs to the Personalidad dimension
- WHEN it renders
- THEN it displays a 5-point Likert scale: "Nada en absoluto / Poco / Moderadamente / Bastante / Totalmente"

#### Scenario: Habilidades question (Likert 4-point)

- GIVEN the current question belongs to the Habilidades dimension
- WHEN it renders
- THEN it displays a 4-point scale: "Nivel 1 / Nivel 2 / Nivel 3 / Nivel 4"

#### Scenario: Motivación question (binary)

- GIVEN the current question belongs to the Motivación dimension
- WHEN it renders
- THEN it displays exactly 2 options and the student must pick one

### Requirement: Question Bank

The system MUST contain exactly 16 questions: 3 Intereses (Q1-Q3), 5 Personalidad (Q4-Q8), 4 Habilidades (Q9-Q12), 3 Motivación (Q13-Q15), and 1 free-text closing (Q16). Questions MUST NOT be reorderable or conditionally skipped.

#### Scenario: Q16 is optional free-text

- GIVEN the student reaches Q16
- WHEN it renders
- THEN it displays a textarea with placeholder text and a "Finalizar" button; the student MAY submit without answering

### Requirement: Scoring Engine

The system SHALL compute a compatibility score per program using a 4×12 weighted matrix. Each dimension maps to program weights. The final ranking MUST sort all 12 programs by descending compatibility percentage.

#### Scenario: Scoring with all dimensions answered

- GIVEN a student answered all 15 scored questions (Q1-Q15)
- WHEN scoring runs
- THEN each of the 12 programs receives a compatibility percentage from 0-100%, and the list is sorted descending

#### Scenario: Scoring with missing answers

- GIVEN a student skipped fewer than 3 scored questions
- WHEN scoring runs
- THEN missing answers default to the neutral Likert midpoint and scoring proceeds normally

#### Scenario: Scoring blocked on too many missing

- GIVEN a student skipped 3 or more scored questions
- WHEN they tap "Finalizar"
- THEN the system shows a message requiring them to go back and answer all skipped questions

### Requirement: Archetype Determination

The system SHALL assign one archetype based on the dominant dimension scores. Each archetype has a name, emoji, description, and "Por qué Modelo Dual" explanation.

#### Scenario: Dominant Holland profile

- GIVEN the student's highest dimension score is Intereses
- WHEN the archetype is determined
- THEN the system assigns the archetype matching their top Holland code (e.g., "El Líder Estratégico") with its emoji and explanation

### Requirement: Disclaimer

The system MUST display a legal disclaimer before the test starts. The disclaimer SHALL state the test is informational only, does not constitute a psychological diagnosis, and does not guarantee admission.

#### Scenario: Disclaimer shown before first question

- GIVEN the student has not started the test
- WHEN they land on the test page
- THEN the disclaimer is displayed with an "Entendido, empezar" button that must be tapped to proceed

### Requirement: State Persistence

The system MUST persist test state to Zustand store. State SHALL survive page refresh within the same session. Partial progress MUST be recoverable if the student returns within 24 hours.

#### Scenario: Page refresh recovery

- GIVEN a student answered 10 questions and refreshes the browser
- WHEN the page loads
- THEN the wizard resumes at step 11 with all previous answers intact

## Data Model

```typescript
interface Question {
  id: string;            // Q1-Q16
  dimension: 'intereses' | 'personalidad' | 'habilidades' | 'motivacion' | 'cierre';
  type: 'single-choice' | 'likert-5' | 'likert-4' | 'binary' | 'free-text';
  text: string;          // Spanish question text
  options?: string[];    // For choice/binary types
  points?: number;       // Score weight for this question
}

interface TestAnswer {
  questionId: string;
  value: string | number;
}

interface ScoringResult {
  programId: string;
  compatibility: number; // 0-100
  dimensionScores: Record<string, number>;
}

interface Archetype {
  id: string;
  name: string;          // e.g., "El Líder Estratégico"
  emoji: string;
  description: string;
  whyDualModel: string;
  dominantDimension: string;
}
```

## Edge Cases

- Browser back button during test: MUST not break wizard state; treat as "Anterior"
- Multiple tabs open: last-write-wins on Zustand persistence
- Network offline: test runs entirely client-side; submission deferred until online
- Q16 free-text with profanity: MAY be filtered server-side before storage

## Dependencies

- Zustand 5 for state management
- Zod 4 for answer validation schemas
- Supabase client for eventual lead submission (coordinates with lead-management)
- Score matrix configuration (external JSON or constant)
