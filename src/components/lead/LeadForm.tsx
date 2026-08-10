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
}

export default function LeadForm({
  scores,
  riasecProfile,
  arquetipo,
  top3,
  respuestas,
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
        <div className="text-6xl animate-float">🎉</div>
        <h3 className="text-2xl font-bold text-[#0a0a0a]">
          ¡Gracias, {formData.nombre}!
        </h3>
        <p className="text-gray-500 leading-relaxed">
          El equipo de admisiones de Uniempresarial te contactará pronto.
        </p>
        <a
          href="/resultados"
          className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white font-bold px-8 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
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
        <h3 className="text-xl font-bold text-[#0a0a0a]">
          ¿Te gustó tu resultado?
        </h3>
        <p className="text-sm text-gray-400 mt-1">Déjanos tus datos para recibir orientación personalizada</p>
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#0a0a0a]">
          Nombre completo
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          className="w-full p-4 rounded-xl bg-white border-2 border-gray-100 text-[#0a0a0a] placeholder-gray-300 focus:border-[#D51933] focus:outline-none transition-colors text-base"
          placeholder="Tu nombre"
        />
        {errors.nombre && (
          <p className="text-sm text-red-500">{errors.nombre}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#0a0a0a]">
          Correo electrónico
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full p-4 rounded-xl bg-white border-2 border-gray-100 text-[#0a0a0a] placeholder-gray-300 focus:border-[#D51933] focus:outline-none transition-colors text-base"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Celular */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#0a0a0a]">
          Celular
        </label>
        <input
          type="tel"
          value={formData.celular}
          onChange={(e) => handleChange("celular", e.target.value)}
          className="w-full p-4 rounded-xl bg-white border-2 border-gray-100 text-[#0a0a0a] placeholder-gray-300 focus:border-[#D51933] focus:outline-none transition-colors text-base"
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
        className="w-full py-4 rounded-xl font-bold bg-[#0a0a0a] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {isSubmitting ? "Enviando..." : "Enviar mis datos"}
      </button>
    </form>
  );
}
