# Design: Tu Futuro Dual

## Technical Approach

Full rebuild de la plataforma de orientación vocacional de Uniempresarial. Next.js 15 App Router + React 19 en frontend. Google Sheets API v4 como base de datos (cero costo). Wizard de 16 preguntas con scoring ponderado 4×12. Panel admin con dashboard, filtros y exportación Excel. Todo desplegado en Vercel free tier.

**Decisión crítica de almacenamiento**: Las specs originales referencian Supabase, pero la decisión de arquitectura del usuario es explícita — Google Sheets API, NO Supabase. Este design document reconcilia esa decisión. Todas las consultas, inserts y operaciones CRUD van contra Google Sheets vía Server Actions.

## Architecture Decisions

### Decision: Google Sheets como almacenamiento

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Supabase | RLS, auth, SQL queries, real-time | **RECHAZADO** — costo potencial, dependencia externa |
| Google Sheets API | Gratis, zero infra, fácil de monitorear | **ELEGIDO** — cumple "cero costo" |
| Airtable | API rica, gratis tier generoso | Rechazado — menos control, rate limits bajos |

**Rationale**: Uniempresarial necesita cero costo. Google Sheets es suficiente para el volumen esperado (~100 leads/día max). La limitación de 60 req/min no es problema. Tradeoff: queries en memoria en vez de SQL.

### Decision: Autenticación admin

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Supabase Auth | RLS nativo, session management | Rechazado — requiere Supabase |
| NextAuth.js | Flexible, múltiples providers | **ELEGIDO** — simple, credentials provider |
| JWT manual | Control total, más código | Rechazado — innecesariamente complejo |

**Rationale**: NextAuth con credentials provider usando variables de entorno para credenciales admin. Múltiples usuarios con mismo rol admin. Sesión via JWT en cookie.

### Decision: State management del test

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Zustand 5 | Ligero, persist middleware, testable | **ELEGIDO** — mencionado en specs |
| React Context | Built-in, sin deps | Rechazado — re-renders innecesarios |
| URL state | Shareable, no refresh loss | Rechazado — 16 preguntas = URL larga |

**Rationale**: Zustand con persist middleware (localStorage) para sobrevivir refresh. State incluye: respuestas, paso actual, scores calculados.

## Data Flow

```
Student → Landing (/)
  ↓
Test Wizard (/test)
  ├── Disclaimer → Q1..Q15 → Q16 (opcional)
  ├── Zustand store (client-side)
  └── Scoring engine (client-side)
  ↓
Results (/resultados)
  ├── Archetype card
  ├── Top 3 programs
  └── Full ranking (12)
  ↓
Lead Form (inline)
  ├── Zod validation
  └── POST /api/leads → Google Sheets "Leads" tab
  ↓
Confirmation

Admin → /admin/login → NextAuth
  ↓
Dashboard (/admin/dashboard)
  ├── GET /api/admin/metrics → Google Sheets
  └── Charts (recharts)
  ↓
Leads Table (/admin/leads)
  ├── GET /api/admin/leads → Google Sheets
  ├── Client-side filters (search, archetype, date, modality)
  └── Excel export (xlsx library, client-side)
```

## Google Sheets Schema

**Tab: "Leads"** — 1 fila = 1 lead

| Columna | Tipo | Ejemplo |
|---------|------|---------|
| A: timestamp | ISO 8601 | 2026-08-05T14:30:00Z |
| B: nombre | text | María García |
| C: email | text | maria@gmail.com |
| D: celular | text | 3142084103 |
| E: consentimiento | boolean | TRUE |
| F: puntaje_intereses | number | 78 |
| G: puntaje_personalidad | number | 85 |
| H: puntaje_habilidades | number | 62 |
| I: puntaje_motivacion | number | 91 |
| J: arquetipo | text | El Líder Estratégico |
| K: carrera_1 | text | Ing. Software |
| L: compatibilidad_1 | number | 92 |
| M: carrera_2 | text | Negocios Internacionales |
| N: compatibilidad_2 | number | 87 |
| O: carrera_3 | text | Marketing |
| P: compatibilidad_3 | number | 81 |
| Q: respuestas_raw | JSON string | {"Q1":"a","Q2":"c",...} |

**Rate limit considerations**: Admin fetches ALL leads on page load, filters client-side. Lead submission = 1 write per student. 60 req/min limit is sufficient.

## Scoring Algorithm

**Matriz de compatibilidad 4×12** — stored as TypeScript constant:

```typescript
// src/lib/scoring-matrix.ts
type Dimension = 'intereses' | 'personalidad' | 'habilidades' | 'motivacion';
type ProgramId = string; // 12 programs

const WEIGHTS: Record<Dimension, Record<ProgramId, number>> = {
  intereses: { /* 12 weights, sum ~= 1 per dimension */ },
  personalidad: { /* ... */ },
  habilidades: { /* ... */ },
  motivacion: { /* ... */ },
};
```

**Algorithm**:
1. Normalize each dimension score to 0-1 (divide by max possible)
2. For each program: `compatibility = Σ(dimension_score × weight[d][program]) × 100`
3. Sort all 12 programs descending by compatibility
4. Top 3 = results, full array = ranking
5. Archetype = dominant dimension combination

**Dimension scoring**:
- Intereses (Q1-Q3): Map option index to RIASEC scale → dimension score
- Personalidad (Q4-Q8): Sum Likert values → normalize to 0-1
- Habilidades (Q9-Q12): Sum level values → normalize to 0-1
- Motivación (Q13-Q15): Binary mapping → dimension score

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/layout.tsx` | Create | Root layout, dark mode, fonts |
| `src/app/page.tsx` | Create | Landing page |
| `src/app/test/page.tsx` | Create | Test wizard page |
| `src/app/resultados/page.tsx` | Create | Results display page |
| `src/app/admin/layout.tsx` | Create | Admin layout with sidebar |
| `src/app/admin/page.tsx` | Create | Admin dashboard |
| `src/app/admin/login/page.tsx` | Create | Admin login |
| `src/app/admin/leads/page.tsx` | Create | Leads table |
| `src/app/api/leads/route.ts` | Create | POST lead → Google Sheets |
| `src/app/api/admin/metrics/route.ts` | Create | GET metrics from Sheets |
| `src/app/api/admin/leads/route.ts` | Create | GET leads from Sheets |
| `src/components/test/ProgressBar.tsx` | Create | Gamified progress bar |
| `src/components/test/QuestionCard.tsx` | Create | Single question renderer |
| `src/components/test/TestWizard.tsx` | Create | Wizard container |
| `src/components/results/ArchetypeCard.tsx` | Create | Archetype display |
| `src/components/results/ProgramCard.tsx` | Create | Top 3 expandible card |
| `src/components/results/RankingFull.tsx` | Create | Full 12-program ranking |
| `src/components/lead/LeadForm.tsx` | Create | Contact form with Zod |
| `src/components/admin/Dashboard.tsx` | Create | Metrics cards + chart |
| `src/components/admin/LeadsTable.tsx` | Create | Filterable table |
| `src/components/admin/LeadDetail.tsx` | Create | Side panel detail |
| `src/components/ui/Confetti.tsx` | Create | Confetti animation |
| `src/stores/test-store.ts` | Create | Zustand store |
| `src/lib/sheets.ts` | Create | Google Sheets API client |
| `src/lib/scoring.ts` | Create | Scoring engine |
| `src/lib/scoring-matrix.ts` | Create | Weight matrix constant |
| `src/lib/programs.ts` | Create | Program catalog (12) |
| `src/lib/archetypes.ts` | Create | Archetype definitions |
| `src/lib/schemas.ts` | Create | Zod validation schemas |
| `src/lib/auth.ts` | Create | NextAuth config |

## Interfaces / Contracts

```typescript
// API: POST /api/leads
interface LeadPayload {
  nombre: string;      // 2-100 chars
  email: string;       // valid email
  celular: string;     // CO phone regex
  consentimiento: boolean; // MUST be true
  respuestas: Record<string, string | number>;
  scores: { intereses: number; personalidad: number; habilidades: number; motivacion: number };
  arquetipo: string;
  top3: { carrera: string; compatibilidad: number }[];
}
// Response: 201 { ok: true } | 400 { errors: ZodError }

// API: GET /api/admin/leads
// Query: ?page=1&search=&archetype=&dateFrom=&dateTo=&modality=
// Response: { leads: LeadRow[], total: number, page: number }

// API: GET /api/admin/metrics
// Response: { total, thisWeek, thisMonth, daily: {date, count}[] }
```

## Testing Strategy

| Layer | Qué testear | Approach |
|-------|------------|----------|
| Unit | Scoring engine, Zod schemas, program catalog | Vitest, mocks de matrices |
| Integration | API routes ↔ Google Sheets | MSW mock de Sheets API |
| E2E | Flujo completo test → results → lead submit | Playwright |
| Visual | Gamified UI, dark mode, responsive | Storybook + Chromatic (futuro) |

## Threat Matrix

Rate limiting moderado en API routes: máx 30 requests/min por IP en POST /api/leads. No agresivo pero suficiente para prevenir spam básico.

## Migration / Rollout

No migration required — greenfield. Google Sheet "Leads" se crea vacía. Programs y scoring matrix son constantes TypeScript, no DB seed data.

**Deploy strategy**:
1. Push a main → Vercel auto-deploys
2. Variables de entorno en Vercel: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_KEY, NEXTAUTH_SECRET
3. Google Sheet compartido con service account (Editor permission)

## Open Questions — RESUELTAS

- [x] ¿Quién define los pesos exactos de la matriz 4×12? → **El usuario los define manualmente**
- [x] ¿Las credenciales admin son un solo usuario o múltiples? → **1 admin role, múltiples usuarios**
- [x] ¿Se necesita rate limiting? → **Sí, moderado (no agresivo)**
- [x] ¿Exportar Excel con los 12 programas o solo Top 3? → **Solo Top 3**
