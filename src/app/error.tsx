"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-5xl">😕</div>
        <h1 className="text-3xl font-bold text-white">Algo salió mal</h1>
        <p className="text-white/50 leading-relaxed">
          Ocurrió un error inesperado. Intenta de nuevo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-3 bg-white text-[#0a0a0a] font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-105"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
