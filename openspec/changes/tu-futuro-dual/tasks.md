# Tasks: Tu Futuro Dual

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2000-2500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | pending |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Foundation: schemas, lib modules, constants, Zustand store | PR 1 | `npm run build` | N/A — static data modules, no runtime | All files in `src/lib/` + `src/stores/` |
| 2 | Google Sheets client + auth + API routes | PR 2 | `curl -X POST localhost:3000/api/leads` | Real Google Sheet test account | `src/lib/sheets.ts`, `src/lib/auth.ts`, `src/app/api/` |
| 3 | Test wizard flow (components + pages) | PR 3 | Manual: navigate /test, complete 16 questions | Student-facing wizard in browser | `src/components/test/`, `src/app/test/` |
| 4 | Results display + Lead form + Confetti | PR 4 | Manual: view results, submit lead form | End-to-end: test → results → form | `src/components/results/`, `src/components/lead/`, `src/app/resultados/` |
| 5 | Admin panel (login, dashboard, leads, export) | PR 5 | Manual: login, view metrics, filter leads, export .xlsx | Admin user in browser | `src/components/admin/`, `src/app/admin/`, `src/app/api/admin/` |

## Phase 1: Fundamentos — Lib, Schemas y Constants

- [ ] 1.1 Crear `src/lib/schemas.ts` — Esquemas Zod 4: LeadFormSchema (nombre, email, celular CO, consentimiento), AnswerSchema, ScoringResultSchema
- [ ] 1.2 Crear `src/lib/programs.ts` — Catálogo de 12 programas con id, nombre, modalidad (presencial/virtual), orden visual
- [ ] 1.3 Crear `src/lib/archetypes.ts` — Definiciones de arquetipos: id, nombre, emoji, descripción, whyDualModel, dimensión dominante
- [ ] 1.4 Crear `src/lib/scoring-matrix.ts` — Matriz de pesos 4×12 como constante TypeScript (intereses, personalidad, habilidades, motivación × 12 programas)
- [ ] 1.5 Crear `src/lib/scoring.ts` — Motor de scoring: normalizar dimensiones, calcular compatibilidad × programa, ordenar top 3, determinar arquetipo
- [ ] 1.6 Crear `src/stores/test-store.ts` — Zustand 5 con persist (localStorage): respuestas, paso actual, scores, reset, resume desde refresh

## Phase 2: Integración Backend — Google Sheets + Auth + API Routes

- [ ] 2.1 Crear `src/lib/sheets.ts` — Cliente Google Sheets API v4: init con service account, appendLead (POST), getLeads (GET), getMetrics (GET), rate limit awareness
- [ ] 2.2 Crear `src/lib/auth.ts` — NextAuth config: credentials provider, multiple admin users via env vars, JWT session strategy, role=admin
- [ ] 2.3 Crear `src/app/api/leads/route.ts` — POST /api/leads: validar Zod, rate limit 30/min/IP, append a Google Sheet tab "Leads", retornar 201
- [ ] 2.4 Crear `src/app/api/admin/metrics/route.ts` — GET /api/admin/metrics: leer Sheet, calcular total, semana, mes, leads diarios últimos 30 días
- [ ] 2.5 Crear `src/app/api/admin/leads/route.ts` — GET /api/admin/leads: leer Sheet, filtros (search, archetype, dateFrom, dateTo, modality), paginación server-side

## Phase 3: Test Wizard — Componentes y Páginas

- [ ] 3.1 Crear `src/app/layout.tsx` — Root layout: dark mode nativo, fuentes bold/modernas, metadata SEO, body con fondo oscuro
- [ ] 3.2 Crear `src/app/page.tsx` — Landing page: hero gamificado, CTA "Descubre tu carrera", scroll narrativo, logo prominente
- [ ] 3.3 Crear `src/components/test/ProgressBar.tsx` — Barra de progreso animada tipo "vida de videojuego": nivel, puntos, porcentaje con colores neón
- [ ] 3.4 Crear `src/components/test/QuestionCard.tsx` — Renderizador de pregunta: single-choice (cards), Likert-5, Likert-4, binary, free-text; feedback visual en selección
- [ ] 3.5 Crear `src/components/test/TestWizard.tsx` — Contenedor wizard: disclaimer inicial, navegación前后, integración con Zustand store, validación antes de avanzar
- [ ] 3.6 Crear `src/app/test/page.tsx` — Página /test: monta TestWizard, layout gamificado, descargo de responsabilidad visible

## Phase 4: Resultados + Formulario Lead + Confetti

- [ ] 4.1 Crear `src/components/ui/Confetti.tsx` — Animación de confetti al cargar resultados (canvas-based o lib ligera)
- [ ] 4.2 Crear `src/components/results/ArchetypeCard.tsx` — Tarjeta de arquetipo: emoji grande, nombre, descripción, "Por qué Modelo Dual"
- [ ] 4.3 Crear `src/components/results/ProgramCard.tsx` — Tarjeta expandible Top 3: nombre, modalidad, barra % compatibilidad, explicación expandible
- [ ] 4.4 Crear `src/components/results/RankingFull.tsx` — Ranking completo 12 programas: expandible "Ver los 12", barras %, orden descendente
- [ ] 4.5 Crear `src/components/lead/LeadForm.tsx` — Formulario: nombre, email, celular, checkbox consentimiento Ley 1581 (opt-in, texto legal completo), Zod validation, POST /api/leads
- [ ] 4.6 Crear `src/app/resultados/page.tsx` — Página /resultados: AretypeCard + Top3 + RankingFull + Confetti + LeadForm inline + CTA

## Phase 5: Panel Admin — Login, Dashboard, Leads, Export

- [ ] 5.1 Crear `src/app/admin/layout.tsx` — Layout admin: sidebar colapsable (hamburger en tablet), protección de rutas con NextAuth
- [ ] 5.2 Crear `src/app/admin/login/page.tsx` — Login page: formulario credentials, NextAuth signIn, redirección a /admin/dashboard
- [ ] 5.3 Crear `src/components/admin/Dashboard.tsx` — Dashboard: 4 cards métricas (total, semana, mes) + gráfico barras diarias (recharts), estado vacío
- [ ] 5.4 Crear `src/components/admin/LeadsTable.tsx` — Tabla leads: columnas (nombre, email, celular, carrera top, compatibilidad, fecha), búsqueda, filtros (arquetipo, fecha, modalidad), paginación
- [ ] 5.5 Crear `src/components/admin/LeadDetail.tsx` — Panel lateral: contacto completo, consentimiento + timestamp, arquetipo, ranking 12 programas, Q16 si existe
- [ ] 5.6 Crear `src/app/admin/dashboard/page.tsx` — Página /admin/dashboard: monta Dashboard component
- [ ] 5.7 Crear `src/app/admin/leads/page.tsx` — Página /admin/leads: monta LeadsTable + LeadDetail side panel + botón exportar Excel (xlsx library)
