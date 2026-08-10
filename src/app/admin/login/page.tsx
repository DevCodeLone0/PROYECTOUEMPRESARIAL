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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#00ff88] to-[#D51933] rounded-2xl flex items-center justify-center font-bold text-xl text-black">
              UF
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Panel</h1>
          <p className="text-sm text-white/30 mt-2">
            Inicia sesión para gestionar leads
          </p>
        </div>

        {/* Form — Light card on dark (Chaptr style) */}
        <div className="bg-[#fafafa] rounded-3xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#0a0a0a]">Correo</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-xl bg-white border-2 border-gray-100 text-[#0a0a0a] placeholder-gray-300 focus:border-[#D51933] focus:outline-none transition-colors"
                placeholder="admin@uniempresarial.edu.co"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#0a0a0a]">Contraseña</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-xl bg-white border-2 border-gray-100 text-[#0a0a0a] placeholder-gray-300 focus:border-[#D51933] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-500 text-center"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold bg-[#0a0a0a] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-white/25 hover:text-[#0033A5] transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
