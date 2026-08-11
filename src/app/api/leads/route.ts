import { NextRequest, NextResponse } from "next/server";
import { LeadPayloadSchema } from "@/lib/schemas";
import { upsertLead, type LeadRowInsert } from "@/lib/supabase";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate with Zod
    const result = LeadPayloadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    // Build the insert row. Sin estado/notas/timestamp: la BD aplica sus
    // defaults (estado 'nuevo', timestamp now()). El upsert por email solo
    // actualiza estos campos, preservando estado/notas del admin.
    const leadRow: LeadRowInsert = {
      nombre: data.nombre,
      email: data.email,
      celular: data.celular,
      consentimiento: data.consentimiento,
      puntaje_intereses: data.scores.intereses,
      puntaje_personalidad: data.scores.personalidad,
      puntaje_habilidades: data.scores.habilidades,
      puntaje_motivacion: data.scores.motivacion,
      arquetipo: data.arquetipo,
      modality: data.modality,
      confidence: data.confidence,
      aptitude_vec: data.aptitudeVec ? JSON.stringify(data.aptitudeVec) : null,
      values_vec: data.valuesVec ? JSON.stringify(data.valuesVec) : null,
      ranking: data.ranking ? JSON.stringify(data.ranking) : null,
      carrera_1: data.top3[0]?.carrera || "",
      compatibilidad_1: data.top3[0]?.compatibilidad || 0,
      carrera_2: data.top3[1]?.carrera || "",
      compatibilidad_2: data.top3[1]?.compatibilidad || 0,
      carrera_3: data.top3[2]?.carrera || "",
      compatibilidad_3: data.top3[2]?.compatibilidad || 0,
      respuestas_raw: JSON.stringify(data.respuestas),
      riasec_r: data.riasecProfile.R,
      riasec_i: data.riasecProfile.I,
      riasec_a: data.riasecProfile.A,
      riasec_s: data.riasecProfile.S,
      riasec_e: data.riasecProfile.E,
      riasec_c: data.riasecProfile.C,
      requestId: data.requestId,
      esPrueba: data.esPrueba ?? false,
    };

    const { ok, id } = await upsertLead(leadRow);

    if (!ok) {
      return NextResponse.json(
        { error: "Error al guardar el lead. Intenta de nuevo." },
        { status: 500 }
      );
    }

    // 201 si se insertó (id presente), 200 si el email ya existía (upsert)
    return NextResponse.json({ ok: true }, { status: id !== undefined ? 201 : 200 });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
