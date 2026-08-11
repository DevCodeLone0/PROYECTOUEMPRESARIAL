import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Supabase no configurado: agrega SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY " +
      "en .env.local (Dashboard → Project Settings → API)"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Lead as read from Postgres (snake_case columns → propiedades de la app).
 * Los campos JSONB se devuelven como strings JSON serializadas para
 * compatibilidad con el render actual.
 */
export interface LeadRow {
  id: number;
  timestamp: string;
  nombre: string;
  email: string;
  celular: string;
  consentimiento: boolean;
  puntaje_intereses: number;
  puntaje_personalidad: number;
  puntaje_habilidades: number;
  puntaje_motivacion: number;
  arquetipo: string;
  modality: string | null;
  confidence: string | null;
  esPrueba: boolean;
  carrera_1: string;
  compatibilidad_1: number;
  carrera_2: string;
  compatibilidad_2: number;
  carrera_3: string;
  compatibilidad_3: number;
  respuestas_raw: string;
  aptitude_vec: string | null;
  values_vec: string | null;
  ranking: string | null;
  riasec_r: number;
  riasec_i: number;
  riasec_a: number;
  riasec_s: number;
  riasec_e: number;
  riasec_c: number;
  estado: string;
  notas: string;
  actualizado_en: string;
  requestId?: string;
}

/**
 * Lead listo para insertar/actualizar: SIN id, timestamp, estado, notas y
 * actualizado_en — la BD aplica sus defaults (estado 'nuevo', timestamp now()).
 * El upsert por email solo actualiza los campos presentes, preservando
 * estado/notas puestos por el admin.
 */
export type LeadRowInsert = Omit<
  LeadRow,
  | "id"
  | "timestamp"
  | "estado"
  | "notas"
  | "actualizado_en"
  | "modality"
  | "confidence"
  | "aptitude_vec"
  | "values_vec"
  | "ranking"
> & {
  modality?: string | null;
  confidence?: string | null;
  aptitude_vec?: string | null;
  values_vec?: string | null;
  ranking?: string | null;
};

/**
 * Escapa comodines de LIKE (% _ \) para que el search no actúe como wildcard.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Normaliza un valor jsonb (objeto/array/null) a string JSON, o null si no hay.
 */
function stringifyJsonb(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Normaliza timestamps de Postgres (Date) a ISO string.
 */
function toIso(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function toNumber(value: unknown): number {
  return Number(value) || 0;
}

function mapLeadRow(row: Record<string, unknown>): LeadRow {
  return {
    id: Number(row.id),
    timestamp: toIso(row.timestamp),
    nombre: String(row.nombre ?? ""),
    email: String(row.email ?? ""),
    celular: String(row.celular ?? ""),
    consentimiento: Boolean(row.consentimiento),
    puntaje_intereses: toNumber(row.puntaje_intereses),
    puntaje_personalidad: toNumber(row.puntaje_personalidad),
    puntaje_habilidades: toNumber(row.puntaje_habilidades),
    puntaje_motivacion: toNumber(row.puntaje_motivacion),
    arquetipo: String(row.arquetipo ?? ""),
    modality: row.modality ? String(row.modality) : null,
    confidence: row.confidence ? String(row.confidence) : null,
    esPrueba: Boolean(row.es_prueba),
    carrera_1: String(row.carrera_1 ?? ""),
    compatibilidad_1: toNumber(row.compatibilidad_1),
    carrera_2: String(row.carrera_2 ?? ""),
    compatibilidad_2: toNumber(row.compatibilidad_2),
    carrera_3: String(row.carrera_3 ?? ""),
    compatibilidad_3: toNumber(row.compatibilidad_3),
    respuestas_raw: stringifyJsonb(row.respuestas_raw) ?? "{}",
    aptitude_vec: stringifyJsonb(row.aptitude_vec),
    values_vec: stringifyJsonb(row.values_vec),
    ranking: stringifyJsonb(row.ranking),
    riasec_r: toNumber(row.riasec_r),
    riasec_i: toNumber(row.riasec_i),
    riasec_a: toNumber(row.riasec_a),
    riasec_s: toNumber(row.riasec_s),
    riasec_e: toNumber(row.riasec_e),
    riasec_c: toNumber(row.riasec_c),
    estado: String(row.estado ?? "") || "nuevo",
    notas: String(row.notas ?? ""),
    actualizado_en: toIso(row.actualizado_en),
  };
}

const LEAD_COLUMNS = [
  "id",
  "timestamp",
  "nombre",
  "email",
  "celular",
  "consentimiento",
  "puntaje_intereses",
  "puntaje_personalidad",
  "puntaje_habilidades",
  "puntaje_motivacion",
  "arquetipo",
  "modality",
  "confidence",
  "es_prueba",
  "carrera_1",
  "compatibilidad_1",
  "carrera_2",
  "compatibilidad_2",
  "carrera_3",
  "compatibilidad_3",
  "respuestas_raw",
  "aptitude_vec",
  "values_vec",
  "ranking",
  "riasec_r",
  "riasec_i",
  "riasec_a",
  "riasec_s",
  "riasec_e",
  "riasec_c",
  "estado",
  "notas",
  "actualizado_en",
].join(", ");

export interface LeadFilters {
  search?: string;
  archetype?: string;
  estado?: string;
  dateFrom?: string;
  dateTo?: string;
  modality?: string;
  esPrueba?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Persiste un lead con dedupe por email: si el email ya existe, se actualizan
 * solo los campos del payload (nunca estado/notas del admin). Devuelve el id
 * únicamente cuando el lead fue INSERTADO (el route lo usa para responder 201).
 */
export async function upsertLead(
  lead: LeadRowInsert
): Promise<{ ok: boolean; id?: number }> {
  const row: Record<string, unknown> = {
    nombre: lead.nombre,
    email: lead.email,
    celular: lead.celular,
    consentimiento: lead.consentimiento,
    puntaje_intereses: lead.puntaje_intereses,
    puntaje_personalidad: lead.puntaje_personalidad,
    puntaje_habilidades: lead.puntaje_habilidades,
    puntaje_motivacion: lead.puntaje_motivacion,
    arquetipo: lead.arquetipo,
    carrera_1: lead.carrera_1,
    compatibilidad_1: lead.compatibilidad_1,
    carrera_2: lead.carrera_2,
    compatibilidad_2: lead.compatibilidad_2,
    carrera_3: lead.carrera_3,
    compatibilidad_3: lead.compatibilidad_3,
    respuestas_raw: lead.respuestas_raw,
    riasec_r: lead.riasec_r,
    riasec_i: lead.riasec_i,
    riasec_a: lead.riasec_a,
    riasec_s: lead.riasec_s,
    riasec_e: lead.riasec_e,
    riasec_c: lead.riasec_c,
  };
  if (lead.requestId) row.request_id = lead.requestId;
  if (lead.esPrueba !== undefined) row.es_prueba = lead.esPrueba;
  if (lead.modality !== undefined) row.modality = lead.modality;
  if (lead.confidence !== undefined) row.confidence = lead.confidence;
  if (lead.aptitude_vec !== undefined) row.aptitude_vec = lead.aptitude_vec;
  if (lead.values_vec !== undefined) row.values_vec = lead.values_vec;
  if (lead.ranking !== undefined) row.ranking = lead.ranking;

  const { data: existing, error: selectError } = await supabase
    .from("leads")
    .select("id")
    .eq("email", row.email)
    .maybeSingle();
  if (selectError) return { ok: false };

  if (existing) {
    const { error } = await supabase
      .from("leads")
      .update(row)
      .eq("id", existing.id);
    if (error) return { ok: false };
    return { ok: true };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("leads")
    .insert(row)
    .select("id")
    .maybeSingle();
  if (!insertError && inserted) {
    return { ok: true, id: Number(inserted.id) };
  }

  // Carrera contra el UNIQUE de email (dos POST simultáneos): degradar a update.
  if (insertError?.code === "23505") {
    const { data: raced } = await supabase
      .from("leads")
      .select("id")
      .eq("email", row.email)
      .maybeSingle();
    if (raced) {
      const { error } = await supabase
        .from("leads")
        .update(row)
        .eq("id", raced.id);
      if (!error) return { ok: true };
    }
  }

  return { ok: false };
}

/**
 * Filtros server-side reales sobre Postgres (ILIIKE, eq, rangos de fecha sobre
 * `timestamp`, paginación con range + count exacto).
 */
export async function getLeads(
  filters: LeadFilters = {}
): Promise<{ leads: LeadRow[]; total: number }> {
  const {
    search,
    archetype,
    estado,
    dateFrom,
    dateTo,
    modality,
    esPrueba,
    page = 1,
    pageSize = 20,
  } = filters;

  // Nota: postgrest-js v1 (bundled con supabase-js 2.112+) ya no acepta
  // select(columns, { count, head }): el count se pide vía Prefer: count=exact
  // y llega en Content-Range (cuenta TODOS los filtrados, antes del range).
  let query = supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .setHeader("Prefer", "count=exact");

  if (search?.trim()) {
    const term = escapeLike(search.trim());
    query = query.or(`nombre.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (archetype) query = query.eq("arquetipo", archetype);
  if (estado) query = query.eq("estado", estado);
  if (modality) query = query.eq("modality", modality);
  if (typeof esPrueba === "boolean") query = query.eq("es_prueba", esPrueba);
  if (dateFrom) query = query.gte("timestamp", `${dateFrom}T00:00:00.000`);
  if (dateTo) query = query.lte("timestamp", `${dateTo}T23:59:59.999`);

  const start = (page - 1) * pageSize;
  const { data, count, error } = await query
    .order("timestamp", { ascending: false })
    .range(start, start + pageSize - 1);
  if (error) throw error;

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return {
    leads: rows.map(mapLeadRow),
    total: count ?? 0,
  };
}

/**
 * Actualiza estado/notas de un lead existente (toque actualizado_en).
 */
export async function updateLead(
  id: number,
  patch: { estado?: string; notas?: string }
): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from("leads")
    .update({ ...patch, actualizado_en: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false };
  return { ok: true };
}

/**
 * Elimina un lead por id. `deleted=false` si el id no existía.
 */
export async function deleteLead(
  id: number
): Promise<{ ok: boolean; deleted: boolean }> {
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, deleted: false };
  return { ok: true, deleted: (data ?? []).length > 0 };
}

export interface AdminMetrics {
  total: number;
  thisWeek: number;
  thisMonth: number;
  daily: { date: string; count: number }[];
}

/**
 * Métricas con counts server-side. Incluye leads de prueba (es_prueba) igual
 * que el comportamiento anterior de la hoja.
 */
export async function getMetrics(): Promise<AdminMetrics> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const countAll = supabase
    .from("leads")
    .select("id")
    .setHeader("Prefer", "count=exact")
    .limit(0);

  const [totalRes, weekRes, monthRes] = await Promise.all([
    countAll,
    countAll.gte("timestamp", weekAgo),
    countAll.gte("timestamp", monthAgo),
  ]);
  if (totalRes.error || weekRes.error || monthRes.error) {
    throw totalRes.error ?? weekRes.error ?? monthRes.error;
  }

  const { data, error } = await supabase
    .from("leads")
    .select("timestamp")
    .gte("timestamp", monthAgo);
  if (error) throw error;

  const timestamps = (data ?? []) as unknown as {
    timestamp: string | Date | null;
  }[];

  // Counts diarios de los últimos 30 días por día colombiano (UTC-5), igual
  // que el approach de la hoja: leads cerca de medianoche caen en el día local.
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
    dailyMap[key] = 0;
  }

  timestamps.forEach((row) => {
    const ts = row.timestamp ? new Date(row.timestamp) : null;
    if (!ts || Number.isNaN(ts.getTime())) return;
    const dateKey = ts.toLocaleDateString("en-CA", {
      timeZone: "America/Bogota",
    });
    if (dailyMap[dateKey] !== undefined) {
      dailyMap[dateKey]++;
    }
  });

  return {
    total: totalRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    thisMonth: monthRes.count ?? 0,
    daily: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
  };
}
