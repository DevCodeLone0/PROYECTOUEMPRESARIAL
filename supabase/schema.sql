-- Tu Futuro Dual — Supabase schema (Postgres)
-- Ejecutar en el SQL Editor de Supabase (Dashboard → SQL Editor → New query)

-- ── Leads ──
-- Un lead = un envío de formulario de un estudiante que completó el test.
-- Dedupe por email: el mismo email hace UPSERT (actualiza en vez de duplicar).
create table if not exists public.leads (
  id bigint generated always as identity primary key,

  -- Contacto
  email text not null unique,
  nombre text not null,
  celular text,
  consentimiento boolean not null default false,

  -- Resultado vocacional
  arquetipo text,                  -- id del arquetipo (constructor, investigador, ...)
  modality text,                   -- presencial | virtual
  confidence text,                 -- high | medium | low
  es_prueba boolean not null default false,

  -- Puntajes legacy (compatibilidad con la hoja original)
  puntaje_intereses numeric,
  puntaje_personalidad numeric,
  puntaje_habilidades numeric,
  puntaje_motivacion numeric,

  -- RIASEC (0-100)
  riasec_r numeric,
  riasec_i numeric,
  riasec_a numeric,
  riasec_s numeric,
  riasec_e numeric,
  riasec_c numeric,

  -- Top 3 carreras
  carrera_1 text,
  compatibilidad_1 numeric,
  carrera_2 text,
  compatibilidad_2 numeric,
  carrera_3 text,
  compatibilidad_3 numeric,

  -- Datos completos (JSONB)
  respuestas_raw jsonb,            -- las 25 respuestas (fuente de verdad)
  aptitude_vec jsonb,              -- 4 slots [logical, planning, creative, social]
  values_vec jsonb,                -- 4 slots [autonomy, risk-tolerance, flexibility, helping]
  ranking jsonb,                   -- ranking completo de programas

  -- Workflow admin
  estado text not null default 'nuevo',   -- nuevo | contactado | en_proceso | admitido | descartado
  notas text not null default '',
  actualizado_en timestamptz,

  -- Metadatos
  request_id text,                 -- idempotencia: mismo requestId no duplica
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para los filtros del panel admin
create index if not exists leads_estado_idx on public.leads (estado);
create index if not exists leads_arquetipo_idx on public.leads (arquetipo);
create index if not exists leads_modality_idx on public.leads (modality);
create index if not exists leads_timestamp_idx on public.leads (timestamp desc);
create index if not exists leads_es_prueba_idx on public.leads (es_prueba);
-- Compuesto para el query default del dashboard (filtro por estado + orden por fecha)
create index if not exists leads_estado_timestamp_idx
  on public.leads (estado, timestamp desc);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Row Level Security: sin policies → solo service_role (el servidor) accede.
-- El cliente nunca toca Supabase directamente; todo pasa por los API routes.
alter table public.leads enable row level security;
