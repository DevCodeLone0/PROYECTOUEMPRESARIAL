# Question Bank Specification

## Purpose

25 questions organized in 4 layers, each contributing to specific scoring dimensions with configurable option weights.

## Requirements

### Requirement: Layer Structure

The system SHALL organize 25 questions into 4 layers:

| Layer | Name | Questions | Count | Purpose |
|-------|------|-----------|-------|---------|
| 1 | Intereses RIASEC | Q1-Q12 | 12 | 6-coordinate RIASEC profile |
| 2 | Aptitudes | Q13-Q17 | 5 | Behavioral aptitude vector |
| 3 | Valores y Estilo de Vida | Q18-Q22 | 5 | Values/lifestyle vector |
| 4 | Modalidad | Q23-Q25 | 3 | Presencial/virtual preference |

Each layer MUST be completed before the next begins. The wizard MUST display a layer transition screen between layers.

#### Scenario: Layer transition display

- GIVEN a student completes Layer 1 (Q12)
- WHEN advancing to Q13
- THEN a transition screen appears showing "Ahora hablemos de tus aptitudes"
- AND the layer indicator updates to Layer 2

#### Scenario: Cannot skip layers

- GIVEN a student on Q5 (Layer 1)
- WHEN attempting to jump to Q15 (Layer 2)
- THEN the system prevents the jump
- AND the student remains on Q5

### Requirement: Layer 1 — RIASEC Interests (12 Questions)

Each question is single-choice with 5 options (index 0-4). Each option contributes to 1-2 RIASEC dimensions.

| Q# | Text (Spanish) | Opt 0 | Opt 1 | Opt 2 | Opt 3 | Opt 4 |
|----|----------------|-------|-------|-------|-------|-------|
| Q1 | ¿Qué actividad te gustaría hacer en tu trabajo ideal? | Crear soluciones tecnológicas | Liderar equipos y tomar decisiones | Conectar con personas de diferentes culturas | Diseñar experiencias visuales | Analizar datos para encontrar oportunidades |
| Q2 | ¿Qué tipo de empresa te gustaría liderar? | Empresa de tecnología o startup | Hotel o resort de lujo | Multinacional con oficinas en varios países | Agencia de marketing o publicidad | Banco o empresa financiera |
| Q3 | ¿Qué te motiva más a la hora de estudiar? | Resolver problemas complejos con lógica | Generar ideas creativas y nuevas | Trabajar en equipo y alcanzar metas juntos | Aprender sobre cómo funcionan los negocios | Impactar positivamente a las personas |
| Q4 | ¿En qué tipo de proyecto te gustaría trabajar? | Construir algo tangible (máquinas, productos) | Investigar y descubrir cosas nuevas | Crear arte, diseño o contenido visual | Ayudar a personas directamente | Liderar un equipo hacia una meta |
| Q5 | ¿Qué entorno de trabajo prefieres? | Taller, laboratorio o campo | Oficina con libertad creativa | Estudio de diseño o espacio flexible | Hospital, escuela o centro comunitario | Sala de juntas o oficina ejecutiva |
| Q6 | ¿Qué habilidad quieres desarrollar más? | Manejar herramientas y tecnología | Pensamiento crítico y análisis | Expresión artística y creativa | Comunicación y empatía | Negociación y persuasión |
| Q7 | ¿Cómo te describes en un equipo? | El que construye y arregla cosas | El que investiga y propone soluciones | El que aporta ideas originales | El que apoya y motiva a otros | El que organiza y lidera |
| Q8 | ¿Qué te da más satisfacción? | Ver un resultado tangible de tu trabajo | Descubrir algo que nadie sabía | Crear algo que emocione a otros | Que alguien diga "gracias a ti" | Lograr un objetivo ambicioso |
| Q9 | ¿Qué tipo de problema te atrae más? | Un defecto técnico que hay que arreglar | Un misterio sin resolver | Un diseño que necesita mejorar | Un conflicto interpersonal | Una meta que requiere estrategia |
| Q10 | ¿Cuál es tu idea de éxito profesional? | Construir productos que la gente use | Hacer un descubrimiento importante | Que mi trabajo sea reconocido por su arte | Que mi trabajo mejore la vida de otros | Liderar una empresa exitosa |
| Q11 | ¿Qué materia elegirías si solo pudieras tomar una? | Física o ingeniería | Biología o química | Arte o diseño | Psicología o trabajo social | Economía o mercadeo |
| Q12 | ¿Qué superpoder profesional elegirías? | Construir cualquier cosa con las manos | Resolver cualquier misterio | Crear obras maestras | Curar a cualquier persona | Convencer a cualquier persona |

#### Scenario: Q1 option 0 maps to R dimension

- GIVEN a student selects option 0 on Q1 ("Crear soluciones tecnológicas")
- WHEN the RIASEC weight matrix is consulted
- THEN dimension R receives the highest weight for this option
- AND dimension I may receive a secondary weight

#### Scenario: All 12 questions present

- GIVEN the question bank is loaded
- WHEN Layer 1 is displayed
- THEN exactly 12 questions are shown
- AND each has exactly 5 options

### Requirement: Layer 2 — Aptitudes (5 Questions)

Behavioral scenario questions. Each is single-choice with 4 options. Measures demonstrated aptitude, not self-reported skill.

| Q# | Text | Opt 0 | Opt 1 | Opt 2 | Opt 3 |
|----|------|-------|-------|-------|-------|
| Q13 | En un examen, ¿qué tipo de pregunta te sale mejor? | La que requiere cálculos y fórmulas | La de análisis de textos largos | La de crear algo original | La de trabajar en equipo |
| Q14 | Si tienes un proyecto grande, ¿qué haces primero? | Hago un plan detallado paso a paso | Investigo todo lo posible antes | Empiezo a crear algo y ajusto después | Organizo al grupo y asigno tareas |
| Q15 | ¿Cómo aprendes algo nuevo más rápido? | Practicando con mis manos | Leyendo y investigando a fondo | Observando ejemplos e imitando | Explicándolo a otros |
| Q16 | ¿En qué situación rindes mejor bajo presión? | Cuando debo entregar algo concreto | Cuando debo analizar y decidir | Cuando debo ser creativo bajo presión | Cuando debo trabajar con otros |
| Q17 | ¿Qué tipo de tarea te mantienes más concentrado? | Tareas mecánicas y repetitivas | Tareas que requieren lógica profunda | Tareas que requieren imaginación | Tareas que involucran interacción social |

#### Scenario: Each aptitude question has 4 options

- GIVEN Layer 2 loads
- WHEN questions are displayed
- THEN each question has exactly 4 options
- AND option index maps to aptitude vector dimension

### Requirement: Layer 3 — Values and Lifestyle (5 Questions)

Measures work values and lifestyle preferences. Mix of single-choice (3) and Likert-5 (2).

| Q# | Text | Type | Options |
|----|------|------|---------|
| Q18 | ¿Qué es más importante para ti en un trabajo? | single-choice | Seguridad y estabilidad / Creatividad y libertad / Poder y status / Ayudar a otros / Aprendizaje continuo |
| Q19 | ¿Cómo prefieres trabajar? | single-choice | Solo y concentrado / En equipo pequeño / Liderando un grupo / Con clientes directamente |
| Q20 | ¿Qué tan importante es para ti el equilibrio vida-trabajo? | likert-5 | Nada importante / Poco / Moderadamente / Muy importante / Extremadamente importante |
| Q21 | ¿Qué tan dispuesto/a estás a trabajar horas extra para ascender? | likert-5 | Nada dispuesto / Poco / Moderadamente / Muy dispuesto / Totalmente dispuesto |
| Q22 | ¿Qué tan cómodo/a te sientes con la incertidumbre laboral? | single-choice | Muy incómodo, necesito estabilidad / Algo incómodo pero aceptable / Indiferente / Cómodo, me gusta el desafío / Muy cómodo, la incertidumbre me motiva |

#### Scenario: Values questions produce lifestyle vector

- GIVEN a student answers all 5 Layer 3 questions
- WHEN the values vector is computed
- THEN it has a defined number of dimensions matching the lifestyle fit computation
- AND single-choice options map to weighted lifestyle dimensions

### Requirement: Layer 4 — Modality (3 Questions)

Direct preference questions for presencial vs. virtual recommendation.

| Q# | Text | Options |
|----|------|---------|
| Q23 | ¿Cómo prefieres tomar tus clases? | Presencial (ir a un campus) / Virtual (desde cualquier lugar) / No tengo preferencia |
| Q24 | ¿Qué tan cómodo/a te sientes aprendiendo en línea? | Muy incómodo / Algo incómodo / Neutral / Cómodo / Muy cómodo |
| Q25 | ¿Tienes acceso estable a internet y un espacio de estudio en casa? | Sí, tengo todo / Tengo internet pero no espacio dedicado / No tengo internet estable / No tengo espacio ni internet confiable |

#### Scenario: Q23 is the primary modality signal

- GIVEN a student answers Q23 = "Presencial"
- WHEN modality recommendation runs
- THEN the direct signal is "presencial"
- AND confidence starts as "high" (direct answer is clear)

#### Scenario: Q23 = "No tengo preferencia"

- GIVEN a student answers Q23 = "No tengo preferencia"
- WHEN modality recommendation runs
- THEN the system uses Q24 and Q25 as tiebreakers
- AND confidence is "medium" (no direct preference)

### Requirement: Scoring Weights per Option

Every option on every question MUST have a numeric weight per contributing dimension. The `SCORING_WEIGHTS` structure:

```typescript
type ScoringWeights = Record<string, Record<string, number>>
// Key: question ID, Value: dimension → weight
```

Example for Q1 option 0:
```
{ "Q1": { "R": 0.7, "I": 0.2, "A": 0.0, "S": 0.0, "E": 0.1, "C": 0.0 } }
```

Weights across all options for a question MUST sum to 1.0 per dimension contribution.

#### Scenario: Weights are configurable

- GIVEN the scoring weights matrix
- WHEN a vocational guidance expert wants to adjust Q3's mapping
- THEN they modify the weights in `SCORING_WEIGHTS`
- AND no code changes are needed

#### Scenario: Invalid option index produces zero weights

- GIVEN a student provides option index 5 on Q1 (out of range 0-4)
- WHEN weights are looked up
- THEN all dimensions receive 0 contribution for that question
- AND no error is thrown (graceful degradation)

### Requirement: Question Store Schema

The `Question` interface SHALL be extended:

```typescript
interface Question {
  id: string
  layer: 1 | 2 | 3 | 4
  dimension: string          // RIASEC dim or 'aptitude' or 'values' or 'modality'
  type: 'single-choice' | 'likert-5'
  text: string
  options: string[]
  riasecWeights?: Record<string, number>  // per-option weight map
}
```

#### Scenario: All 25 questions have layer assignment

- GIVEN the question bank is loaded
- WHEN questions are enumerated
- THEN every question has a layer value in {1, 2, 3, 4}
- AND no question is missing its layer

## Acceptance Criteria

1. Exactly 25 questions exist across 4 layers (12 + 5 + 5 + 3)
2. Layer 1 questions each map to at least 1 RIASEC dimension
3. Every option has a scoring weight for its contributing dimensions
4. Question text is in Spanish (Colombiano)
5. All UI-facing text uses neutral Colombian Spanish
6. No question requires external API calls or services
7. Questions are statically defined (no database dependency)
