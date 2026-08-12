import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMetrics } from "@/lib/supabase";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
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
    const metrics = await getMetrics();
    return NextResponse.json(metrics, { headers: NO_STORE });
  } catch (err) {
    console.error("[api/admin/metrics] GET falló", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500, headers: NO_STORE }
    );
  }
}
