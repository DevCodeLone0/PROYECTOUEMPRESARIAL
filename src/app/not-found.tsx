import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="text-7xl font-extrabold tracking-tight">
          <span className="gradient-text">404</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Página no encontrada
        </h1>
        <p className="text-white/50 max-w-md mx-auto leading-relaxed">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-white text-[#0a0a0a] font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:bg-[#0033A5] hover:text-white hover:scale-105"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
