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
        setError("Correo o contraseña incorrectos");
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold text-xl">
              UF
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-white/40 mt-2">
            Inicia sesión para gestionar leads
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="admin@uniempresarial.edu.co"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
