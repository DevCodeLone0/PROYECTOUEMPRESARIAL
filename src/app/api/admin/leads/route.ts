import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { deleteLead, getLeads, updateLead, type LeadRow } from "@/lib/supabase";
import { LeadUpdateSchema } from "@/lib/schemas";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Shared admin auth guard for GET, PATCH and DELETE.
 * Returns a 401/403 response when unauthenticated or not admin, or null
 * when the request may proceed.
 */
async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401, headers: NO_STORE }
    );
  }

  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 403, headers: NO_STORE }
    );
  }

  return null;
}

/** Acepta id numérico o string numérica (compat con clientes viejos). */
const LeadIdSchema = z.union([
  z.int().positive(),
  z.string().regex(/^\d+$/).transform(Number),
]);

function parseEsPrueba(raw: string | null): boolean | undefined {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const archetype = searchParams.get("archetype") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    // Fechas en formato YYYY-MM-DD; inválidas → 400 (evita 500 de PostgREST)
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if ((dateFrom && !dateRe.test(dateFrom)) || (dateTo && !dateRe.test(dateTo))) {
      return NextResponse.json(
        { error: "Formato de fecha inválido. Usa YYYY-MM-DD." },
        { status: 400, headers: NO_STORE }
      );
    }

    const modality = searchParams.get("modality") || "";
    const estado = searchParams.get("estado") || "";
    const esPrueba = parseEsPrueba(searchParams.get("esPrueba"));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    // pageSize: default 20, clamped to [1, 1000] (exports fetch pageSize=1000)
    const rawPageSize = searchParams.get("pageSize");
    const parsedPageSize = rawPageSize
      ? parseInt(rawPageSize, 10)
      : 20;
    const pageSize = Number.isFinite(parsedPageSize)
      ? Math.min(1000, Math.max(1, parsedPageSize))
      : 20;

    // Filtros reales server-side en Postgres
    const { leads, total } = await getLeads({
      search,
      archetype,
      estado,
      dateFrom,
      dateTo,
      modality,
      esPrueba,
      page,
      pageSize,
    });

    const leadsResponse = leads.map((l: LeadRow) => ({
      id: l.id,
      nombre: l.nombre,
      email: l.email,
      celular: l.celular,
      arquetipo: l.arquetipo,
      modality: l.modality,
      confidence: l.confidence,
      esPrueba: l.esPrueba,
      compatibilidad_1: l.compatibilidad_1,
      timestamp: l.timestamp,
      consentimiento: l.consentimiento,
      puntaje_intereses: l.puntaje_intereses,
      puntaje_personalidad: l.puntaje_personalidad,
      puntaje_habilidades: l.puntaje_habilidades,
      puntaje_motivacion: l.puntaje_motivacion,
      carrera_1: l.carrera_1,
      carrera_2: l.carrera_2,
      carrera_3: l.carrera_3,
      compatibilidad_2: l.compatibilidad_2,
      compatibilidad_3: l.compatibilidad_3,
      respuestas_raw: l.respuestas_raw,
      riasec_r: l.riasec_r,
      riasec_i: l.riasec_i,
      riasec_a: l.riasec_a,
      riasec_s: l.riasec_s,
      riasec_e: l.riasec_e,
      riasec_c: l.riasec_c,
      estado: l.estado,
      notas: l.notas,
      actualizado_en: l.actualizado_en,
    }));

    return NextResponse.json(
      {
        leads: leadsResponse,
        total,
        page,
      },
      { headers: NO_STORE }
    );
  } catch (err) {
    console.error("[api/admin/leads] GET falló", {
      error: err instanceof Error ? err.message : String(err),
      url: request.url,
    });
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400, headers: NO_STORE }
      );
    }
    const result = LeadUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400, headers: NO_STORE }
      );
    }

    const { id, estado, notas } = result.data;
    const { ok } = await updateLead(id, { estado, notas });
    if (!ok) {
      return NextResponse.json(
        { error: "Error al actualizar el lead" },
        { status: 500, headers: NO_STORE }
      );
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (err) {
    console.error("[api/admin/leads] PATCH falló", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400, headers: NO_STORE }
      );
    }
    const result = z.object({ id: LeadIdSchema }).safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400, headers: NO_STORE }
      );
    }

    const { ok, deleted } = await deleteLead(result.data.id);
    if (!ok) {
      return NextResponse.json(
        { error: "Error al eliminar el lead" },
        { status: 500, headers: NO_STORE }
      );
    }
    if (!deleted) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404, headers: NO_STORE }
      );
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (err) {
    console.error("[api/admin/leads] DELETE falló", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500, headers: NO_STORE }
    );
  }
}
