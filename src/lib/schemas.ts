import { z } from "zod";

/**
 * Colombian phone regex: 10 digits starting with 3 (mobile),
 * or 7-10 digits (landline), or international with +country code
 */
const colombianPhoneRegex = /^(\+?57)?[3][0-9]{9}$|^[1-9][0-9]{6,9}$/;

export const LeadFormSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { error: "El nombre no puede tener más de 100 caracteres" }),
  email: z.email({ error: "Ingresa un correo electrónico válido" }),
  celular: z
    .string()
    .regex(colombianPhoneRegex, { error: "Ingresa un número de teléfono válido" }),
  consentimiento: z.literal(true, {
    error: "Debes aceptar el tratamiento de datos personales para continuar",
  }),
});

export type LeadFormData = z.infer<typeof LeadFormSchema>;

export const AnswerSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()])
);

export type AnswerRecord = z.infer<typeof AnswerSchema>;

export const ScoringResultSchema = z.object({
  programId: z.string(),
  compatibility: z.number().min(0).max(100),
  dimensionScores: z.object({
    intereses: z.number(),
    personalidad: z.number(),
    habilidades: z.number(),
    motivacion: z.number(),
  }),
});

export type ScoringResultData = z.infer<typeof ScoringResultSchema>;

export const LeadPayloadSchema = z.object({
  nombre: LeadFormSchema.shape.nombre,
  email: LeadFormSchema.shape.email,
  celular: LeadFormSchema.shape.celular,
  consentimiento: LeadFormSchema.shape.consentimiento,
  respuestas: AnswerSchema,
  scores: z.object({
    intereses: z.number(),
    personalidad: z.number(),
    habilidades: z.number(),
    motivacion: z.number(),
  }),
  arquetipo: z.string(),
  top3: z.array(
    z.object({
      carrera: z.string(),
      compatibilidad: z.number(),
    })
  ),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;
