"use client";

import { useState } from "react";
import { LeadFormSchema } from "@/lib/schemas";

interface LeadFormProps {
  scores: {
    intereses: number;
    personalidad: number;
    habilidades: number;
    motivacion: number;
  };
  riasecProfile: { R: number; I: number; A: number; S: number; E: number; C: number };
  arquetipo: string;
  top3: { carrera: string; compatibilidad: number }[];
  respuestas: Record<string, string | number>;
  /** Modo prueba (?prueba=1): marca el lead como es_prueba=true en la BD */
  esPrueba?: boolean;
}

export default function LeadForm({
  scores,
  riasecProfile,
  arquetipo,
  top3,
  respuestas,
  esPrueba = false,
}: LeadFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    celular: "",
    consentimiento: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const result = LeadFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        respuestas,
        scores,
        riasecProfile,
        arquetipo,
        top3,
        // Idempotencia: mismo requestId no duplica en la BD
        requestId:
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        // Modo prueba: el form real nunca envía este campo (la BD aplica false)
        ...(esPrueba ? { esPrueba: true } : {}),
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          data.errors.forEach((err: { path?: string[]; message: string }) => {
            const field = err.path?.[0];
            if (field) fieldErrors[field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setSubmitError(data.error || "Error al enviar. Intenta de nuevo.");
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="w-20 h-20 mx-auto rounded-3xl brand-gradient flex items-center justify-center shadow-[0_0_30px_rgba(213,25,51,0.3)] animate-pop-in">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900">
          ¡Gracias, {formData.nombre}!
        </h3>
        <p className="text-slate-500 text-lg leading-relaxed">
          El equipo de admisiones de Uniempresarial te contactará pronto.
        </p>
        <a
          href="/resultados"
          className="inline-flex items-center gap-2 brand-gradient text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#D51933]/30"
        >
          Ver mis resultados
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900">
          ¿Te gustó tu resultado?
        </h3>
        <p className="text-base text-slate-500 mt-1">Déjanos tus datos para recibir orientación personalizada</p>
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-base font-semibold text-slate-900">
          Nombre completo
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933] focus:outline-none focus:ring-2 focus:ring-[#D51933]/20 transition-all text-lg"
          placeholder="Tu nombre"
        />
        {errors.nombre && (
          <p className="text-sm text-red-500">{errors.nombre}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-base font-semibold text-slate-900">
          Correo electrónico
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933] focus:outline-none focus:ring-2 focus:ring-[#D51933]/20 transition-all text-lg"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Celular */}
      <div className="space-y-2">
        <label className="block text-base font-semibold text-slate-900">
          Celular
        </label>
        <input
          type="tel"
          value={formData.celular}
          onChange={(e) => handleChange("celular", e.target.value)}
          className="w-full p-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#D51933] focus:outline-none focus:ring-2 focus:ring-[#D51933]/20 transition-all text-lg"
          placeholder="3XX XXX XXXX"
        />
        {errors.celular && (
          <p className="text-sm text-red-500">{errors.celular}</p>
        )}
      </div>

      {/* Consent checkbox */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.consentimiento}
            onChange={(e) => handleChange("consentimiento", e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-200 bg-white text-[#D51933] focus:ring-[#D51933]"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">
              Acepto el tratamiento de mis datos personales
            </strong>{" "}
            por parte de la Fundación Universitaria Empresarial de la CCB
            (Uniempresarial), con NIT 830.084.876-6, para las siguientes
            finalidades: contacto por parte del equipo de admisiones sobre
            programas académicos, envío de información sobre eventos,
            convocatorias y procesos de admisión, y seguimiento del proceso de
            orientación vocacional. Mis datos serán tratados conforme a la{" "}
            <strong className="text-gray-700">Ley 1581 de 2012</strong> y su
            decreto reglamentario 1377 de 2013. Tengo derecho a acceder,
            rectificar, suprimir y/o portar mis datos personales en cualquier
            momento, escribiendo a{" "}
            <a
              href="mailto:admisiones@uniempresarial.edu.co"
              className="text-[#D51933] hover:underline"
            >
              admisiones@uniempresarial.edu.co
            </a>
            .
          </span>
        </label>
        {errors.consentimiento && (
          <p className="text-sm text-red-500">{errors.consentimiento}</p>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-500">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-bold brand-gradient text-white text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#D51933]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando..." : "Enviar mis datos"}
      </button>
    </form>
  );
}
