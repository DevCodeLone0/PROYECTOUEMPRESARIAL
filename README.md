# Tu Futuro Dual — Test Vocacional Uniempresarial

Plataforma de orientación vocacional para la Fundación Universitaria
Empresarial de la Cámara de Comercio de Bogotá (Uniempresarial). El
estudiante completa un test de 25 preguntas basado en el modelo RIASEC
y obtiene una recomendación personalizada de carrera y modalidad
(presencial / virtual) dentro del Modelo Dual.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Lenguaje**: TypeScript 5 (strict)
- **UI**: Tailwind CSS 4, React 19, Zustand 5
- **Gráficos**: Recharts 3 (radar RIASEC)
- **Validación**: Zod 4 (cliente + servidor)
- **Auth**: NextAuth v5 beta (credentials provider, JWT session)
- **BD**: Supabase (Postgres) via `@supabase/supabase-js`
- **Export**: ExcelJS 4 (decorado con identidad de marca)
- **Tests**: Vitest 4 (139 tests de lógica de scoring)

## Estructura

```
src/
  app/
    page.tsx              # Landing
    test/page.tsx         # Test vocacional (25 preguntas en 4 capas)
    resultados/page.tsx   # Resultados (arquetipo, RIASEC, top 3, ranking)
    admin/
      page.tsx            # Dashboard (métricas)
      leads/page.tsx      # Gestión de leads (filtros, export Excel)
      login/page.tsx      # Login admin
    api/
      leads/route.ts      # POST lead (Zod + Supabase upsert + rate limit)
      admin/
        leads/route.ts    # GET/PATCH/DELETE leads (protegido)
        metrics/route.ts  # Métricas del dashboard (protegido)
      auth/[...nextauth]  # NextAuth handler
  lib/
    supabase.ts           # Cliente Supabase (service_role, server-only)
    auth.ts               # NextAuth config (brute-force protection)
    schemas.ts            # Zod: LeadPayloadSchema, LeadFormSchema, etc.
    programs.ts           # Catálogo de 7 carreras (presencial + virtual)
    scoring/              # Algoritmos de scoring (RIASEC, aptitudes, valores)
    questions/            # Banco de 25 preguntas
  components/
    test/TestWizard.tsx   # Orquestador del test
    lead/LeadFormStep.tsx # Captura de datos del lead (form unificado)
    results/              # ArchetypeCard, RadarChart, ProgramCard, etc.
    layout/Header.tsx     # Header con logo + nav responsive

supabase/
  schema.sql              # Esquema de la tabla leads (36 columnas + índices)
```

## Configuración local

### 1. Clonar e instalar

```bash
git clone https://github.com/DevCodeLone0/PROYECTOUEMPRESARIAL.git
cd PROYECTOUEMPRESARIAL
npm install
```

### 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | Project URL (https://xxxx.supabase.co) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (solo server, nunca exponer al cliente) |
| `NEXTAUTH_SECRET` | Secreto aleatorio (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Solo dev local: `http://localhost:3000`. En Vercel usar `AUTH_URL` |
| `ADMIN_EMAILS` | Comma-separated: `admin@uniempresarial.edu.co` |
| `ADMIN_PASSWORDS` | Comma-separated (deben coincidir 1:1 con ADMIN_EMAILS) |

### 3. Base de datos

Ejecuta `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase.
Esto crea la tabla `public.leads` (36 columnas), índices, trigger de
`updated_at` y habilita RLS.

### 4. Desarrollo

```bash
npm run dev    # http://localhost:3000
```

### 5. Producción (build local)

```bash
npm run build  # tsc --noEmit + vitest run + next build
npm start      # servidor de producción en :3000
```

## Deploy en Vercel

1. Importar el repo en [vercel.com/new](https://vercel.com/new)
2. Framework Preset: **Next.js** (auto-detectado)
3. Configurar las env vars (ver tabla arriba) en Project Settings →
   Environment Variables. Usar `AUTH_URL=https://tu-dominio.vercel.app`
   en lugar de `NEXTAUTH_URL`.
4. Deploy. El comando `build` corre `tsc + vitest + next build`
   automáticamente.

## Tests

```bash
npm test           # 139 tests, vitest run
npm run test:watch # modo watch
```

Los tests cubren la lógica de scoring: RIASEC, arquetipos, aptitudes,
modality, y el pipeline completo.

## Modos

- **Test real**: `/test` — los leads se guardan con `es_prueba=false`
- **Modo prueba**: `/test?prueba=1` — los leads se guardan con
  `es_prueba=true` y se filtran del panel admin por defecto

## Licencia

Propiedad de Uniempresarial. Todos los derechos reservados.