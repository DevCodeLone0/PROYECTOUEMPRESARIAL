"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.code === "throttled") {
          setError("Demasiados intentos. Intenta en unos minutos.");
        } else {
          setError("Correo o contraseña incorrectos");
        }
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3F0] via-white to-[#E8EEFF] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Blobs de marca */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#D51933]/10 blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-[520px] h-[520px] rounded-full bg-[#0033A5]/15 blur-[130px]" />
      </div>
      <div className="w-full max-w-sm space-y-8 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D51933] to-[#0033A5] rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-[#D51933]/25">
              UF
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-2">
            Inicia sesión para gestionar leads
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/70">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Correo</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933] focus:outline-none transition-colors"
                placeholder="admin@uniempresarial.edu.co"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Contraseña</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 text-center"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#D51933] to-[#0033A5] text-white shadow-lg shadow-[#D51933]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-[#0033A5] transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
