import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMetrics } from "@/lib/sheets";

export async function GET() {
  // Check admin authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const metrics = await getMetrics();
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}
