import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeads, type LeadRow } from "@/lib/sheets";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  // Check admin authentication
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

  try {
    const leads = await getLeads();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase() || "";
    const archetype = searchParams.get("archetype") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const modality = searchParams.get("modality") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    // pageSize: default 20, clamped to [1, 1000] (exports fetch pageSize=1000)
    const rawPageSize = searchParams.get("pageSize");
    const parsedPageSize = rawPageSize
      ? parseInt(rawPageSize, 10)
      : 20;
    const pageSize = Number.isFinite(parsedPageSize)
      ? Math.min(1000, Math.max(1, parsedPageSize))
      : 20;

    // Filter leads
    let filtered = leads;

    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.nombre.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search)
      );
    }

    if (archetype) {
      filtered = filtered.filter((l) => l.arquetipo === archetype);
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (l) => new Date(l.timestamp) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (l) => new Date(l.timestamp) <= new Date(dateTo + "T23:59:59")
      );
    }

    // Note: modality filter would require cross-referencing programs data
    // For now, filter by career name containing "Virtual" if modality is virtual
    if (modality === "virtual") {
      filtered = filtered.filter((l) => l.carrera_1.includes("Virtual"));
    } else if (modality === "presencial") {
      filtered = filtered.filter((l) => !l.carrera_1.includes("Virtual"));
    }

    // Sort by date descending
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    // Map to response shape
    const leadsResponse = paginated.map((l: LeadRow, index: number) => ({
      id: `lead-${start + index}`,
      nombre: l.nombre,
      email: l.email,
      celular: l.celular,
      arquetipo: l.arquetipo,
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
    }));

    return NextResponse.json(
      {
        leads: leadsResponse,
        total,
        page,
      },
      { headers: NO_STORE }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500, headers: NO_STORE }
    );
  }
}
