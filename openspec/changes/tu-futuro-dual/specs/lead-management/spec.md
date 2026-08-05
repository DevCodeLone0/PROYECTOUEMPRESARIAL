# Lead Management Specification

## Purpose

Capture student contact information after test completion with explicit data consent per Colombian Ley 1581 de 2012. Stores leads in Supabase with associated test results. Provides the submission API and validation logic.

## Requirements

### Requirement: Lead Form Fields

The system MUST collect exactly three fields: name (string), email (string), phone (string). All fields are required. The form MUST appear after results display, either inline on the results page or as a separate step.

#### Scenario: Empty form submission blocked

- GIVEN the student taps "Enviar" without filling any field
- WHEN validation runs
- THEN the form shows inline errors for all three required fields and does NOT submit

#### Scenario: Valid form submission

- GIVEN the student fills name, valid email, and valid phone
- WHEN they tap "Enviar"
- THEN the form submits successfully and shows a confirmation message

### Requirement: Email Validation

The system SHALL validate email format using a Zod schema. The regex MUST accept standard formats (user@domain.tld) and reject obviously malformed inputs.

#### Scenario: Invalid email rejected

- GIVEN the student enters "notanemail"
- WHEN they tap "Enviar"
- THEN an inline error appears: "Ingresa un correo electrónico válido"

#### Scenario: Valid email accepted

- GIVEN the student enters "maria@gmail.com"
- WHEN validation runs
- THEN the email passes validation

### Requirement: Phone Validation

The system SHALL validate phone numbers. Acceptable formats: Colombian mobile (10 digits starting with 3), landline (7-10 digits), or international format with country code.

#### Scenario: Colombian mobile accepted

- GIVEN the student enters "3142084103"
- WHEN validation runs
- THEN the phone passes validation

#### Scenario: Invalid phone rejected

- GIVEN the student enters "123"
- WHEN they tap "Enviar"
- THEN an inline error appears: "Ingresa un número de teléfono válido"

### Requirement: Data Consent (Ley 1581 de 2012)

The system MUST display a consent checkbox, DESMARCADO por defecto (opt-in). The checkbox text MUST include: purpose of data collection, data controller identity (Uniempresarial, NIT 830.084.876-6), rights of the data subject, and a link to the privacy policy. The form MUST NOT submit without consent checked.

#### Scenario: Submit without consent

- GIVEN the student fills all fields but does NOT check the consent box
- WHEN they tap "Enviar"
- THEN the form shows an error: "Debes aceptar el tratamiento de datos personales para continuar" and does NOT submit

#### Scenario: Submit with consent

- GIVEN the student fills all fields AND checks the consent box
- WHEN they tap "Enviar"
- THEN the form submits with `consent_given: true` and `consent_timestamp` recorded

### Requirement: Lead Data Storage

The system SHALL store leads in the Supabase `leads` table. Each lead record MUST include: name, email, phone, consent_given, consent_timestamp, test_results (JSONB), archetype_id, created_at. The system MUST NOT store any data beyond the declared fields.

#### Scenario: Lead stored with test results

- GIVEN a student completes the test and submits the lead form
- WHEN the API processes the submission
- THEN a row is inserted into `leads` with all fields populated and `test_results` contains the full ScoringResult array

#### Scenario: Duplicate email handling

- GIVEN a lead with email "maria@gmail.com" already exists
- WHEN a new submission with the same email arrives
- THEN the system creates a NEW lead record (not an upsert) to preserve historical submissions

### Requirement: API Route

The system MUST expose a POST API route at `/api/leads` that accepts the lead form payload, validates it with Zod, and inserts into Supabase. The route MUST return 201 on success and 400/422 on validation failure.

#### Scenario: API returns 201 on valid submission

- GIVEN a valid payload `{ name, email, phone, consent_given: true }`
- WHEN POST /api/leads receives it
- THEN the response is 201 with `{ id, created_at }`

#### Scenario: API returns 400 on invalid payload

- GIVEN a payload missing the `email` field
- WHEN POST /api/leads receives it
- THEN the response is 400 with a Zod error details object

### Requirement: Confirmation Message

After successful submission, the system MUST display a confirmation message with the student's name, thanking them, and informing them that Uniempresarial will contact them. The message MUST include the admissions email for follow-up questions.

#### Scenario: Confirmation shown

- GIVEN the lead form submitted successfully
- WHEN the response is received
- THEN a success message appears: "¡Gracias {name}! El equipo de admisiones de Uniempresarial te contactará pronto."

## Data Model

```typescript
interface LeadInput {
  name: string;          // 2-100 chars
  email: string;         // valid email format
  phone: string;         // valid Colombian phone
  consent_given: boolean;
}

interface LeadRecord extends LeadInput {
  id: string;            // UUID
  consent_timestamp: string;
  test_results: ScoringResult[];
  archetype_id: string;
  created_at: string;
}
```

## Edge Cases

- Network failure on submit: show "Error de conexión, intenta de nuevo" and preserve form data
- Supabase down: API returns 503, retry logic MAY be implemented client-side
- Consent checkbox state lost on page refresh: re-render unchecked (opt-in by default always)

## Dependencies

- Supabase client for database writes
- Zod 4 for validation schemas
- test-engine: test results to attach to lead record
- database-schema: `leads` table definition
