# Database Schema Specification

## Purpose

Define the Supabase database schema for the Tu Futuro Dual platform. Covers all tables, columns, types, relationships, and Row Level Security (RLS) policies. This is the single source of truth for the data model.

## Requirements

### Requirement: Leads Table

The system MUST have a `leads` table with the following columns: `id` (UUID, PK, default uuid_generate_v4()), `name` (text, NOT NULL), `email` (text, NOT NULL), `phone` (text, NOT NULL), `consent_given` (boolean, NOT NULL, default false), `consent_timestamp` (timestamptz, NOT NULL), `test_results` (jsonb, NOT NULL), `archetype_id` (text, NOT NULL), `q16_answer` (text, nullable), `created_at` (timestamptz, default now()). An index on `email` MUST exist for duplicate lookup.

#### Scenario: Insert lead record

- GIVEN a student submits the lead form
- WHEN the INSERT executes
- THEN a row appears in `leads` with all required fields populated and `id` auto-generated

#### Scenario: Query leads by date

- GIVEN an admin requests leads for January 2026
- WHEN the query filters by `created_at`
- THEN the index on `created_at` is used (if present) and rows return efficiently

### Requirement: Admin Users Table

The system MUST use Supabase Auth for admin users. No separate `admin_users` table is needed. Admin access is managed via Supabase Auth roles and RLS policies that check `auth.uid()` against a predefined set of admin user IDs or an `is_admin` flag in a `profiles` table.

#### Scenario: Admin RLS check

- GIVEN an authenticated user with admin role
- WHEN they query the `leads` table
- THEN RLS allows the read; non-admin users are denied

### Requirement: Program Reference Data

The system MUST define a `programs` table (or Supabase enum/config) with 12 entries: 7 presenciales (Ing. Software, Negocios Turísticos y Hoteleros, Admin Empresas, Negocios Internacionales, Finanzas y Comercio Exterior, Ing. Industrial, Marketing) and 5 virtuales (Ing. Software Virtual, Admin Empresas Virtual, Negocios Turísticos y Hoteleros Virtual, Ing. Industrial Virtual, Marketing Virtual). Each entry has `id`, `name`, `modality` (presencial/virtual), and `display_order`.

#### Scenario: Program list is complete

- GIVEN the system starts fresh
- WHEN the programs table is queried
- THEN exactly 12 programs exist with correct names and modalities

### Requirement: Scoring Matrix Table

The system MUST have a `scoring_matrix` table (or JSONB config) that maps dimension × program weights. Columns: `dimension` (text: 'intereses', 'personalidad', 'habilidades', 'motivacion'), `program_id` (UUID FK → programs), `weight` (numeric, 0-1). All 4×12 = 48 combinations MUST have entries.

#### Scenario: Scoring matrix is complete

- GIVEN the system starts fresh
- WHEN the scoring matrix is queried
- THEN 48 rows exist covering all dimension-program combinations

### Requirement: Row Level Security

The system MUST enable RLS on the `leads` table. Policies: (1) Anonymous users MAY INSERT (to submit the lead form), (2) authenticated admin users MAY SELECT all rows, (3) authenticated admin users MAY UPDATE and DELETE. Non-admin authenticated users MUST NOT access leads.

#### Scenario: Anonymous lead submission

- GIVEN an unauthenticated request to INSERT into `leads`
- WHEN RLS evaluates the policy
- THEN the insert is ALLOWED (public form submission)

#### Scenario: Non-admin read blocked

- GIVEN an authenticated non-admin user
- WHEN they SELECT from `leads`
- THEN RLS returns zero rows

### Requirement: Migrations

The system MUST use Supabase migrations stored in `supabase/migrations/`. Each migration file MUST be timestamped and idempotent. The initial migration creates all tables, indexes, RLS policies, and seed data for programs and scoring matrix.

#### Scenario: Migration applies cleanly

- GIVEN a fresh Supabase project
- WHEN `supabase db push` or migration apply runs
- THEN all tables, RLS, and seed data are created without errors

### Requirement: Supabase Client Configuration

The system MUST configure separate Supabase clients: one for anonymous public access (lead form) and one for authenticated admin access. Environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` MUST be set.

#### Scenario: Public client inserts lead

- GIVEN the public Supabase client is initialized with anon key
- WHEN it inserts into `leads`
- THEN the insert succeeds per RLS policy

## Schema DDL (initial migration)

```sql
-- Programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('presencial', 'virtual')),
  display_order INT NOT NULL
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  test_results JSONB NOT NULL,
  archetype_id TEXT NOT NULL,
  q16_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Scoring Matrix
CREATE TABLE scoring_matrix (
  dimension TEXT NOT NULL CHECK (dimension IN ('intereses', 'personalidad', 'habilidades', 'motivacion')),
  program_id UUID NOT NULL REFERENCES programs(id),
  weight NUMERIC(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
  PRIMARY KEY (dimension, program_id)
);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all leads"
  ON leads FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Admins can update leads"
  ON leads FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Admins can delete leads"
  ON leads FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );
```

## Edge Cases

- Supabase project region: MUST be closest to Colombia (us-east-1 or south-america-east-1)
- Connection pooling: use Supabase connection pooler for serverless (Next.js API routes)
- RLS performance: admin policies using subquery on auth.users; consider materialized view if >10k leads

## Dependencies

- Supabase project with Auth enabled
- Postgres extensions: uuid-ossp
- Environment variables for client configuration
- Admin user accounts created via Supabase Auth dashboard
