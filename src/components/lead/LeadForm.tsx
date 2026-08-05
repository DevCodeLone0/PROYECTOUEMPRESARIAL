"use client";

import { useState } from "react";
import { LeadFormSchema, type LeadFormData } from "@/lib/schemas";

interface LeadFormProps {
  scores: {
    intereses: number;
    personalidad: number;
    habilidades: number;
    motivacion: number;
  };
  arquetipo: string;
  top3: { carrera: string; compatibilidad: number }[];
  respuestas: Record<string, string | number>;
}

export default function LeadForm({
  scores,
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
    // Clear error on change
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

    // Validate with Zod
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
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 md:p-8 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-bold text-green-400">
          ¡Gracias, {formData.nombre}!
        </h3>
        <p className="text-white/60 leading-relaxed">
          El equipo de admisiones de Uniempresarial te contactará pronto.
        </p>
        <p className="text-sm text-white/40">
          ¿Preguntas? Escríbenos a{" "}
          <a
            href="mailto:admisiones@uniempresarial.edu.co"
            className="text-violet-400 hover:underline"
          >
            admisiones@uniempresarial.edu.co
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-xl font-bold text-white">
        ¿Te gustó tu resultado? Déjanos tus datos
      </h3>

      {/* Nombre */}
      <div>
        <label className="block text-sm text-white/60 mb-1">Nombre completo</label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none transition-colors"
          placeholder="Tu nombre"
        />
        {errors.nombre && (
          <p className="text-sm text-red-400 mt-1">{errors.nombre}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm text-white/60 mb-1">Correo electrónico</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none transition-colors"
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="text-sm text-red-400 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Celular */}
      <div>
        <label className="block text-sm text-white/60 mb-1">Celular</label>
        <input
          type="tel"
          value={formData.celular}
          onChange={(e) => handleChange("celular", e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none transition-colors"
          placeholder="3XX XXX XXXX"
        />
        {errors.celular && (
          <p className="text-sm text-red-400 mt-1">{errors.celular}</p>
        )}
      </div>

      {/* Consent checkbox */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.consentimiento}
            onChange={(e) => handleChange("consentimiento", e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
          />
          <span className="text-xs text-white/50 leading-relaxed">
            <strong className="text-white/70">
              Acepto el tratamiento de mis datos personales
            </strong>{" "}
            por parte de la Fundación Universitaria Empresarial de la CCB
            (Uniempresarial), con NIT 830.084.876-6, para las siguientes
            finalidades: contacto por parte del equipo de admisiones sobre
            programas académicos, envío de información sobre eventos,
            convocatorias y procesos de admisión, y seguimiento del proceso de
            orientación vocacional. Mis datos serán tratados conforme a la{" "}
            <strong className="text-white/70">Ley 1581 de 2012</strong> y su
            decreto reglamentario 1377 de 2013. Tengo derecho a acceder,
            rectificar, suprimir y/o portar mis datos personales en cualquier
            momento, escribiendo a{" "}
            <a
              href="mailto:admisiones@uniempresarial.edu.co"
              className="text-violet-400 hover:underline"
            >
              admisiones@uniempresarial.edu.co
            </a>
            .
          </span>
        </label>
        {errors.consentimiento && (
          <p className="text-sm text-red-400">{errors.consentimiento}</p>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando..." : "Enviar mis datos"}
      </button>
    </form>
  );
}
