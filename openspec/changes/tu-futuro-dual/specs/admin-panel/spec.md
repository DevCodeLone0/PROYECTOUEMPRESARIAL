# Admin Panel Specification

## Purpose

Administrative dashboard for Uniempresarial staff to view, filter, and export student leads. Provides metrics overview, lead table with search/filter, individual lead detail view, and Excel export. Secured with Supabase Auth.

## Requirements

### Requirement: Authentication

The system MUST require login to access the admin panel. Authentication SHALL use Supabase Auth with email/password. Unauthenticated users MUST be redirected to the login page. Session expiry SHOULD be 24 hours.

#### Scenario: Unauthenticated access redirect

- GIVEN a user navigates to /admin without a session
- WHEN the page loads
- THEN the user is redirected to /admin/login

#### Scenario: Successful login

- GIVEN a staff member enters valid credentials
- WHEN they tap "Iniciar sesión"
- THEN they are redirected to /admin/dashboard and the session is active

#### Scenario: Invalid credentials

- GIVEN a staff member enters wrong credentials
- WHEN they tap "Iniciar sesión"
- THEN an error message appears: "Correo o contraseña incorrectos"

### Requirement: Dashboard Metrics

The system SHALL display a dashboard at /admin/dashboard with key metrics: total leads, leads this week, leads this month, and a chart showing leads per day for the last 30 days. Metrics MUST refresh on page load.

#### Scenario: Dashboard loads metrics

- GIVEN an authenticated admin visits /admin/dashboard
- WHEN the page loads
- THEN four metric cards display: total, this week, this month, and a bar chart of daily leads

#### Scenario: Empty dashboard state

- GIVEN there are zero leads in the database
- WHEN the dashboard loads
- THEN metrics show 0 and a message: "Aún no hay leads. ¡Comparte el test!"

### Requirement: Leads Table

The system MUST render a table at /admin/leads with columns: name, email, phone, archetype, compatibility %, date. The table MUST support sorting by date (newest first by default) and pagination (20 per page).

#### Scenario: Table displays leads

- GIVEN there are 45 leads in the database
- WHEN the admin visits /admin/leads
- THEN 20 leads display on page 1, sorted by date descending, with pagination controls

#### Scenario: Table pagination

- GIVEN there are 45 leads and the admin is on page 1
- WHEN they tap page 2
- THEN leads 21-40 display with page 2 highlighted

### Requirement: Lead Filters

The system MUST provide filters on the leads table: search by name/email, filter by archetype, filter by date range. Filters MUST apply client-side on the current page or trigger a new query.

#### Scenario: Search by name

- GIVEN the admin types "María" in the search box
- WHEN the filter applies
- THEN only leads whose name contains "María" are shown

#### Scenario: Filter by archetype

- GIVEN the admin selects "El Líder Estratégico" from the archetype dropdown
- WHEN the filter applies
- THEN only leads with that archetype are shown

#### Scenario: Filter by date range

- GIVEN the admin selects a start date of 2026-01-01 and end date of 2026-01-31
- WHEN the filter applies
- THEN only leads created within January 2026 are shown

### Requirement: Lead Detail View

The system MUST allow clicking a lead row to open a detail view. The detail view SHALL show: full contact info, consent status and timestamp, archetype result, full scoring breakdown (all 12 programs with percentages), and Q16 free-text answer if provided.

#### Scenario: View lead detail

- GIVEN the admin clicks a lead row
- WHEN the detail modal/page opens
- THEN all lead fields, consent info, and full test results are displayed

#### Scenario: Lead with Q16 answer

- GIVEN a lead has a Q16 free-text response
- WHEN the admin views the detail
- THEN the Q16 answer appears in a labeled section: "Lo que me apasiona"

### Requirement: Excel Export

The system MUST provide an "Exportar a Excel" button that generates an .xlsx file containing all leads (respecting current filters). The export MUST include all visible columns plus consent status and archetype. Export SHALL use the XLSX library.

#### Scenario: Export filtered leads

- GIVEN the admin has filtered leads by archetype "El Líder Estratégico"
- WHEN they tap "Exportar a Excel"
- THEN a .xlsx file downloads with only the filtered leads

#### Scenario: Export all leads

- GIVEN no filters are applied
- WHEN they tap "Exportar a Excel"
- THEN a .xlsx file downloads with all leads

### Requirement: Responsive Layout

The admin panel MUST be usable on desktop (1024px+) and tablet (768px). Mobile layout (below 768px) MAY show a simplified table. The sidebar navigation MUST collapse to a hamburger menu on tablet.

#### Scenario: Tablet layout

- GIVEN an admin views /admin/leads on a 768px viewport
- WHEN the page renders
- THEN the sidebar collapses to a hamburger and the table fits within the viewport

## Data Model

```typescript
interface AdminMetrics {
  totalLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  dailyLeads: { date: string; count: number }[]; // Last 30 days
}

interface LeadListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  archetype: string;
  topCompatibility: number;
  created_at: string;
}

interface LeadDetail extends LeadListItem {
  consent_given: boolean;
  consent_timestamp: string;
  test_results: ScoringResult[];
  q16_answer?: string;
}
```

## API Contracts

```
GET  /api/admin/metrics          → AdminMetrics
GET  /api/admin/leads?page=1     → { leads: LeadListItem[], total: number, page: number }
GET  /api/admin/leads/:id        → LeadDetail
GET  /api/admin/leads/export     → .xlsx file download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
```

## Edge Cases

- Export with >1000 leads: MAY show "Exportando..." loading state; file generated server-side
- Concurrent admin sessions: no conflict; reads are non-blocking
- Lead deleted during admin viewing: show "Lead no encontrado" on detail view

## Dependencies

- Supabase Auth for authentication
- Supabase database for leads queries
- XLSX library for Excel generation
- database-schema: `leads` table with RLS policies for admin access
